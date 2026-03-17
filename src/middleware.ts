import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const ONBOARDING_ROUTE = "/onboarding";
const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export default auth((req: NextRequest & { auth: { user?: { id?: string; onboardingCompleted?: boolean } } | null }) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isAuthRoute = AUTH_ROUTES.includes(nextUrl.pathname);
  const isOnboardingRoute = nextUrl.pathname === ONBOARDING_ROUTE;
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/connections") ||
    nextUrl.pathname.startsWith("/newsletters") ||
    nextUrl.pathname.startsWith("/subscriptions") ||
    nextUrl.pathname.startsWith("/spam") ||
    nextUrl.pathname.startsWith("/senders") ||
    nextUrl.pathname.startsWith("/insights") ||
    nextUrl.pathname.startsWith("/settings");

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    const onboardingCompleted = session?.user?.onboardingCompleted ?? false;
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL(ONBOARDING_ROUTE, nextUrl));
    }
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  // Protect dashboard routes
  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect onboarding route
  if (isOnboardingRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
