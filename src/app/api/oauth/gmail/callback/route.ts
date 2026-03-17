import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { gmailAdapter } from "@/lib/providers/gmail";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";
import type { OAuthState } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const REDIRECT_URI = `${APP_URL}/api/oauth/gmail/callback`;

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", APP_URL));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !stateParam) {
    const msg = error === "access_denied" ? "Zugriff verweigert" : "Verbindung fehlgeschlagen";
    return NextResponse.redirect(new URL(`/connections?error=${encodeURIComponent(msg)}`, APP_URL));
  }

  // Validate CSRF state
  const storedState = request.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== stateParam) {
    return NextResponse.redirect(new URL("/connections?error=invalid_state", APP_URL));
  }

  let state: OAuthState;
  try {
    const decrypted = decrypt(Buffer.from(stateParam, "base64url").toString());
    state = JSON.parse(decrypted) as OAuthState;
  } catch {
    return NextResponse.redirect(new URL("/connections?error=invalid_state", APP_URL));
  }

  if (state.userId !== session.user.id || state.provider !== "GMAIL") {
    return NextResponse.redirect(new URL("/connections?error=state_mismatch", APP_URL));
  }

  try {
    const tokenSet = await gmailAdapter.exchangeCode(code, REDIRECT_URI);

    // Store encrypted tokens
    await db.providerConnection.upsert({
      where: {
        userId_provider_email: {
          userId: session.user.id,
          provider: "GMAIL",
          email: tokenSet.email,
        },
      },
      create: {
        userId: session.user.id,
        provider: "GMAIL",
        email: tokenSet.email,
        displayName: tokenSet.displayName,
        accessTokenEnc: encrypt(tokenSet.accessToken),
        refreshTokenEnc: tokenSet.refreshToken ? encrypt(tokenSet.refreshToken) : null,
        tokenExpiry: tokenSet.expiresAt,
        scopes: tokenSet.scopes,
        status: "ACTIVE",
      },
      update: {
        accessTokenEnc: encrypt(tokenSet.accessToken),
        refreshTokenEnc: tokenSet.refreshToken ? encrypt(tokenSet.refreshToken) : undefined,
        tokenExpiry: tokenSet.expiresAt,
        scopes: tokenSet.scopes,
        status: "ACTIVE",
        displayName: tokenSet.displayName,
      },
    });

    await db.userActionLog.create({
      data: {
        userId: session.user.id,
        action: "connect_provider",
        targetType: "connection",
        details: { provider: "GMAIL", email: tokenSet.email },
      },
    });

    const redirectTo = state.redirectTo ?? "/connections";
    const successUrl = new URL(redirectTo, APP_URL);
    successUrl.searchParams.set("connected", "gmail");
    const response = NextResponse.redirect(successUrl);
    response.cookies.delete("oauth_state");
    return response;
  } catch (err) {
    console.error("Gmail OAuth callback error:", err);
    // Redirect back to where the OAuth was initiated, preserving the returnTo context
    const errorDest = state.redirectTo ?? "/connections";
    const errorUrl = new URL(errorDest, APP_URL);
    errorUrl.searchParams.set("error", "Verbindung fehlgeschlagen");
    return NextResponse.redirect(errorUrl);
  }
}
