import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { gmailAdapter } from "@/lib/providers/gmail";
import { encrypt } from "@/lib/crypto";
import type { OAuthState } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  // Create CSRF state token
  const state: OAuthState = {
    userId: session.user.id,
    provider: "GMAIL",
    nonce: crypto.randomUUID(),
  };

  const stateEncrypted = encrypt(JSON.stringify(state));
  const stateParam = Buffer.from(stateEncrypted).toString("base64url");

  const authUrl = gmailAdapter.getAuthorizationUrl(stateParam);

  // Store state in a short-lived cookie for CSRF validation
  const response = NextResponse.redirect(authUrl);
  response.cookies.set("oauth_state", stateParam, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
