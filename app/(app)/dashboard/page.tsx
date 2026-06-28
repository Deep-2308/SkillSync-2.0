import Link from "next/link";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import {
  ShieldCheck,
  FolderOpen,
  Zap,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Badge from "@/models/Badge";
import Project from "@/models/Project";
import type { Difficulty } from "@/models/Badge";
import type { ProjectStatus } from "@/models/Project";

// ─── Lean query shapes ───────────────────────────────────────────────────────
type LeanBadge = {
  _id: Types.ObjectId;
  skillName: string;
  difficulty?: Difficulty;
  score: number;
  badgeSummary?: string;
  issuedAt: Date;
};

type LeanProject = {
  _id: Types.ObjectId;
  title: string;
  status: ProjectStatus;
  members?: { userId: Types.ObjectId }[];
};

// ─── Presentation helpers ────────────────────────────────────────────────────
function greetingForHour(hour: number): string {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function difficultyPillClasses(difficulty?: Difficulty): string {
  switch (difficulty) {
    case "advanced":
      return "bg-accent/15 text-accent";
    case "intermediate":
      return "bg-primary/15 text-primary";
    default:
      return "bg-muted text-text-muted";
  }
}

function scoreBarClass(score: number): string {
  if (score > 85) return "bg-success";
  if (score >= 70) return "bg-primary";
  if (score >= 60) return "bg-accent";
  return "bg-error";
}

function scoreTextClass(score: number): string {
  if (score > 85) return "text-success";
  if (score >= 70) return "text-primary";
  if (score >= 60) return "text-accent";
  return "text-error";
}

const projectStatusClasses: Record<ProjectStatus, string> = {
  recruiting: "bg-primary/15 text-primary",
  building: "bg-accent/15 text-accent",
  completed: "bg-success/15 text-success",
  abandoned: "bg-muted text-text-muted",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  await dbConnect();

  const [badgeCount, recentBadges, activeProjects] = await Promise.all([
    Badge.countDocuments({ userId }),
    Badge.find({ userId })
      .sort({ issuedAt: -1 })
      .limit(3)
      .lean<LeanBadge[]>(),
    Project.find({
      $or: [{ ownerId: userId }, { "members.userId": userId }],
      status: { $in: ["recruiting", "building"] },
    })
      .limit(2)
      .lean<LeanProject[]>(),
  ]);

  const now = new Date();
  const greeting = greetingForHour(now.getHours());
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-8">
      {/* SECTION 1 — Greeting */}
      <header>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
          Good {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{dateLabel}</p>
      </header>

      {/* SECTION 2 — Stats row */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Verified Badges
            </p>
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
          </div>
          <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-text">
            {badgeCount}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Active Projects
            </p>
            <span className="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent">
              <FolderOpen className="size-5" />
            </span>
          </div>
          <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-text">
            {activeProjects.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Ready to build?
            </p>
            <span className="grid size-9 place-items-center rounded-lg bg-ai/10 text-ai">
              <Zap className="size-5" />
            </span>
          </div>
          <Link
            href="/skills/prove"
            className="mt-3 inline-flex items-center gap-1.5 font-heading text-lg font-bold tracking-tight text-text transition-colors hover:text-ai"
          >
            Prove a skill
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* SECTION 3 — Skill Passport */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold tracking-tight text-text">
          Your Skill Passport
        </h2>

        {recentBadges.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recentBadges.map((badge) => (
              <article
                key={badge._id.toString()}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-base font-medium text-text">
                    {badge.skillName}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${difficultyPillClasses(
                      badge.difficulty
                    )}`}
                  >
                    {badge.difficulty ?? "—"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Score</span>
                    <span
                      className={`font-semibold ${scoreTextClass(badge.score)}`}
                    >
                      {badge.score} / 100
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full ${scoreBarClass(
                        badge.score
                      )}`}
                      style={{ width: `${Math.min(badge.score, 100)}%` }}
                    />
                  </div>
                </div>

                {badge.badgeSummary && (
                  <p className="line-clamp-2 text-sm text-text-muted">
                    {badge.badgeSummary}
                  </p>
                )}

                <span className="mt-auto inline-flex w-fit items-center gap-1 text-xs font-medium text-success">
                  <CheckCircle className="size-3.5" />
                  Verified
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <p className="font-heading text-lg font-medium text-text">
                No verified skills yet
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Prove a skill with an AI challenge to earn your first badge.
              </p>
            </div>
            <Link
              href="/skills/prove"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Prove your first skill
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </section>

      {/* SECTION 4 — Quick Actions */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Link
          href="/skills/prove"
          className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-gradient-to-br from-background to-primary/10 p-6 transition-colors hover:border-primary/50"
        >
          <div className="space-y-1">
            <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Zap className="size-6" />
            </span>
            <h3 className="mt-3 font-heading text-lg font-bold tracking-tight text-text">
              Prove a New Skill
            </h3>
            <p className="text-sm text-text-muted">Generate an AI challenge</p>
          </div>
          <ArrowRight className="size-5 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>

        <Link
          href="/projects/create"
          className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-gradient-to-br from-background to-accent/10 p-6 transition-colors hover:border-accent/50"
        >
          <div className="space-y-1">
            <span className="grid size-11 place-items-center rounded-lg bg-accent/10 text-accent">
              <Lightbulb className="size-6" />
            </span>
            <h3 className="mt-3 font-heading text-lg font-bold tracking-tight text-text">
              Start a Project
            </h3>
            <p className="text-sm text-text-muted">Find your co-builders</p>
          </div>
          <ArrowRight className="size-5 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
        </Link>
      </section>

      {/* SECTION 5 — Active Projects */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold tracking-tight text-text">
          Active Projects
        </h2>

        {activeProjects.length > 0 ? (
          <div className="space-y-3">
            {activeProjects.map((project) => {
              const memberCount = project.members?.length ?? 0;
              return (
                <Link
                  key={project._id.toString()}
                  href={`/projects/${project._id.toString()}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-heading text-base font-medium text-text">
                      {project.title}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${projectStatusClasses[project.status]}`}
                  >
                    {project.status}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
              <Sparkles className="size-6" />
            </span>
            <div>
              <p className="font-heading text-lg font-medium text-text">
                No active projects yet
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Discover projects and find a team to build with.
              </p>
            </div>
            <Link
              href="/projects/discover"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent/50"
            >
              Browse projects
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
