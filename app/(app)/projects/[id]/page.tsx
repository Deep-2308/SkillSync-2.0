"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Target,
  Flag,
  Gauge,
  Clock,
  Users,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ───────────────────────────────────────────────────────────────────
type Complexity = "low" | "medium" | "high";

interface DetailUser {
  _id: string;
  name: string;
  image?: string;
  primaryDomain?: string;
  bio?: string;
}
interface DetailRole {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  importance: string;
  isFilled: boolean;
}
interface DetailMember {
  userId?: DetailUser | null;
  role: string;
}
interface DetailProject {
  _id: string;
  title: string;
  description: string;
  ownerRole: string;
  status: "recruiting" | "building" | "completed" | "abandoned";
  tags: string[];
  ownerId: DetailUser | null;
  aiAnalysis?: {
    summary?: string;
    problemStatement?: string;
    targetOutcome?: string;
    estimatedDuration?: string;
    complexity?: Complexity;
  };
  roles: DetailRole[];
  members: DetailMember[];
}
type BadgesByUser = Record<
  string,
  { skillName: string; difficulty?: string; score: number }[]
>;

const STATUS_STYLES: Record<DetailProject["status"], string> = {
  recruiting: "border-primary/30 bg-primary/10 text-primary",
  building: "border-accent/30 bg-accent/10 text-accent",
  completed: "border-success/30 bg-success/10 text-success",
  abandoned: "border-border bg-surface-2 text-text-muted",
};
const COMPLEXITY_STYLES: Record<Complexity, string> = {
  low: "border-success/30 bg-success/10 text-success",
  medium: "border-accent/30 bg-accent/10 text-accent",
  high: "border-error/30 bg-error/10 text-error",
};

