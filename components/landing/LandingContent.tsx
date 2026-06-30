"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
  animate,
  useMotionValue,
  useTransform,
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

// ─── Logo ──────────────────────────────────────────────────────────────────────
function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7 drop-shadow-[0_0_8px_var(--color-primary)]", className)} aria-hidden>
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

// ─── Scroll-reveal wrapper ─────────────────────────────────────────────────────
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
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 20, delay },
    },
  };
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Count-up number ───────────────────────────────────────────────────────────
function Counter({ to, suffix = "", glow = false }: { to: number; suffix?: string, glow?: boolean }) {
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
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref} className={cn(glow && value === to ? "drop-shadow-[0_0_12px_var(--color-primary)] transition-all duration-500" : "")}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Mouse-tracking Spotlight Card ─────────────────────────────────────────────
function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={cn("hover-spotlight glass-panel rounded-3xl p-8 transition-all hover:-translate-y-1", className)}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function LandingContent() {
  function handleEarlyAccess(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    if (!email) return;
    toast.success("Welcome aboard. Check your inbox soon.", {
      style: { background: "var(--color-surface)", border: "1px solid var(--color-primary)", color: "var(--color-text)" }
    });
    form.reset();
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-mesh-dark bg-background text-text">
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="group flex items-center gap-3">
          <Logo className="transition-transform duration-500 group-hover:rotate-180" />
          <span className="font-heading text-xl font-bold tracking-tight text-text">
            SkillSync
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="group flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
            >
              {l.label}
              {l.soon && (
                <span className="rounded-full border border-ai/30 bg-ai/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ai">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_30px_-5px_var(--color-primary)]"
          >
            Get Started
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. Hero (3D Floating)
// ════════════════════════════════════════════════════════════════════════════
function Hero({ onEarlyAccess }: { onEarlyAccess: (e: FormEvent<HTMLFormElement>) => void }) {
  void onEarlyAccess;
  const reduce = useReducedMotion();
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 30 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 90, damping: 20, delay: 0.1 + i * 0.1 },
    }),
  };

  return (
    <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-44 lg:grid-cols-[1fr_minmax(0,45%)] lg:pt-52">
      {/* Background glow behind text */}
      <div className="pointer-events-none absolute left-0 top-20 size-[500px] rounded-full bg-ai/10 blur-[150px]" />

      {/* copy */}
      <div className="relative z-10">
        <motion.span
          custom={0}
          variants={rise}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 rounded-full border border-ai/30 bg-ai/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ai backdrop-blur-md"
        >
          <Sparkles className="size-4 animate-pulse" />
          The New Standard of Proof
        </motion.span>

        <motion.h1
          custom={1}
          variants={rise}
          initial="hidden"
          animate="show"
          className="mt-8 font-heading text-6xl font-black leading-[1.1] tracking-tight text-text sm:text-7xl lg:text-[5rem]"
        >
          Prove Your Skills.
          <br />
          <span className="text-gradient-animated pb-2 block">
            Find Your Builders.
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={rise}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-lg text-lg leading-relaxed text-text-muted sm:text-xl"
        >
          Stop self-reporting skills that nobody believes. Complete AI-generated
          challenges, earn verified badges, and match with co-builders who trust your proof.
        </motion.p>

        <motion.div
          custom={3}
          variants={rise}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_0_40px_-10px_var(--color-primary)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-10px_var(--color-primary)]"
          >
            <Zap className="size-5 fill-primary-foreground" />
            Start Proving Skills
          </Link>
          <Link
            href="/projects/discover"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-text backdrop-blur-md transition-all hover:bg-white/10"
          >
            Browse Projects
            <ArrowRight className="size-5" />
          </Link>
        </motion.div>
      </div>

      {/* 3D Hero visual */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.4 }}
        className="relative z-10 mx-auto w-full max-w-[420px]"
      >
        <Hero3DBadge />
      </motion.div>
    </section>
  );
}

