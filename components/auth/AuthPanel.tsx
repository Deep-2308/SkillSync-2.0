"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User as UserIcon,
  GraduationCap,
  Wrench,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginSchema,
  authSignupSchema,
  type LoginInput,
  type AuthSignupInput,
} from "@/lib/validations";

type Tab = "login" | "signup";

const TESTIMONIALS = [
  {
    quote: "Got my first freelance client using my SkillSync badges.",
    author: "Maya R.",
    role: "Frontend Dev",
  },
  {
    quote: "Found my co-founder here. We shipped in 6 weeks.",
    author: "Devon K.",
    role: "Product Builder",
  },
  {
    quote: "Finally a portfolio that proves what I can actually do.",
    author: "Sam T.",
    role: "Backend Dev",
  },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export function AuthPanel({ initialTab = "login" }: { initialTab?: Tab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || undefined;

  const [tab, setTab] = useState<Tab>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Login form ──────────────────────────────────────────────────────────
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // ── Signup form ─────────────────────────────────────────────────────────
  const signupForm = useForm<AuthSignupInput>({
    resolver: zodResolver(authSignupSchema),
    defaultValues: { name: "", email: "", password: "", role: "Builder" },
  });

  const selectedRole = signupForm.watch("role");

  function switchTab(next: Tab) {
    setFormError(null);
    setTab(next);
  }

  async function routeAfterAuth() {
    const session = await getSession();
    if (callbackUrl) {
      router.push(callbackUrl);
    } else if (session?.user?.onboardingCompleted) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
    router.refresh();
  }

  async function onLogin(values: LoginInput) {
    setFormError(null);
    const res = await signIn("credentials", { ...values, redirect: false });
    if (res?.error) {
      setFormError("Invalid email or password. Please try again.");
      return;
    }
    await routeAfterAuth();
  }

  async function onSignup(values: AuthSignupInput) {
    setFormError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "Could not create your account.");
        return;
      }

      // Auto sign-in after successful registration.
      const signInRes = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (signInRes?.error) {
        // Account created but auto-login failed — send to login tab.
        setFormError("Account created. Please log in to continue.");
        switchTab("login");
        return;
      }
      // New users always go through onboarding.
      router.push("/onboarding");
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: callbackUrl ?? "/onboarding" });
  }

  const isLogin = tab === "login";

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[45fr_55fr]">
      {/* ── Left branding panel ── */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-surface p-10 lg:flex">
        <div className="absolute -left-24 top-1/3 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 size-72 rounded-full bg-ai/10 blur-3xl" />

        <div className="relative flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md gradient-primary">
            <ShieldCheck className="size-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">
            SkillSync
          </span>
        </div>

        <div className="relative space-y-8">
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight">
            The platform where skills are{" "}
            <span className="text-primary">proven</span>, not claimed.
          </h1>
          <p className="max-w-md text-text-muted">
            Join thousands of builders who earn real credibility through
            AI-verified challenges.
          </p>

          <div className="space-y-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.author}
                className="glass-card rounded-lg p-4 text-sm"
              >
                <blockquote className="text-text">“{t.quote}”</blockquote>
                <figcaption className="mt-2 text-xs uppercase tracking-wider text-text-muted">
                  {t.author} · {t.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-text-muted">
          © {new Date().getFullYear()} SkillSync. Prove it.
        </p>
      </aside>

      {/* ── Right form panel ── */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid size-9 place-items-center rounded-md gradient-primary">
              <ShieldCheck className="size-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">
              SkillSync
            </span>
          </div>

          <h2 className="font-heading text-2xl font-bold tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {isLogin
              ? "Log in to continue proving your skills."
              : "Start earning verifiable proof of what you can do."}
          </p>

          {/* Tab toggle */}
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => switchTab("login")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors",
                isLogin
                  ? "bg-surface-2 text-text"
                  : "text-text-muted hover:text-text"
              )}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchTab("signup")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors",
                !isLogin
                  ? "bg-surface-2 text-text"
                  : "text-text-muted hover:text-text"
              )}
            >
              Sign Up
            </button>
          </div>

          {formError && (
            <div className="mt-4 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
              {formError}
            </div>
          )}

          {/* ── Login form ── */}
          {isLogin ? (
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="mt-6 space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-10 pl-9"
                    autoComplete="email"
                    aria-invalid={!!loginForm.formState.errors.email}
                    {...loginForm.register("email")}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-error">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-10 pl-9 pr-9"
                    autoComplete="current-password"
                    aria-invalid={!!loginForm.formState.errors.password}
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-error">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Continue with email
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* ── Signup form ── */
            <form
              onSubmit={signupForm.handleSubmit(onSignup)}
              className="mt-6 space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="signup-name">Display name</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    id="signup-name"
                    placeholder="Ada Lovelace"
                    className="h-10 pl-9"
                    autoComplete="name"
                    aria-invalid={!!signupForm.formState.errors.name}
                    {...signupForm.register("name")}
                  />
                </div>
                {signupForm.formState.errors.name && (
                  <p className="text-xs text-error">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-10 pl-9"
                    autoComplete="email"
                    aria-invalid={!!signupForm.formState.errors.email}
                    {...signupForm.register("email")}
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-error">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    className="h-10 pl-9 pr-9"
                    autoComplete="new-password"
                    aria-invalid={!!signupForm.formState.errors.password}
                    {...signupForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-error">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Role toggle */}
              <div className="space-y-1.5">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "Builder", label: "Builder", Icon: Wrench },
                      {
                        value: "Learner",
                        label: "Learner",
                        Icon: GraduationCap,
                      },
                    ] as const
                  ).map(({ value, label, Icon }) => {
                    const active = selectedRole === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          signupForm.setValue("role", value, {
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "border-primary bg-primary/10 text-text shadow-[0_0_0_1px_var(--primary)]"
                            : "border-border bg-surface text-text-muted hover:border-primary/50 hover:text-text"
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4",
                            active ? "text-primary" : "text-text-muted"
                          )}
                        />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full"
                disabled={signupForm.formState.isSubmitting}
              >
                {signupForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-text-muted">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 w-full"
            onClick={onGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-xs text-text-muted">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
}
