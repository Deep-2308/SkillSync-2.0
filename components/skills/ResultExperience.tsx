"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Check,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  Share2,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/shared/ScoreRing";

export interface ResultMetric {
  label: string;
  value: number;
  max: number;
}

export interface ResultData {
  challengeId: string;
  skillName: string;
  domain: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  score: number;
  passed: boolean;
  metrics: ResultMetric[];
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  badgeSummary: string;
  badgeId?: string;
  issuedAt: string;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function ResultExperience({ data }: { data: ResultData }) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.05 },
    },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 240, damping: 26 },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl space-y-6 p-6 md:p-8"
    >
      <Verdict data={data} item={item} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column — 60% */}
        <div className="space-y-6 lg:col-span-7">
          <ScoreBreakdown metrics={data.metrics} item={item} reduce={!!reduce} />
          <Feedback data={data} item={item} />
        </div>

        {/* Right column — 40% */}
        <div className="space-y-6 lg:col-span-5">
          {data.passed && <BadgeCard data={data} item={item} reduce={!!reduce} />}
          <NextSteps data={data} item={item} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Verdict banner ──────────────────────────────────────────────────────────
function Verdict({ data, item }: { data: ResultData; item: Variants }) {
  const reduce = useReducedMotion();
  const Icon = data.passed ? CheckCircle2 : XCircle;

  return (
    <motion.section
      variants={item}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-8 md:p-10",
        data.passed
          ? "border-success/30 bg-success/10"
          : "border-accent/30 bg-accent/10"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 size-56 rounded-full blur-[90px]",
          data.passed ? "bg-success/20" : "bg-accent/20"
        )}
      />
      <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex items-center gap-5 text-center md:text-left">
          <motion.span
            initial={reduce ? { scale: 1 } : { scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
            className={cn(
              "grid size-16 shrink-0 place-items-center rounded-full border md:size-20",
              data.passed
                ? "border-success/40 bg-success/15 text-success"
                : "border-accent/40 bg-accent/15 text-accent"
            )}
          >
            <Icon className="size-8 md:size-10" />
          </motion.span>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-text md:text-3xl">
              {data.passed ? "Challenge Passed!" : "Keep Practicing"}
            </h1>
            <p className="mt-1.5 text-sm text-text-muted md:text-base">
              {data.passed ? (
                <>
                  You earned a verified badge for{" "}
                  <span className="font-semibold text-text">
                    {data.skillName} — {capitalize(data.difficulty)}
                  </span>
                </>
              ) : (
                <>
                  You scored just below the bar. Review the feedback and try{" "}
                  {data.skillName} again — you&apos;ve got this.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="text-center md:text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            Overall Score
          </p>
          <div className="mt-1 flex items-end justify-center gap-2 md:justify-end">
            <span
              className={cn(
                "bg-clip-text font-heading text-6xl font-extrabold leading-none tracking-tight text-transparent",
                data.passed
                  ? "bg-[linear-gradient(135deg,#5eead4,#22d3ee,#0891b2)]"
                  : "bg-[linear-gradient(135deg,#fcd34d,#f59e0b,#b45309)]"
              )}
            >
              {data.score}
            </span>
            <span className="mb-1 text-2xl font-semibold text-text-muted">
              / 100
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ─── Score breakdown ─────────────────────────────────────────────────────────
function ScoreBreakdown({
  metrics,
  item,
  reduce,
}: {
  metrics: ResultMetric[];
  item: Variants;
  reduce: boolean;
}) {
  return (
    <motion.section
      variants={item}
      className="rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur-sm md:p-8"
    >
      <h2 className="mb-6 flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight text-text">
        <BarChart3 className="size-5 text-primary" />
        Score Breakdown
      </h2>
      <div className="space-y-5">
        {metrics.map((m, i) => (
          <MetricBar key={m.label} metric={m} index={i} reduce={reduce} />
        ))}
      </div>
    </motion.section>
  );
}

function MetricBar({
  metric,
  index,
  reduce,
}: {
  metric: ResultMetric;
  index: number;
  reduce: boolean;
}) {
  const target = Math.round((metric.value / metric.max) * 100);
  const [value, setValue] = useState(reduce ? target : 0);

  useEffect(() => {
    if (reduce) return;
    const delay = 350 + index * 120;
    const timer = setTimeout(() => setValue(target), delay);
    return () => clearTimeout(timer);
  }, [target, index, reduce]);

  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-sm font-medium text-text">{metric.label}</span>
        <span className="text-xs font-semibold tabular-nums text-primary">
          {metric.value}/{metric.max}
        </span>
      </div>
      <Progress
        value={value}
        className="h-2 bg-surface-2 [&_[data-slot=progress-indicator]]:bg-[linear-gradient(90deg,#5eead4,#22d3ee)] [&_[data-slot=progress-indicator]]:shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_60%,transparent)] [&_[data-slot=progress-indicator]]:!duration-700"
      />
    </div>
  );
}

// ─── Feedback ────────────────────────────────────────────────────────────────
function Feedback({ data, item }: { data: ResultData; item: Variants }) {
  return (
    <motion.section
      variants={item}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur-sm md:p-8"
    >
      <Brain className="pointer-events-none absolute -right-4 -top-4 size-28 text-ai/5" />
      <h2 className="relative z-10 mb-5 flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight text-text">
        <Sparkles className="size-5 text-ai" />
        Overall Assessment
      </h2>

      <p className="relative z-10 rounded-xl border border-border/60 bg-background/40 p-5 text-base leading-relaxed text-text-muted">
        {data.overallFeedback}
      </p>

      <div className="relative z-10 mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-success">
            <Check className="size-4" />
            What You Did Well
          </h3>
          <ul className="space-y-2">
            {data.strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm text-text"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
            <ArrowUpRight className="size-4" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {data.improvements.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-sm text-text"
              >
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-accent" />
                <span className="leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}

// ─── Badge card (passed only) ────────────────────────────────────────────────
function BadgeCard({
  data,
  item,
  reduce,
}: {
  data: ResultData;
  item: Variants;
  reduce: boolean;
}) {
  const { data: session } = useSession();
  const profileId = session?.user?.id;

  async function handleShare() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/skills/result/${data.challengeId}`
        : "";
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Achievement link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <motion.section variants={item}>
      {/* gradient border wrapper */}
      <motion.div
        initial={reduce ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          boxShadow: reduce
            ? undefined
            : [
                "0 0 0px color-mix(in oklab, var(--primary) 0%, transparent)",
                "0 0 44px color-mix(in oklab, var(--primary) 45%, transparent)",
                "0 0 18px color-mix(in oklab, var(--primary) 22%, transparent)",
              ],
        }}
        transition={{
          scale: { type: "spring", stiffness: 200, damping: 18, delay: 0.25 },
          opacity: { duration: 0.3, delay: 0.25 },
          boxShadow: {
            duration: 1.4,
            times: [0, 0.5, 1],
            repeat: 2,
            ease: "easeInOut",
            delay: 0.5,
          },
        }}
        className="rounded-3xl bg-[linear-gradient(135deg,#5eead4,#22d3ee,#0891b2)] p-px"
      >
        <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-surface p-7 text-center">
          {/* rotated VERIFIED watermark */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-6 top-10 -rotate-90 select-none font-heading text-5xl font-extrabold uppercase tracking-[0.3em] text-primary/[0.06]"
          >
            Verified
          </span>

          {/* wordmark */}
          <div className="flex items-center justify-center gap-2 text-text-muted">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              SkillSync
            </span>
          </div>

          {/* skill + difficulty */}
          <h3 className="mt-5 font-heading text-3xl font-bold tracking-tight text-text">
            {data.skillName}
          </h3>
          <span className="mt-2 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
            {capitalize(data.difficulty)}
          </span>

          {/* score ring */}
          <div className="mt-6 flex justify-center">
            <ScoreRing score={data.score} size={168} delay={0.5} variant="pass" />
          </div>

          {/* summary */}
          <p className="mt-6 text-sm italic leading-relaxed text-text-muted">
            “{data.badgeSummary}”
          </p>

          {/* meta */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs">
            <span className="text-text-muted">Issued</span>
            <span className="font-semibold text-text">
              {formatDate(data.issuedAt)}
            </span>
          </div>

          {/* actions */}
          <div className="mt-5 flex flex-col gap-2.5">
            <Button asChild size="lg" className="h-11 w-full font-semibold">
              <Link href={profileId ? `/profile/${profileId}` : "/dashboard"}>
                View on Profile
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleShare}
              className="h-11 w-full gap-2"
            >
              <Share2 className="size-4" />
              Share Achievement
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

// ─── Next steps ──────────────────────────────────────────────────────────────
function NextSteps({ data, item }: { data: ResultData; item: Variants }) {
  return (
    <motion.section
      variants={item}
      className="rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur-sm"
    >
      <h2 className="font-heading text-base font-bold tracking-tight text-text">
        Next Steps
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        {data.passed
          ? "Put your new badge to work or keep building your passport."
          : "A quick reset and you'll be ready for another attempt."}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {data.passed ? (
          <>
            <Button asChild size="lg" className="h-11 w-full justify-between">
              <Link
                href={`/projects/discover?skill=${encodeURIComponent(
                  data.skillName
                )}`}
              >
                Browse projects needing {data.skillName}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 w-full justify-between"
            >
              <Link href="/skills/prove">
                Prove another skill
                <Sparkles className="size-4" />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="lg" className="h-11 w-full justify-between">
              <Link
                href={`/skills/prove?skill=${encodeURIComponent(
                  data.skillName
                )}&difficulty=${data.difficulty}&auto=1`}
              >
                Try again
                <RotateCcw className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 w-full justify-between"
            >
              <Link
                href={`/skills/prove?skill=${encodeURIComponent(
                  data.skillName
                )}&difficulty=beginner`}
              >
                Lower the difficulty
                <TrendingDown className="size-4" />
              </Link>
            </Button>
          </>
        )}
      </div>
    </motion.section>
  );
}
