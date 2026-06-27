import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "@/auth.config";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    // Edge-safe providers (Google) come from authConfig; Credentials is
    // added here because its authorize() touches the DB and bcrypt.
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect();

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
        }).select("+password");

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          primaryDomain: user.primaryDomain ?? null,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Upsert the Google account into MongoDB on first sign-in.
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        await dbConnect();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            name: user.name ?? user.email,
            email: user.email,
            image: user.image ?? undefined,
            emailVerified: new Date(),
          });
        }
      }
      return true;
    },
    // DB-aware token enrichment (Node only). Credentials already returns the
    // extra fields; Google sign-ins are looked up here, and `update` refreshes
    // onboarding state after the user finishes onboarding.
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id ?? token.id;
        token.primaryDomain = user.primaryDomain ?? null;
        token.onboardingCompleted = Boolean(user.onboardingCompleted);

        // Google users arrive without our custom fields — hydrate from DB.
        if (user.onboardingCompleted === undefined && token.email) {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.primaryDomain = dbUser.primaryDomain ?? null;
            token.onboardingCompleted = dbUser.onboardingCompleted;
          }
        }
      }

      if (trigger === "update" && session) {
        if (session.primaryDomain !== undefined) {
          token.primaryDomain = session.primaryDomain;
        }
        if (session.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
      }

      return token;
    },
  },
});
