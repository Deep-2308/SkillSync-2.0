import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import type { PrimaryDomain } from "@/lib/constants";

/**
 * Edge-safe NextAuth configuration.
 *
 * This file MUST NOT import anything that relies on Node APIs (mongoose,
 * bcryptjs, etc.) because it is consumed by the middleware, which runs on
 * the Edge runtime. The Credentials provider, the Google upsert logic, and
 * the DB-aware jwt callback all live in `auth.ts` instead.
 *
 * The callbacks here only shuttle already-decoded token data into the
 * session, which is exactly what middleware needs to read auth state.
 */
export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  basePath: "/api/auth",
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Base passthrough. The DB-aware version in auth.ts overrides this on
    // the Node side; middleware only ever decodes an existing token.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.id;
        if (user.primaryDomain !== undefined) {
          token.primaryDomain = user.primaryDomain;
        }
        if (user.onboardingCompleted !== undefined) {
          token.onboardingCompleted = user.onboardingCompleted;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? session.user.id;
        session.user.primaryDomain =
          (token.primaryDomain as PrimaryDomain | null | undefined) ?? null;
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted);
      }
      return session;
    },
    // Restrictions are enforced in API routes, so always allow at this layer.
    async signIn() {
      return true;
    },
    // Keep redirects on the same origin; onboarding-vs-dashboard routing is
    // handled in middleware where the token is available.
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
