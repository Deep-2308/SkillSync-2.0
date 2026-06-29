"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
  animate,
  type Variants,
} from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Users,
  Zap,
  Trophy,
  Hammer,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

// ─── Logo: lightning bolt inside a hexagon ─────────────────────────────────────
function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <path
        d="M16 2 L28 9 V23 L16 30 L4 23 V9 Z"
        className="fill-primary/10 stroke-primary"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M17.5 7 L11 17.5 H15 L14.5 25 L21.5 13.5 H16.5 Z" className="fill-primary" />
    </svg>
  );
}

// ─── Scroll-reveal wrapper (fade up + slide) ───────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 90, damping: 20, delay },
    },
  };
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Count-up number (animates when scrolled into view) ────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function LandingContent() {
  function handleEarlyAccess(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    if (!email) return;
    toast.success("You're on the list! We'll be in touch soon.");
    form.reset();
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-text">
      {/* ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-40 -top-40 size-[36rem] rounded-full bg-primary/[0.10] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 size-[36rem] rounded-full bg-accent/[0.08] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <Nav />
      <Hero onEarlyAccess={handleEarlyAccess} />
      <TrustStrip />
      <HowItWorks />
      <Features />
      <FinalCta onEarlyAccess={handleEarlyAccess} />
      <Footer />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1. Navigation
// ════════════════════════════════════════════════════════════════════════════
function Nav() {
  const links = [
    { label: "How it Works", href: "#how" },
    { label: "Explore Projects", href: "/projects/discover" },
    { label: "Pricing", href: "#", soon: true },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-heading text-xl font-extrabold tracking-tight text-text">
            SkillSync
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="group flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
            >
              {l.label}
              {l.soon && (
                <span className="rounded-full border border-border bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/85 hover:shadow-[0_0_24px_-6px_var(--accent)]"
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. Hero
// ════════════════════════════════════════════════════════════════════════════
function Hero({
  onEarlyAccess,
}: {
  onEarlyAccess: (e: FormEvent<HTMLFormElement>) => void;
}) {
  void onEarlyAccess;
  const reduce = useReducedMotion();
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 90, damping: 20, delay: 0.1 + i * 0.1 },
    }),
  };

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-36 lg:grid-cols-[1fr_minmax(0,46%)] lg:pt-44">
      {/* copy */}
      <div>
        <motion.span
          custom={0}
          variants={rise}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
          <Sparkles className="size-3.5" />
          AI-Powered Skill Verification
        </motion.span>

        <motion.h1
          custom={1}
          variants={rise}
          initial="hidden"
          animate="show"
          className="mt-6 font-heading text-5xl font-extrabold leading-[1.05] tracking-tight text-text sm:text-6xl"
        >
          Prove Your Skills.
          <br />
          <span className="bg-[linear-gradient(120deg,#5eead4,#22d3ee,#0891b2)] bg-clip-text text-transparent">
            Find Your Builders.
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={rise}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-[520px] text-lg leading-relaxed text-text-muted"
        >
          Stop self-reporting skills that nobody believes. Complete AI-generated
          challenges, earn verified badges, and find co-builders who trust your
          proof.
        </motion.p>

        <motion.div
          custom={3}
          variants={rise}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/85 hover:shadow-[0_0_30px_-6px_var(--accent)]"
          >
            <Zap className="size-4" />
            Start Proving Skills
          </Link>
          <Link
            href="/projects/discover"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-7 py-3.5 text-sm font-semibold text-text transition-all hover:border-primary/50 hover:text-primary"
          >
            Browse Projects
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>

      {/* hero visual — mock badge card */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.3 }}
        className="relative mx-auto w-full max-w-sm"
      >
        <HeroBadgeCard />
      </motion.div>
    </section>
  );
}

