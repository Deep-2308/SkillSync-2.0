import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthPanel initialTab="signup" />
    </Suspense>
  );
}