function Hero3DBadge() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-200, 200], [15, -15]);
  const rotateY = useTransform(x, [-200, 200], [-15, 15]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative perspective-1000"
    >
      <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-[100px] animate-pulse" />
      
      <div className="glass-panel relative overflow-hidden rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),_0_0_40px_-15px_var(--color-primary)]">
        {/* Glow overlay */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-ai/30 blur-3xl" />
        
        <span className="pointer-events-none absolute right-4 top-8 rotate-90 select-none font-heading text-xs font-black uppercase tracking-[0.4em] text-success/80">
          Verified
        </span>

        <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-center gap-3 text-text-muted">
            <Logo className="size-6" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              SkillSync Protocol
            </span>
          </div>

          <h3 className="mt-8 font-heading text-5xl font-black tracking-tight text-text drop-shadow-lg">
            React.js
          </h3>
          <p className="mt-2 text-base text-text-muted font-medium">
            Senior Level · Score:{" "}
            <span className="font-black text-primary drop-shadow-[0_0_8px_var(--color-primary)]">98/100</span>
          </p>

          <div className="mt-8 h-2.5 w-full overflow-hidden rounded-full bg-surface-2 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "98%" }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-ai),var(--color-primary))] shadow-[0_0_15px_var(--color-primary)]"
            />
          </div>

          <p className="mt-8 text-sm font-medium italic leading-relaxed text-text-muted">
            &ldquo;Exceptional mastery of React architecture, concurrent mode, and complex state synchronization.&rdquo;
          </p>

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 text-sm">
            <span className="text-text-muted font-mono">ID: 0x8F2A...</span>
            <span className="inline-flex items-center gap-2 font-bold text-success drop-shadow-[0_0_5px_var(--color-success)]">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-success" />
              </span>
              AI Verified
            </span>
          </div>
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
    { to: 12400, suffix: "+", label: "Verified Badges" },
    { to: 850, suffix: "+", label: "Projects Launched" },
    { to: 120, suffix: "", label: "Skills Covered" },
    { to: 99, suffix: "%", label: "Proof Accuracy" },
  ];
  return (
    <section className="relative border-y border-white/5 bg-surface-2/20 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1} className="text-center">
            <p className="font-heading text-5xl font-black tracking-tight text-primary">
              <Counter to={s.to} suffix={s.suffix} glow />
            </p>
            <p className="mt-2 text-sm font-bold uppercase tracking-widest text-text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. How it works (Bento Grid)
// ════════════════════════════════════════════════════════════════════════════
function HowItWorks() {
  return (
    <section id="how" className="relative mx-auto max-w-7xl px-6 py-32">
      <Reveal className="text-center">
        <h2 className="font-heading text-5xl font-black tracking-tight text-text">
          Three steps to undeniable proof.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted">
          Stop writing resumes. Start shipping code. Our AI protocol evaluates your real-world capability.
        </p>
      </Reveal>

      <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2">
        {/* Step 1: Big left card */}
        <Reveal delay={0.1} className="md:col-span-2 md:row-span-2">
          <SpotlightCard className="flex h-full flex-col justify-between border-t-2 border-primary/20">
            <div>
              <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary drop-shadow-[0_0_10px_var(--color-primary)]">
                <Trophy className="size-7" />
              </span>
              <h3 className="mt-8 font-heading text-3xl font-bold text-text">1. Accept the Challenge</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-text-muted">
                Select your skill. Our AI generates a unique, industry-grade challenge that cannot be solved by simply asking ChatGPT. It requires deep architectural thinking and execution.
              </p>
            </div>
            {/* Abstract visual */}
            <div className="mt-10 flex h-48 items-end justify-center rounded-2xl bg-black/40 p-4 shadow-inner">
               <div className="w-full h-full border border-white/5 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:1rem_1rem] rounded-xl flex items-center justify-center">
                  <div className="px-6 py-3 rounded-lg bg-surface border border-primary/30 text-primary font-mono text-sm shadow-[0_0_15px_var(--color-primary)] animate-pulse">
                    Initiating Assessment...
                  </div>
               </div>
            </div>
          </SpotlightCard>
        </Reveal>

        {/* Step 2: Top right */}
        <Reveal delay={0.2} className="md:col-span-1 md:row-span-1">
          <SpotlightCard className="flex h-full flex-col border-t-2 border-ai/20">
            <span className="grid size-12 place-items-center rounded-xl bg-ai/10 text-ai drop-shadow-[0_0_10px_var(--color-ai)]">
              <ShieldCheck className="size-6" />
            </span>
            <h3 className="mt-6 font-heading text-2xl font-bold text-text">2. Earn Proof</h3>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Submit your code. Our evaluator models review your architecture, security, and performance to mint your cryptographically secure badge.
            </p>
          </SpotlightCard>
        </Reveal>

        {/* Step 3: Bottom right */}
        <Reveal delay={0.3} className="md:col-span-1 md:row-span-1">
          <SpotlightCard className="flex h-full flex-col border-t-2 border-success/20">
            <span className="grid size-12 place-items-center rounded-xl bg-success/10 text-success drop-shadow-[0_0_10px_var(--color-success)]">
              <Hammer className="size-6" />
            </span>
            <h3 className="mt-6 font-heading text-2xl font-bold text-text">3. Find Builders</h3>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Match instantly with founders and hackers whose skills are just as verified as yours. Build the future.
            </p>
          </SpotlightCard>
        </Reveal>
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
      icon: <Zap className="size-6" />,
      title: "Real-world Tasks",
      desc: "Zero multiple choice. You build working features, APIs, and UIs in your own local environment.",
    },
    {
      icon: <Layers className="size-6" />,
      title: "Multi-modal Evaluation",
      desc: "Our AI agents analyze code quality, read your commit history, and even review visual UI snapshots.",
    },
    {
      icon: <Users className="size-6" />,
      title: "Trustless Hiring",
      desc: "Bypass the recruiter wall. When you have a SkillSync badge, your capability speaks for itself.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-32">
      <Reveal className="text-center">
        <h2 className="font-heading text-5xl font-black tracking-tight text-text">
          Built for hackers.
        </h2>
      </Reveal>

      <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.15}>
            <div className="group h-full rounded-3xl border border-white/5 bg-surface/30 p-10 transition-all hover:-translate-y-2 hover:bg-surface/60 hover:shadow-[0_0_40px_-15px_var(--color-primary)]">
              <span className="grid size-14 place-items-center rounded-2xl bg-white/5 text-primary shadow-inner transition-all group-hover:bg-primary/20 group-hover:drop-shadow-[0_0_15px_var(--color-primary)]">
                {f.icon}
              </span>
              <h3 className="mt-8 font-heading text-2xl font-bold text-text">
                {f.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-text-muted">
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
function FinalCta({ onEarlyAccess }: { onEarlyAccess: (e: FormEvent<HTMLFormElement>) => void }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-surface px-6 py-24 text-center shadow-[0_0_80px_-20px_var(--color-ai)]">
          {/* Radial explosion background */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,var(--color-ai)_0%,transparent_60%)] opacity-20 mix-blend-screen" />

          <h2 className="relative z-10 font-heading text-5xl font-black tracking-tight text-text sm:text-6xl">
            Stop claiming.<br />Start proving.
          </h2>
          
          <p className="relative z-10 mt-6 text-lg text-text-muted">
            Join 12,000+ top builders already on the network.
          </p>

          <form
            onSubmit={onEarlyAccess}
            className="relative z-10 mx-auto mt-12 flex max-w-md flex-col gap-4 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="h-14 flex-1 rounded-2xl border border-white/10 bg-black/50 px-6 text-base text-text outline-none backdrop-blur-md transition-all placeholder:text-text-muted focus:border-ai focus:shadow-[0_0_20px_var(--color-ai)]"
            />
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-text px-8 text-base font-bold text-background transition-all hover:scale-105 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            >
              Get Access
            </button>
          </form>

          <p className="relative z-10 mt-8 text-sm font-medium text-text-muted">
            Free forever for builders.
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
    <footer className="border-t border-white/5 bg-background pb-12 pt-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Logo className="size-6 opacity-70 grayscale transition-all hover:grayscale-0 hover:opacity-100" />
          <span className="font-heading text-xl font-bold tracking-tight text-text-muted">
            SkillSync
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-white"
            >
              {l.label === "GitHub" && <Code2 className="size-4" />}
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      
      <div className="mx-auto mt-16 max-w-7xl border-t border-white/5 px-6 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} SkillSync. Designed for builders.
        </p>
        
        <div className="flex items-center gap-3 text-xs text-text-muted font-medium">
          <span>Powered by</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface px-3 py-1.5 shadow-inner">
            <span className="size-2 rounded-full bg-ai animate-pulse" />
            Claude & Gemini
          </span>
        </div>
      </div>
    </footer>
  );
}