function HeroBadgeCard() {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="relative overflow-hidden rounded-3xl border border-primary/30 bg-surface/80 p-7 shadow-[0_0_60px_-15px_var(--primary)] backdrop-blur-sm"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl" />

      {/* rotated VERIFIED stamp */}
      <span className="pointer-events-none absolute right-3 top-7 rotate-90 select-none font-heading text-xs font-extrabold uppercase tracking-[0.3em] text-accent/70">
        Verified
      </span>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-text-muted">
          <Logo className="size-5" />
          <span className="text-[11px] font-semibold uppercase tracking-widest">
            SkillSync
          </span>
        </div>

        <h3 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-text">
          React
        </h3>
        <p className="mt-1.5 text-sm text-text-muted">
          Intermediate · Score:{" "}
          <span className="font-semibold text-primary">87/100</span>
        </p>

        {/* progress */}
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "87%" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            className="h-full rounded-full bg-[linear-gradient(90deg,#5eead4,#22d3ee)] shadow-[0_0_10px_var(--primary)]"
          />
        </div>

        <p className="mt-6 text-sm italic leading-relaxed text-text-muted">
          &ldquo;Demonstrated ability to architect responsive, data-driven UIs.&rdquo;
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs">
          <span className="text-text-muted">Issued Jun 2026</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-success">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            AI Verified
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. Trust strip
// ════════════════════════════════════════════════════════════════════════════
function TrustStrip() {
  const stats = [
    { to: 2400, suffix: "+", label: "Verified Badges" },
    { to: 380, suffix: "", label: "Projects Launched" },
    { to: 47, suffix: "", label: "Skills Covered" },
    { to: 94, suffix: "%", label: "Pass Quality" },
  ];
  return (
    <section className="border-y border-border bg-surface/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <p className="font-heading text-4xl font-extrabold tracking-tight text-primary">
              <Counter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-sm text-text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. How it works
// ════════════════════════════════════════════════════════════════════════════
function HowItWorks() {
  const steps = [
    {
      n: 1,
      tone: "text-primary",
      ring: "border-primary/40 bg-primary/10 text-primary",
      icon: <Trophy className="size-6" />,
      title: "Prove",
      desc: "AI generates a real-world challenge for your skill. You complete it on your own terms.",
    },
    {
      n: 2,
      tone: "text-accent",
      ring: "border-accent/40 bg-accent/10 text-accent",
      icon: <ShieldCheck className="size-6" />,
      title: "Earn",
      desc: "AI evaluates your work against professional standards. Pass, and you get a verified badge plus a proof artifact.",
    },
    {
      n: 3,
      tone: "text-ai",
      ring: "border-ai/40 bg-ai/10 text-ai",
      icon: <Hammer className="size-6" />,
      title: "Build",
      desc: "Post your project. AI assembles your team from builders whose skills are actually verified.",
    },
  ];

  return (
    <section id="how" className="relative mx-auto max-w-6xl px-6 py-24">
      <Reveal className="text-center">
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-text">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-md text-text-muted">
          Three steps from unproven to undeniable.
        </p>
      </Reveal>

      <div className="relative mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* connecting line (desktop) */}
        <div className="absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-primary/40 via-accent/40 to-ai/40 md:block" />

        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12}>
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-7 backdrop-blur-sm transition-colors hover:border-primary/40">
              {/* huge muted background number */}
              <span
                className={cn(
                  "pointer-events-none absolute -right-3 -top-6 select-none font-heading text-9xl font-extrabold opacity-[0.06]",
                  s.tone
                )}
              >
                {s.n}
              </span>

              <div className="relative z-10">
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-xl border",
                    s.ring
                  )}
                >
                  {s.icon}
                </span>
                <h3 className="mt-5 font-heading text-2xl font-bold tracking-tight text-text">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {s.desc}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. Features
// ════════════════════════════════════════════════════════════════════════════
function Features() {
  const features = [
    {
      icon: <Zap className="size-5" />,
      title: "Real Challenges, Real Proof",
      desc: "No multiple-choice quizzes. Claude generates authentic, industry-grade tasks and grades your actual reasoning and output.",
    },
    {
      icon: <Layers className="size-5" />,
      title: "Every Skill, Every Domain",
      desc: "Coding, design, writing, marketing, and data. If it's a real skill, there's a real challenge to prove it.",
    },
    {
      icon: <Users className="size-5" />,
      title: "Find Your Team",
      desc: "Match with co-builders on verified, proven skill — not a wall of random applicants and inflated résumés.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="text-center">
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-text">
          Built for people who can actually do the work
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.1}>
            <div className="h-full rounded-2xl border border-border bg-surface/60 p-7 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_30px_-12px_var(--primary)]">
              <span className="grid size-11 place-items-center rounded-xl border border-border bg-surface-2 text-primary">
                {f.icon}
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold tracking-tight text-text">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {f.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. Final CTA
// ════════════════════════════════════════════════════════════════════════════
function FinalCta({
  onEarlyAccess,
}: {
  onEarlyAccess: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/70 px-6 py-16 text-center backdrop-blur-sm">
          <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-primary/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full bg-accent/10 blur-[100px]" />

          <h2 className="relative z-10 font-heading text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            Ready to prove what you know?
          </h2>

          <form
            onSubmit={onEarlyAccess}
            className="relative z-10 mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="h-12 flex-1 rounded-xl border border-border bg-background/60 px-4 text-sm text-text outline-none transition-all placeholder:text-text-muted focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/85 hover:shadow-[0_0_24px_-6px_var(--accent)]"
            >
              Get Early Access
            </button>
          </form>

          <p className="relative z-10 mt-4 text-xs text-text-muted">
            Free forever. No credit card. No LinkedIn required.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. Footer
// ════════════════════════════════════════════════════════════════════════════
function Footer() {
  const links = [
    { label: "About", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "GitHub", href: "https://github.com", external: true },
  ];
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="font-heading text-lg font-extrabold tracking-tight text-text">
            SkillSync
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-primary"
            >
              {l.label === "GitHub" && <Code2 className="size-4" />}
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Built with</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-medium text-text">
            <span className="size-2 rounded-full bg-accent" />
            Claude AI
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-medium text-text">
            <span className="size-2 rounded-full bg-ai" />
            Gemini AI
          </span>
        </div>
      </div>

      <div className="border-t border-border py-5">
        <p className="text-center text-xs text-text-muted">
          © {new Date().getFullYear()} SkillSync. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
