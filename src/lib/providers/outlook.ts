/**
 * Microsoft Outlook / Exchange Online provider adapter.
 * Uses Microsoft Graph API with delegated permissions.
 * OAuth scopes required: Mail.Read Mail.ReadWrite offline_access
 */
import type { ProviderAdapter, SyncContext, SyncResult, TokenSet, ListMessagesOptions, ProviderMessagePage, NormalizedMessage } from "./types";
import { classifyMessage } from "./classifier";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { emailToDomain } from "@/lib/utils";

const GRAPH_API = "https://graph.microsoft.com/v1.0";
const MS_AUTH = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? "common"}/oauth2/v2.0`;

function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/outlook/callback`,
    response_type: "code",
    scope: ["Mail.Read", "Mail.ReadWrite", "offline_access", "User.Read"].join(" "),
    response_mode: "query",
    state,
  });
  return `${MS_AUTH}/authorize?${params}`;
}

async function exchangeCode(code: string, redirectUri: string): Promise<TokenSet> {
  const res = await fetch(`${MS_AUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
      client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      scope: "Mail.Read Mail.ReadWrite offline_access User.Read",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  const data = await res.json();

  // Get user profile
  const meRes = await fetch(`${GRAPH_API}/me`, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const me = await meRes.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
    email: me.mail ?? me.userPrincipalName,
    displayName: me.displayName,
    scopes: (data.scope ?? "").split(" "),
  };
}

async function refreshAccessToken(refreshToken: string): Promise<Omit<TokenSet, "email" | "displayName">> {
  const res = await fetch(`${MS_AUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
      client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      scope: "Mail.Read Mail.ReadWrite offline_access",
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  const data = await res.json();

  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
    scopes: (data.scope ?? "").split(" "),
  };
}

async function graphGet(path: string, accessToken: string) {
  const res = await fetch(`${GRAPH_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Graph API error: ${res.status} ${await res.text()}`);
  return res.json();
}

function normalizeGraphMessage(raw: Record<string, unknown>): NormalizedMessage | null {
  try {
    const from = (raw.from as { emailAddress?: { address?: string; name?: string } } | undefined)?.emailAddress;
    const fromEmail = from?.address ?? "";
    const fromName = from?.name ?? null;

    const headers: Record<string, string> = {};
    for (const h of (raw.internetMessageHeaders as Array<{ name: string; value: string }> | undefined) ?? []) {
      headers[h.name.toLowerCase()] = h.value;
    }

    const toRecipients = (raw.toRecipients as Array<{ emailAddress?: { address?: string } }> | undefined) ?? [];
    const toEmails = toRecipients.map((r) => r.emailAddress?.address ?? "").filter(Boolean);

    const sentDate = new Date(raw.sentDateTime as string);
    const receivedDate = new Date(raw.receivedDateTime as string);

    return {
      providerMessageId: raw.id as string,
      subject: (raw.subject as string | null) ?? null,
      fromEmail,
      fromName,
      fromDomain: emailToDomain(fromEmail),
      toEmails,
      sentAt: sentDate,
      receivedAt: receivedDate,
      isRead: (raw.isRead as boolean | undefined) ?? false,
      snippet: (raw.bodyPreview as string | null)?.slice(0, 200) ?? null,
      labels: (raw.categories as string[] | undefined) ?? [],
      headers,
    };
  } catch {
    return null;
  }
}

async function listMessages(accessToken: string, opts: ListMessagesOptions = {}): Promise<ProviderMessagePage> {
  const top = opts.maxResults ?? 50;
  const selectFields = [
    "id", "subject", "from", "toRecipients", "sentDateTime", "receivedDateTime",
    "isRead", "bodyPreview", "categories", "internetMessageHeaders",
  ].join(",");

  let path = `/me/messages?$top=${top}&$select=${selectFields}&$orderby=receivedDateTime desc`;
  if (opts.after) {
    const afterStr = opts.after.toISOString();
    path += `&$filter=receivedDateTime gt ${afterStr}`;
  }
  if (opts.pageToken) {
    // Graph API uses $skipToken encoded in the @odata.nextLink
    path = opts.pageToken;
  }

  const data = await graphGet(path, accessToken);
  const messages: NormalizedMessage[] = (data.value ?? [])
    .map((m: Record<string, unknown>) => normalizeGraphMessage(m))
    .filter((m: NormalizedMessage | null): m is NormalizedMessage => m !== null);

  return {
    messages,
    nextPageToken: data["@odata.nextLink"],
  };
}

async function syncMessages(ctx: SyncContext): Promise<SyncResult> {
  const errors: string[] = [];
  let processed = 0;
  let newMessages = 0;

  let accessToken = ctx.accessToken;

  // Refresh token if expired
  if (ctx.tokenExpiry && ctx.tokenExpiry < new Date() && ctx.refreshToken) {
    try {
      const refreshed = await refreshAccessToken(ctx.refreshToken);
      accessToken = refreshed.accessToken;
      await db.providerConnection.update({
        where: { id: ctx.connectionId },
        data: { accessTokenEnc: encrypt(accessToken), tokenExpiry: refreshed.expiresAt },
      });
    } catch (e) {
      await db.providerConnection.update({ where: { id: ctx.connectionId }, data: { status: "EXPIRED" } });
      throw e;
    }
  }

  let pageToken: string | undefined;
  let totalFetched = 0;
  const MAX_MESSAGES = 200;

  do {
    const page = await listMessages(accessToken, {
      maxResults: Math.min(50, MAX_MESSAGES - totalFetched),
      pageToken,
      after: ctx.lastSyncAt,
    });

    for (const msg of page.messages) {
      try {
        const classification = classifyMessage(msg);

        const sender = await db.sender.upsert({
          where: { userId_domain: { userId: ctx.userId, domain: msg.fromDomain } },
          create: {
            userId: ctx.userId,
            domain: msg.fromDomain,
            primaryEmail: msg.fromEmail,
            totalMessages: 1,
            lastMessageAt: msg.sentAt,
            categories: classification.category ? [classification.category] : [],
          },
          update: { totalMessages: { increment: 1 }, lastMessageAt: msg.sentAt },
        });

        const created = await db.emailMessage.upsert({
          where: { connectionId_providerMessageId: { connectionId: ctx.connectionId, providerMessageId: msg.providerMessageId } },
          create: {
            userId: ctx.userId,
            connectionId: ctx.connectionId,
            providerMessageId: msg.providerMessageId,
            subject: msg.subject,
            fromEmail: msg.fromEmail,
            fromName: msg.fromName,
            fromDomain: msg.fromDomain,
            toEmails: msg.toEmails,
            sentAt: msg.sentAt,
            receivedAt: msg.receivedAt,
            isRead: msg.isRead,
            snippet: msg.snippet,
            labels: msg.labels,
            category: classification.category,
            riskScore: classification.riskScore,
            isNewsletter: classification.isNewsletter,
            isSubscription: classification.isSubscriptionBilling,
            hasListUnsubscribe: classification.hasListUnsubscribe,
            unsubscribeUrl: classification.unsubscribeUrl,
            unsubscribeEmail: classification.unsubscribeEmail,
            listId: classification.listId,
            senderId: sender.id,
          },
          update: {},
        });

        if (classification.isNewsletter) {
          await db.newsletterEntity.upsert({
            where: { userId_senderEmail: { userId: ctx.userId, senderEmail: msg.fromEmail } },
            create: {
              userId: ctx.userId,
              senderEmail: msg.fromEmail,
              senderName: msg.fromName,
              senderId: sender.id,
              messageCount: 1,
              firstMessageAt: msg.sentAt,
              lastMessageAt: msg.sentAt,
              unsubscribeUrl: classification.unsubscribeUrl,
              unsubscribeEmail: classification.unsubscribeEmail,
            },
            update: { messageCount: { increment: 1 }, lastMessageAt: msg.sentAt },
          });
        }

        processed++;
        newMessages++;
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }

    totalFetched += page.messages.length;
    pageToken = page.nextPageToken;
  } while (pageToken && totalFetched < MAX_MESSAGES);

  return { processed, newMessages, errors };
}

export const outlookAdapter: ProviderAdapter = {
  provider: "OUTLOOK",
  getAuthorizationUrl: buildAuthUrl,
  exchangeCode,
  refreshAccessToken,
  listMessages,
  syncMessages,
};
