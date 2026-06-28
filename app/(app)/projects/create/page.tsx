"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Target,
  Clock,
  Gauge,
  FolderTree,
  Users,
  Boxes,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RoleCard, type AnalysisRole } from "@/components/projects/RoleCard";

// ─── Types ───────────────────────────────────────────────────────────────────
type Complexity = "low" | "medium" | "high";

interface Analysis {
  summary: string;
  problemStatement: string;
  targetOutcome: string;
  estimatedDuration: string;
  complexity: Complexity;
  tags: string[];
  roles: AnalysisRole[];
}

type Phase = "idle" | "analyzing" | "results";

const TITLE_MAX = 120;

const COMPLEXITY_STYLES: Record<Complexity, string> = {
  low: "border-success/30 bg-success/10 text-success",
  medium: "border-accent/30 bg-accent/10 text-accent",
  high: "border-error/30 bg-error/10 text-error",
};

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerRole, setOwnerRole] = useState("");

  const [phase, setPhase] = useState<Phase>("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [roles, setRoles] = useState<AnalysisRole[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);

  const analyzing = phase === "analyzing";
  const canAnalyze =
    title.trim().length >= 5 &&
    description.trim().length >= 30 &&
    ownerRole.trim().length >= 2 &&
    !analyzing;

  async function handleAnalyze() {
    if (!canAnalyze) {
      toast.error(
        "Add a title (5+ chars), a description (30+ chars), and your role."
      );
      return;
    }
    setPhase("analyzing");
    setAnalysis(null);
    setRoles([]);
    setEditingIndex(null);

    try {
      const res = await fetch("/api/projects/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          ownerRole: ownerRole.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Analysis failed."
        );
      }

      const result = data.analysis as Analysis;
      setAnalysis(result);
      setRoles(result.roles ?? []);
      setPhase("results");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("idle");
    }
  }

  async function handlePublish() {
    if (!analysis) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          ownerRole: ownerRole.trim(),
          aiAnalysis: {
            summary: analysis.summary,
            problemStatement: analysis.problemStatement,
            targetOutcome: analysis.targetOutcome,
            estimatedDuration: analysis.estimatedDuration,
            complexity: analysis.complexity,
            tags: analysis.tags,
          },
          roles,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.projectId) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Publish failed."
        );
      }
      router.push(`/projects/${data.projectId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setPublishing(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ════════ LEFT — input (45%) ════════ */}
      <section className="relative w-full border-b border-border/60 p-6 md:p-10 lg:w-[45%] lg:border-b-0 lg:border-r">
        <div className="mx-auto flex max-w-md flex-col gap-7">
          <header>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
              Tell us about your project
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Describe your vision and Gemini will break it into the roles your
              team needs.
            </p>
          </header>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="title"
                className="text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Project title
              </label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  title.length > TITLE_MAX ? "text-error" : "text-text-muted"
                )}
              >
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <Input
              id="title"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              disabled={analyzing}
              placeholder="e.g. Real-time collaborative Solidity IDE"
              className="h-11 bg-surface"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-xs font-semibold uppercase tracking-wider text-text-muted"
            >
              Describe your project
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={analyzing}
              rows={8}
              placeholder="Describe your project idea in plain language. What are you building? Who is it for? What problem does it solve? No structure needed — just talk about it."
              className="min-h-44 resize-y bg-surface text-sm leading-relaxed"
            />
          </div>

          {/* Owner role */}
          <div className="space-y-2">
            <label
              htmlFor="ownerRole"
              className="text-xs font-semibold uppercase tracking-wider text-text-muted"
            >
              Your role — what will YOU do?
            </label>
            <Input
              id="ownerRole"
              value={ownerRole}
              onChange={(e) => setOwnerRole(e.target.value)}
              disabled={analyzing}
              placeholder="e.g. Frontend Developer"
              className="h-11 bg-surface"
            />
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <Button
              type="button"
              size="lg"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="h-12 w-full gap-2 bg-ai text-base font-semibold text-white hover:bg-ai/85"
            >
              {analyzing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Gemini AI is analyzing your project...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Analyze with AI
                </>
              )}
            </Button>
            <p className="text-center text-xs text-text-muted">
              Powered by Google Gemini 2.5 Flash
            </p>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-ai/5 blur-[100px]" />
      </section>

      {/* ════════ RIGHT — analysis (55%) ════════ */}
      <section className="w-full bg-surface/40 p-6 md:p-10 lg:w-[55%]">
        {phase === "idle" && <EmptyState />}
        {phase === "analyzing" && <AnalyzingState />}
        {phase === "results" && analysis && (
          <Results
            analysis={analysis}
            roles={roles}
            editingIndex={editingIndex}
            onToggleEdit={(i) =>
              setEditingIndex((cur) => (cur === i ? null : i))
            }
            onRoleChange={(i, next) =>
              setRoles((cur) => cur.map((r, idx) => (idx === i ? next : r)))
            }
            complexityStyles={COMPLEXITY_STYLES}
            publishing={publishing}
            onPublish={handlePublish}
          />
        )}
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Empty state — Lucide "project structure" illustration
// ════════════════════════════════════════════════════════════════════════════
function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="relative grid place-items-center">
        <div className="absolute size-40 rounded-full bg-ai/5 blur-3xl" />
        <div className="relative flex items-end gap-3">
          <span className="grid size-12 translate-y-2 place-items-center rounded-xl border border-border bg-surface text-text-muted">
            <Users className="size-5" />
          </span>
          <span className="grid size-16 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_30px_-8px_var(--primary)]">
            <FolderTree className="size-7" />
          </span>
          <span className="grid size-12 translate-y-2 place-items-center rounded-xl border border-border bg-surface text-text-muted">
            <Boxes className="size-5" />
          </span>
        </div>
      </div>
      <h2 className="mt-8 font-heading text-xl font-semibold text-text">
        Your project blueprint appears here
      </h2>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        Describe your idea on the left and Gemini will map out the summary,
        complexity, and the exact roles you need to recruit.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Analyzing state — shimmer skeletons + typing line
// ════════════════════════════════════════════════════════════════════════════
function AnalyzingState() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-4 rounded-xl border border-border bg-surface/60 p-6">
        <div className="skeleton-shimmer h-6 w-40 rounded-lg" />
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="skeleton-shimmer h-6 w-24 rounded-full" />
          <div className="skeleton-shimmer h-6 w-28 rounded-full" />
        </div>
      </div>

      <p className="flex items-center justify-center gap-1 text-sm text-ai">
        <Sparkles className="mr-1 size-4" />
        <span className="stream-cursor">
          Gemini is identifying the roles your project needs
        </span>
      </p>

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border bg-surface/60 p-5"
          >
            <div className="skeleton-shimmer h-5 w-1/2 rounded" />
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="flex gap-2">
              <div className="skeleton-shimmer h-5 w-16 rounded-full" />
              <div className="skeleton-shimmer h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Results
// ════════════════════════════════════════════════════════════════════════════
interface ResultsProps {
  analysis: Analysis;
  roles: AnalysisRole[];
  editingIndex: number | null;
  onToggleEdit: (i: number) => void;
  onRoleChange: (i: number, next: AnalysisRole) => void;
  complexityStyles: Record<Complexity, string>;
  publishing: boolean;
  onPublish: () => void;
}

function Results({
  analysis,
  roles,
  editingIndex,
  onToggleEdit,
  onRoleChange,
  complexityStyles,
  publishing,
  onPublish,
}: ResultsProps) {
  const listVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 240, damping: 26 },
    },
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <span className="grid size-9 place-items-center rounded-lg bg-ai/10 text-ai">
          <Sparkles className="size-5" />
        </span>
        <h2 className="font-heading text-xl font-bold tracking-tight text-text">
          AI Analysis
        </h2>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Analysis Complete
        </span>
      </div>

      {/* summary card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 rounded-xl border border-border bg-surface/70 p-6 backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-bold tracking-tight text-text">
            Project Summary
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-text-muted">
              <Clock className="size-3.5" />
              {analysis.estimatedDuration}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize",
                complexityStyles[analysis.complexity]
              )}
            >
              <Gauge className="size-3.5" />
              {analysis.complexity} complexity
            </span>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-text-muted">
          {analysis.summary}
        </p>

        <div className="flex items-start gap-2 border-t border-border pt-4">
          <Target className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-text-muted">
            {analysis.problemStatement}
          </p>
        </div>

        {analysis.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {analysis.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* roles */}
      <div>
        <h3 className="mb-3 font-heading text-base font-bold tracking-tight text-text">
          Roles Needed{" "}
          <span className="text-text-muted">({roles.length})</span>
        </h3>
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {roles.map((role, i) => (
            <RoleCard
              key={i}
              role={role}
              index={i}
              editing={editingIndex === i}
              onToggleEdit={() => onToggleEdit(i)}
              onChange={(next) => onRoleChange(i, next)}
              variants={cardVariants}
            />
          ))}
        </motion.div>
      </div>

      {/* publish */}
      <div className="sticky bottom-0 -mx-6 border-t border-border bg-background/80 px-6 py-4 backdrop-blur-md md:-mx-10 md:px-10">
        <Button
          type="button"
          size="lg"
          onClick={onPublish}
          disabled={publishing}
          className="h-12 w-full gap-2 text-base font-semibold"
        >
          {publishing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Publishing your project...
            </>
          ) : (
            <>
              <Rocket className="size-4" />
              Looks good! Publish Project
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
