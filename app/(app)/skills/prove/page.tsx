"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Wand2,
  Clock,
  CheckCircle2,
  CircleDashed,
  FileText,
  ClipboardCheck,
  Link2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  SKILLS_BY_DOMAIN,
  type PrimaryDomain,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SkillSelectGrid } from "@/components/shared/SkillSelectGrid";

// ─── Types ───────────────────────────────────────────────────────────────────
type Difficulty = "beginner" | "intermediate" | "advanced";

interface ChallengeContent {
  title: string;
  context: string;
  requirements: string[];
  deliverables: string[];
  evaluationCriteria: string[];
  estimatedMinutes: number;
}

type RightState = "empty" | "loading" | "challenge";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const MIN_SUBMISSION = 150;

// Fake-streaming reveal speeds (ms per character).
const TITLE_SPEED = 20;
const BODY_SPEED = 5;

export default function ProveSkillsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const primaryDomain = (session?.user?.primaryDomain ??
    null) as PrimaryDomain | null;

  // Fall back to a sensible default so the page is usable even before the
  // session hydrates or for users without a domain set.
  const domain: PrimaryDomain = primaryDomain ?? "Frontend Dev";
  const skills = useMemo(() => SKILLS_BY_DOMAIN[domain] ?? [], [domain]);

  // ─── Left panel state ──────────────────────────────────────────────────────
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");

  // ─── Right panel state ─────────────────────────────────────────────────────
  const [rightState, setRightState] = useState<RightState>("empty");
  const [challenge, setChallenge] = useState<ChallengeContent | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  // Fake-stream reveal progress.
  const [revealedTitle, setRevealedTitle] = useState("");
  const [bodyRevealed, setBodyRevealed] = useState(false);
  const [streamDone, setStreamDone] = useState(false);

  // ─── Submission state ──────────────────────────────────────────────────────
  const [responseText, setResponseText] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const generating = rightState === "loading";

  // Reset skill selection when the domain changes (e.g. session hydrates).
  useEffect(() => {
    setSelectedSkill(null);
  }, [domain]);

  // ─── Fake streaming effect ───────────────────────────────────────────────────
  // Reveal the title char-by-char, then mark the body for streaming.
  useEffect(() => {
    if (!challenge || rightState !== "challenge") return;

    setRevealedTitle("");
    setBodyRevealed(false);
    setStreamDone(false);

    let i = 0;
    const title = challenge.title;
    const titleTimer = setInterval(() => {
      i += 1;
      setRevealedTitle(title.slice(0, i));
      if (i >= title.length) {
        clearInterval(titleTimer);
        setBodyRevealed(true);
      }
    }, TITLE_SPEED);

    return () => clearInterval(titleTimer);
  }, [challenge, rightState]);

  // ─── Generate ────────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!selectedSkill) {
      toast.error("Select a skill to generate a challenge.");
      return;
    }

    // Reset submission area for the new challenge.
    setResponseText("");
    setReferenceUrl("");
    setSubmitError(null);
    setChallenge(null);
    setChallengeId(null);
    setRightState("loading");

    try {
      const res = await fetch("/api/skills/challenge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: selectedSkill,
          domain,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Failed to generate challenge.";
        throw new Error(message);
      }

      setChallengeId(data.challengeId);
      setChallenge(data.challengeContent as ChallengeContent);
      setRightState("challenge");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
      setRightState("empty");
    }
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitError(null);

    if (!challengeId) return;

    const trimmed = responseText.trim();
    if (trimmed.length < MIN_SUBMISSION) {
      setSubmitError(
        `Your response is too short. Write at least ${MIN_SUBMISSION} characters (currently ${trimmed.length}).`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/skills/challenge/${challengeId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            textContent: trimmed,
            url: referenceUrl.trim() || undefined,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Failed to submit your response.";
        throw new Error(message);
      }

      router.push(`/skills/result/${challengeId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setSubmitError(message);
      setSubmitting(false);
    }
  }

  const charCount = responseText.trim().length;
  const tooShort = charCount < MIN_SUBMISSION;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ════════════════ LEFT PANEL — selection (42%) ════════════════ */}
      <section className="relative w-full border-b border-border/60 p-6 md:p-10 lg:w-[42%] lg:border-b-0 lg:border-r">
        <div className="mx-auto flex max-w-md flex-col gap-8">
          <header>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
              Prove a skill
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Pick a skill and let Claude craft a real-world challenge to verify
              your expertise.
            </p>
          </header>

          {/* Domain (from session) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Domain
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-medium text-text">{domain}</span>
            </div>
          </div>

          {/* Skill selection grid */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Select a skill
            </span>
            <SkillSelectGrid
              skills={skills}
              selected={selectedSkill}
              onSelect={setSelectedSkill}
              disabled={generating}
            />
          </div>

          {/* Difficulty selector */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Difficulty
            </span>
            <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
              {DIFFICULTIES.map((d) => {
                const active = difficulty === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    disabled={generating}
                    onClick={() => setDifficulty(d.value)}
                    aria-pressed={active}
                    className={cn(
                      "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_var(--primary)]"
                        : "text-text-muted hover:text-text"
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <Button
            type="button"
            size="lg"
            onClick={handleGenerate}
            disabled={generating || !selectedSkill}
            className="group h-12 w-full gap-2 text-sm font-semibold"
          >
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                AI is crafting your challenge...
              </>
            ) : (
              <>
                <Wand2 className="size-4 transition-transform group-hover:rotate-12" />
                Generate My Challenge
              </>
            )}
          </Button>
        </div>

        {/* Ambient glow */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-primary/5 blur-[100px]" />
      </section>

      {/* ════════════════ RIGHT PANEL — challenge (58%) ════════════════ */}
      <section className="relative w-full overflow-hidden bg-surface/40 p-6 md:p-10 lg:w-[58%]">
        {rightState === "empty" && <EmptyState />}
        {rightState === "loading" && <LoadingState />}
        {rightState === "challenge" && challenge && (
          <ChallengeView
            challenge={challenge}
            revealedTitle={revealedTitle}
            titleComplete={revealedTitle.length >= challenge.title.length}
            bodyRevealed={bodyRevealed}
            streamDone={streamDone}
            onBodyStreamComplete={() => setStreamDone(true)}
            responseText={responseText}
            onResponseChange={setResponseText}
            referenceUrl={referenceUrl}
            onReferenceUrlChange={setReferenceUrl}
            charCount={charCount}
            tooShort={tooShort}
            submitError={submitError}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Empty state
// ════════════════════════════════════════════════════════════════════════════
function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid size-16 place-items-center rounded-2xl border border-border bg-surface text-text-muted">
        <Wand2 className="size-7" />
      </span>
      <h2 className="mt-5 font-heading text-xl font-semibold text-text">
        Your challenge appears here
      </h2>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        Choose a skill and difficulty, then generate a unique, AI-crafted
        challenge to prove what you know.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Loading state — skeleton shimmer + pulsing dots → streaming status text
// ════════════════════════════════════════════════════════════════════════════
function LoadingState() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col justify-center gap-6">
      <div className="space-y-5 rounded-xl border border-border bg-surface/60 p-8">
        <div className="skeleton-shimmer h-7 w-28 rounded-full" />
        <div className="skeleton-shimmer h-10 w-3/4 rounded-lg" />
        <div className="space-y-2 pt-2">
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded" />
          <div className="skeleton-shimmer h-4 w-4/6 rounded" />
        </div>
        <div className="space-y-3 pt-4">
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-11/12 rounded" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-ai">
        <Sparkles className="size-4" />
        <span>Claude AI is generating your unique challenge</span>
        <PulsingDots />
      </div>
    </div>
  );
}

function PulsingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block size-1.5 animate-bounce rounded-full bg-ai"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Streaming paragraph — reveals text char-by-char once `active` is true
// ════════════════════════════════════════════════════════════════════════════
function StreamingParagraph({
  text,
  active,
  speed,
  className,
  onComplete,
}: {
  text: string;
  active: boolean;
  speed: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [shown, setShown] = useState("");
  const completedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    setShown("");
    completedRef.current = false;

    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }
    }, speed);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, active, speed]);

  const streaming = active && shown.length < text.length;

  return (
    <p className={cn(streaming && "stream-cursor", className)}>{shown}</p>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Challenge view — AI badge, streamed title + context, details, submission
// ════════════════════════════════════════════════════════════════════════════
interface ChallengeViewProps {
  challenge: ChallengeContent;
  revealedTitle: string;
  titleComplete: boolean;
  bodyRevealed: boolean;
  streamDone: boolean;
  onBodyStreamComplete: () => void;
  responseText: string;
  onResponseChange: (v: string) => void;
  referenceUrl: string;
  onReferenceUrlChange: (v: string) => void;
  charCount: number;
  tooShort: boolean;
  submitError: string | null;
  submitting: boolean;
  onSubmit: () => void;
}

function ChallengeView({
  challenge,
  revealedTitle,
  titleComplete,
  bodyRevealed,
  streamDone,
  onBodyStreamComplete,
  responseText,
  onResponseChange,
  referenceUrl,
  onReferenceUrlChange,
  charCount,
  tooShort,
  submitError,
  submitting,
  onSubmit,
}: ChallengeViewProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <article className="relative rounded-xl border border-border bg-surface/80 p-6 shadow-2xl backdrop-blur-sm md:p-8">
        {/* Header — AI Generated badge */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            Your Challenge
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ai/30 bg-ai/10 px-3 py-1 text-[11px] font-semibold text-ai">
            <Sparkles className="size-3.5" />
            AI Generated
          </span>
        </div>

        {/* Title (Syne) — fake-streamed char by char */}
        <h2
          className={cn(
            "min-h-[2.5rem] font-heading text-3xl font-bold leading-tight tracking-tight text-text md:text-4xl",
            !titleComplete && "stream-cursor"
          )}
        >
          {revealedTitle}
        </h2>

        {/* Context — streams in after the title completes */}
        <div className="mt-4 min-h-[3rem]">
          <StreamingParagraph
            text={challenge.context}
            active={bodyRevealed}
            speed={BODY_SPEED}
            onComplete={onBodyStreamComplete}
            className="text-base leading-relaxed text-text-muted"
          />
        </div>

        {/* Details — fade in once the context finishes streaming */}
        {streamDone && (
          <div className="mt-8 space-y-8 duration-500 animate-in fade-in slide-in-from-bottom-2">
            {/* Requirements */}
            <Section title="Requirements">
              <ol className="space-y-3">
                {challenge.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-text">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-primary/40 text-primary">
                      <CheckCircle2 className="size-3.5" />
                    </span>
                    <span className="leading-relaxed">
                      <span className="mr-1.5 font-semibold text-primary">
                        {i + 1}.
                      </span>
                      {req}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>

            {/* Deliverables */}
            <Section title="What to submit" icon={<FileText className="size-4" />}>
              <ul className="space-y-2">
                {challenge.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <CircleDashed className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span className="leading-relaxed">{d}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Evaluation criteria */}
            <Section
              title="How you'll be scored"
              icon={<ClipboardCheck className="size-4" />}
            >
              <ul className="space-y-2">
                {challenge.evaluationCriteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ai" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Time estimate chip */}
            <div className="flex flex-wrap gap-3 border-t border-border pt-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-muted">
                <Clock className="size-3.5" />~{challenge.estimatedMinutes} minutes
              </span>
            </div>

            {/* Submission area */}
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="font-heading text-lg font-semibold text-text">
                Your response
              </h3>

              <Textarea
                value={responseText}
                onChange={(e) => onResponseChange(e.target.value)}
                placeholder="Write your response here... describe your approach, reasoning, decisions, and outcomes in detail."
                disabled={submitting}
                className="min-h-44 resize-y bg-surface text-sm leading-relaxed"
              />

              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => onReferenceUrlChange(e.target.value)}
                  disabled={submitting}
                  placeholder="Reference URL (optional — link to work, repo, or prototype)"
                  className="h-10 bg-surface pl-9 text-sm"
                />
              </div>

              {/* Character count */}
              <div className="flex items-center justify-between text-xs">
                <span
                  className={cn(
                    tooShort ? "text-text-muted" : "text-success"
                  )}
                >
                  {charCount} / {MIN_SUBMISSION} characters minimum
                </span>
              </div>

              {submitError && (
                <p className="flex items-center gap-2 text-xs text-error">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {submitError}
                </p>
              )}

              <Button
                type="button"
                size="lg"
                onClick={onSubmit}
                disabled={submitting}
                className="h-12 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/85"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Claude is evaluating your submission...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Submit for Evaluation
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Ambient card glow */}
        <div className="pointer-events-none absolute -inset-px -z-10 rounded-xl bg-gradient-to-br from-primary/10 to-transparent blur-sm" />
      </article>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
