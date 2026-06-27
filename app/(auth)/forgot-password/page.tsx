import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md gradient-primary">
            <ShieldCheck className="size-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">
            SkillSync
          </span>
        </div>

        <span className="inline-flex size-11 items-center justify-center rounded-lg border border-border bg-surface text-primary">
          <Mail className="size-5" />
        </span>

        <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Password recovery isn&apos;t wired up yet. For now, reach out to
          support and we&apos;ll help you get back in.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
