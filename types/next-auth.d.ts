import type { DefaultSession } from "next-auth";
import type { PrimaryDomain } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      primaryDomain?: PrimaryDomain | null;
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    primaryDomain?: PrimaryDomain | null;
    onboardingCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    primaryDomain?: PrimaryDomain | null;
    onboardingCompleted?: boolean;
  }
}