function initials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: session } = useSession();

  const [project, setProject] = useState<DetailProject | null>(null);
  const [badgesByUser, setBadgesByUser] = useState<BadgesByUser>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // apply dialog
  const [applyOpen, setApplyOpen] = useState(false);
  const [roleId, setRoleId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/projects/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        setProject(data.project as DetailProject);
        setBadgesByUser((data.badgesByUser ?? {}) as BadgesByUser);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = useMemo(
    () => !!session?.user?.id && project?.ownerId?._id === session.user.id,
    [session, project]
  );
  const openRoles = useMemo(
    () => project?.roles.filter((r) => !r.isFilled) ?? [],
    [project]
  );

  function openApply(preselectRoleId?: string) {
    setRoleId(preselectRoleId ?? openRoles[0]?._id ?? "");
    setMessage("");
    setApplyOpen(true);
  }

  async function submitApplication() {
    if (!roleId) {
      toast.error("Pick a role to apply for.");
      return;
    }
    if (message.trim().length < 20) {
      toast.error("Tell them a bit more — at least 20 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Failed to apply."
        );
      }
      toast.success("Application sent! The owner will review it soon.");
      setApplyOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <DetailSkeleton />;

  if (notFound || !project) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-heading text-2xl font-bold text-text">
          Project not found
        </h1>
        <p className="text-sm text-text-muted">
          It may have been removed or the link is incorrect.
        </p>
        <Button asChild variant="outline">
          <Link href="/projects/discover">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const ai = project.aiAnalysis;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
      <Link
        href="/projects/discover"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur-sm md:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-text md:text-4xl">
            {project.title}
          </h1>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium capitalize",
              STATUS_STYLES[project.status]
            )}
          >
            {project.status}
          </span>
        </div>

        {project.ownerId && (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm">
              {project.ownerId.image && (
                <AvatarImage src={project.ownerId.image} />
              )}
              <AvatarFallback>{initials(project.ownerId.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-text-muted">
              Led by <span className="text-text">{project.ownerId.name}</span> ·{" "}
              {project.ownerRole}
            </span>
          </div>
        )}

        <p className="text-sm leading-relaxed text-text-muted md:text-base">
          {project.description}
        </p>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {!isOwner && openRoles.length > 0 && project.status === "recruiting" && (
          <Button
            type="button"
            size="lg"
            onClick={() => openApply()}
            className="gap-2"
          >
            <Sparkles className="size-4" />
            Apply to join
          </Button>
        )}
        {isOwner && (
          <p className="text-xs text-text-muted">
            This is your project — manage applications from your workspace.
          </p>
        )}
      </motion.header>

      {/* AI analysis */}
      {ai && (
        <section className="space-y-4 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur-sm md:p-8">
          <h2 className="flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight text-text">
            <Sparkles className="size-5 text-ai" />
            AI Analysis
          </h2>

          {ai.summary && (
            <p className="text-sm leading-relaxed text-text-muted">
              {ai.summary}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {ai.problemStatement && (
              <InfoTile
                icon={<Target className="size-4 text-accent" />}
                label="Problem"
                text={ai.problemStatement}
              />
            )}
            {ai.targetOutcome && (
              <InfoTile
                icon={<Flag className="size-4 text-success" />}
                label="Target outcome"
                text={ai.targetOutcome}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {ai.complexity && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize",
                  COMPLEXITY_STYLES[ai.complexity]
                )}
              >
                <Gauge className="size-3.5" />
                {ai.complexity} complexity
              </span>
            )}
            {ai.estimatedDuration && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-text-muted">
                <Clock className="size-3.5" />
                {ai.estimatedDuration}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Open roles */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold tracking-tight text-text">
          Open Roles <span className="text-text-muted">({openRoles.length})</span>
        </h2>

        {openRoles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {openRoles.map((role) => (
              <article
                key={role._id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading text-lg font-bold tracking-tight text-text">
                    {role.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                    <span className="size-1.5 rounded-full bg-success" />
                    Open
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">
                  {role.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {role.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {role.importance && (
                  <p className="text-xs italic text-text-muted">
                    {role.importance}
                  </p>
                )}
                {!isOwner && project.status === "recruiting" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openApply(role._id)}
                    className="mt-1 w-fit gap-1.5"
                  >
                    Apply for this role
                  </Button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-surface/60 p-6 text-sm text-text-muted">
            All roles on this project are filled.
          </p>
        )}
      </section>

      {/* Team */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-text">
          <Users className="size-5 text-primary" />
          Team <span className="text-text-muted">({project.members.length})</span>
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {project.members
            .filter((m) => m.userId)
            .map((m) => {
              const badges = badgesByUser[m.userId!._id] ?? [];
              return (
                <article
                  key={m.userId!._id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      {m.userId!.image && (
                        <AvatarImage src={m.userId!.image} />
                      )}
                      <AvatarFallback>
                        {initials(m.userId!.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-base font-semibold text-text">
                        {m.userId!.name}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {m.role}
                      </p>
                    </div>
                  </div>

                  {badges.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {badges.slice(0, 5).map((b, i) => (
                        <span
                          key={`${b.skillName}-${i}`}
                          className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"
                        >
                          <ShieldCheck className="size-3" />
                          {b.skillName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">No verified badges yet</p>
                  )}
                </article>
              );
            })}
        </div>
      </section>

      {/* Apply dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply to {project.title}</DialogTitle>
            <DialogDescription>
              Pick the role you want and tell the owner why you&apos;re a great
              fit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="role"
                className="text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Role
              </label>
              <select
                id="role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus-visible:border-ring"
              >
                {openRoles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="message"
                className="text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Share relevant experience, proven skills, and how you'd contribute..."
                className="resize-y bg-surface text-sm"
              />
              <p className="text-xs text-text-muted">
                {message.trim().length}/20 characters minimum
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={submitApplication}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Submit application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
        {icon}
        {label}
      </div>
      <p className="text-sm leading-relaxed text-text">{text}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
      <div className="skeleton-shimmer h-4 w-32 rounded" />
      <div className="space-y-4 rounded-2xl border border-border bg-surface/70 p-8">
        <div className="skeleton-shimmer h-9 w-2/3 rounded-lg" />
        <div className="skeleton-shimmer h-4 w-40 rounded" />
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border bg-surface/60 p-5"
          >
            <div className="skeleton-shimmer h-5 w-1/2 rounded" />
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="skeleton-shimmer h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
