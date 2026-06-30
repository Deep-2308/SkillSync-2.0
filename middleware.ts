import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

// Edge-safe auth instance (no DB / bcrypt imports).
const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/", "/login", "/signup", "/about"];
const AUTH_PAGES = ["/login", "/signup"];

function isProtectedPath(path: string): boolean {
  // Protected pages
  const protectedPrefixes = ["/dashboard", "/skills", "/profile/settings"];
  if (
    protectedPrefixes.some(
      (p) => path === p || path.startsWith(`${p}/`)
    )
  ) {
    return true;
  }
  // Project creation is protected (browsing/viewing projects is not)
  if (path === "/projects/create" || path.startsWith("/projects/create/")) {
    return true;
  }
  // All API routes except the NextAuth handlers
  if (path.startsWith("/api") && !path.startsWith("/api/auth")) {
    return true;
  }
  return false;
}

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!req.auth?.user;

  // Let NextAuth's own endpoints through untouched.
  if (path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isApi = path.startsWith("/api");
  const isAuthPage = AUTH_PAGES.includes(path);
  const onboardingCompleted = Boolean(req.auth?.user?.onboardingCompleted);

  // Authenticated users shouldn't see login/signup.
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Block protected routes for anonymous users.
  if (!isLoggedIn && isProtectedPath(path)) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Onboarding gate: signed-in users must finish onboarding before using
  // the app. Skip API routes (they return JSON) and the onboarding page.
  if (
    isLoggedIn &&
    !onboardingCompleted &&
    !isApi &&
    !PUBLIC_PATHS.includes(path) &&
    path !== "/onboarding"
  ) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // Don't keep onboarded users on the onboarding page.
  if (isLoggedIn && onboardingCompleted && path === "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
