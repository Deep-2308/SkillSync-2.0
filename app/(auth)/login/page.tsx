import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthPanel initialTab="login" />
    </Suspense>
  );
}
