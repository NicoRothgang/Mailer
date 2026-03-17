/**
 * Gmail provider adapter.
 * Uses Gmail REST API (not the JS client library to keep dependencies minimal).
 * OAuth scopes required:
 *   https://www.googleapis.com/auth/gmail.readonly
 *   https://www.googleapis.com/auth/gmail.modify
 */
import type { ProviderAdapter, SyncContext, SyncResult, TokenSet, ListMessagesOptions, ProviderMessagePage, NormalizedMessage } from "./types";
import { classifyMessage } from "./classifier";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { emailToDomain } from "@/lib/utils";
import { MessageCategory } from "@prisma/client";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";
const GOOGLE_AUTH = "https://oauth2.googleapis.com";

function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/gmail/callback`,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function exchangeCode(code: string, redirectUri: string): Promise<TokenSet> {
  const res = await fetch(`${GOOGLE_AUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  const data = await res.json();

  // Get user info
  const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const info = await infoRes.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    email: info.email,
    displayName: info.name,
    scopes: (data.scope ?? "").split(" "),
  };
}

async function refreshAccessToken(refreshToken: string): Promise<Omit<TokenSet, "email" | "displayName">> {
  const res = await fetch(`${GOOGLE_AUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  const data = await res.json();

  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scopes: (data.scope ?? "").split(" "),
  };
}

async function apiGet(path: string, accessToken: string) {
  const res = await fetch(`${GMAIL_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Gmail API error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function listMessages(accessToken: string, opts: ListMessagesOptions = {}): Promise<ProviderMessagePage> {
  const params = new URLSearchParams({
    maxResults: String(opts.maxResults ?? 50),
    ...(opts.pageToken ? { pageToken: opts.pageToken } : {}),
    ...(opts.after ? { q: `after:${Math.floor(opts.after.getTime() / 1000)}` } : {}),
  });

  const data = await apiGet(`/users/me/messages?${params}`, accessToken);
  const messageIds: string[] = (data.messages ?? []).map((m: { id: string }) => m.id);

  const messages: NormalizedMessage[] = [];
  // Fetch message details in batches
  const BATCH = 10;
  for (let i = 0; i < messageIds.length; i += BATCH) {
    const batch = messageIds.slice(i, i + BATCH);
    const details = await Promise.allSettled(
      batch.map((id) => apiGet(`/users/me/messages/${id}?format=metadata&metadataHeaders=From,To,Subject,Date,List-Unsubscribe,List-Id,Precedence,X-Mailer`, accessToken))
    );
    for (const result of details) {
      if (result.status === "fulfilled") {
        const normalized = normalizeGmailMessage(result.value);
        if (normalized) messages.push(normalized);
      }
    }
  }

  return {
    messages,
    nextPageToken: data.nextPageToken,
    totalEstimate: data.resultSizeEstimate,
  };
}

function normalizeGmailMessage(raw: Record<string, unknown>): NormalizedMessage | null {
  try {
    const headers: Record<string, string> = {};
    for (const h of (raw.payload as { headers?: Array<{ name: string; value: string }> })?.headers ?? []) {
      headers[h.name.toLowerCase()] = h.value;
    }

    const from = headers["from"] ?? "";
    const emailMatch = from.match(/<([^>]+)>/) ?? from.match(/([^\s]+@[^\s]+)/);
    const fromEmail = emailMatch ? emailMatch[1].trim() : from.trim();
    const nameMatch = from.match(/^([^<]+)</);
    const fromName = nameMatch ? nameMatch[1].trim().replace(/^"|"$/g, "") : null;

    const dateHeader = headers["date"];
    const date = dateHeader ? new Date(dateHeader) : new Date();
    const internalDate = raw.internalDate ? new Date(Number(raw.internalDate)) : date;

    const labels = (raw.labelIds as string[] | undefined) ?? [];

    return {
      providerMessageId: raw.id as string,
      subject: headers["subject"] ?? null,
      fromEmail,
      fromName,
      fromDomain: emailToDomain(fromEmail),
      toEmails: (headers["to"] ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
      sentAt: date,
      receivedAt: internalDate,
      isRead: !labels.includes("UNREAD"),
      snippet: (raw.snippet as string | undefined) ?? null,
      labels,
      headers,
    };
  } catch {
    return null;
  }
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
      const encrypted = encrypt(accessToken);
      await db.providerConnection.update({
        where: { id: ctx.connectionId },
        data: {
          accessTokenEnc: encrypted,
          tokenExpiry: refreshed.expiresAt,
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Token refresh failed";
      await db.providerConnection.update({ where: { id: ctx.connectionId }, data: { status: "EXPIRED" } });
      throw new Error(msg);
    }
  }

  // Fetch up to 200 messages per sync (MVP limit)
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

        // Upsert sender
        const sender = await db.sender.upsert({
          where: { userId_domain: { userId: ctx.userId, domain: msg.fromDomain } },
          create: {
            userId: ctx.userId,
            domain: msg.fromDomain,
            primaryEmail: msg.fromEmail,
            brandName: null,
            totalMessages: 1,
            lastMessageAt: msg.sentAt,
            categories: classification.category ? [classification.category] : [],
          },
          update: {
            totalMessages: { increment: 1 },
            lastMessageAt: msg.sentAt,
          },
        });

        // Upsert email message (skip if already exists)
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
            snippet: msg.snippet?.slice(0, 200) ?? null,
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
          update: {}, // Don't overwrite existing messages
        });

        const isNew = created.createdAt.getTime() === created.createdAt.getTime();

        // Update newsletter entity
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
            update: {
              messageCount: { increment: 1 },
              lastMessageAt: msg.sentAt,
              unsubscribeUrl: classification.unsubscribeUrl ?? undefined,
            },
          });
        }

        // Create risk entity for high-risk messages
        if (classification.riskScore >= 25 && classification.riskFactors.length > 0) {
          await db.riskEntity.upsert({
            where: { id: `${ctx.connectionId}-${msg.providerMessageId}` },
            create: {
              id: `${ctx.connectionId}-${msg.providerMessageId}`,
              userId: ctx.userId,
              messageId: created.id,
              riskScore: classification.riskScore,
              riskFactors: JSON.parse(JSON.stringify(classification.riskFactors)),
            },
            update: {},
          }).catch(() => {
            // Risk entity may already exist, ignore
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

export const gmailAdapter: ProviderAdapter = {
  provider: "GMAIL",
  getAuthorizationUrl: buildAuthUrl,
  exchangeCode,
  refreshAccessToken,
  listMessages,
  syncMessages,
};
