import Link from "next/link";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import {
  ShieldCheck,
  FolderOpen,
  Gauge,
  ArrowRight,
  Zap,
  Lightbulb,
  Sparkles,
  CheckCircle,
  Users,
  Clock,
} from "lucide-react";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Badge from "@/models/Badge";
import Project from "@/models/Project";
import User from "@/models/User";
import type { Difficulty } from "@/models/Badge";
import type { ProjectStatus } from "@/models/Project";

void User; // ensure model registered for populate

// ─── Lean shapes ───────────────────────────────────────────────────────────────
type LeanBadge = {
  _id: Types.ObjectId;
  skillName: string;
  difficulty?: Difficulty;
  score: number;
};
type LeanProject = {
  _id: Types.ObjectId;
  title: string;
  status: ProjectStatus;
  members?: { userId?: Types.ObjectId }[];
};
type LeanRecommended = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  tags: string[];
  ownerId?: { name?: string } | null;
  roles?: { isFilled: boolean }[];
  members?: unknown[];
  aiAnalysis?: { complexity?: string; estimatedDuration?: string };
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function greetingForHour(h: number): string {
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
function diffPill(d?: Difficulty): string {
  if (d === "advanced") return "bg-accent/15 text-accent";
  if (d === "intermediate") return "bg-primary/15 text-primary";
  return "bg-surface-2 text-text-muted";
}
function scoreBar(score: number): string {
  if (score > 85) return "bg-success";
  if (score >= 70) return "bg-primary";
  return "bg-accent";
}
const statusPill: Record<ProjectStatus, string> = {
  recruiting: "bg-primary/15 text-primary",
  building: "bg-accent/15 text-accent",
  completed: "bg-success/15 text-success",
  abandoned: "bg-surface-2 text-text-muted",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  await dbConnect();

  const [badges, activeProjects, recommended] = await Promise.all([
    Badge.find({ userId }).sort({ score: -1 }).lean<LeanBadge[]>(),
    Project.find({
      $or: [{ ownerId: userId }, { "members.userId": userId }],
      status: { $in: ["recruiting", "building"] },
    })
      .sort({ updatedAt: -1 })
      .limit(2)
      .lean<LeanProject[]>(),
    Project.find({ status: "recruiting", ownerId: { $ne: userId } })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("ownerId", "name")
      .lean<LeanRecommended[]>(),
  ]);

  const badgeCount = badges.length;
  const avgScore = badgeCount
    ? Math.round(badges.reduce((s, b) => s + b.score, 0) / badgeCount)
    : 0;

  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-8">
      {/* Greeting */}
      <header>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
          Good {greetingForHour(now.getHours())}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{dateLabel}</p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Verified Badges"
          value={badgeCount}
          icon={<ShieldCheck className="size-5" />}
          tone="text-primary bg-primary/10"
        />
        <StatCard
          label="Projects"
          value={activeProjects.length}
          icon={<FolderOpen className="size-5" />}
          tone="text-accent bg-accent/10"
        />
        <StatCard
          label="Avg Score"
          value={avgScore}
          icon={<Gauge className="size-5" />}
          tone="text-ai bg-ai/10"
        />
      </section>

      {/* Skill Passport */}
      <section className="space-y-4">
        <SectionHeader title="Your Skill Passport" count={badgeCount} />
        {badgeCount > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {badges.slice(0, 6).map((b) => (
              <article
                key={b._id.toString()}
                className="space-y-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-base font-semibold text-text">
                    {b.skillName}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${diffPill(b.difficulty)}`}
                  >
                    {b.difficulty ?? "—"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Score</span>
                    <span className="font-semibold text-text">{b.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full ${scoreBar(b.score)}`}
                      style={{ width: `${Math.min(b.score, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <CheckCircle className="size-3.5" />
                  Verified
                </span>
              </article>
            ))}
          </div>
        ) : (
          <EmptyCard
            icon={<ShieldCheck className="size-6" />}
            title="No verified skills yet"
            text="Prove a skill with an AI challenge to earn your first badge."
            cta={{ href: "/skills/prove", label: "Prove your first skill" }}
          />
        )}
      </section>

      {/* Your Projects */}
      <section className="space-y-4">
        <SectionHeader title="Your Projects" count={activeProjects.length} />
        {activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeProjects.map((p) => (
              <Link
                key={p._id.toString()}
                href={`/projects/${p._id.toString()}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-semibold text-text">
                    {p.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                    <Users className="size-3.5" />
                    {p.members?.length ?? 0} members
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusPill[p.status]}`}
                >
                  {p.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyCard
            icon={<Sparkles className="size-6" />}
            title="No active projects yet"
            text="Start a project and assemble your verified team."
            cta={{ href: "/projects/create", label: "Start a Project" }}
          />
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Link
          href="/skills/prove"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-transparent p-6 transition-colors hover:border-primary/50"
        >
          <div className="space-y-1">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
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
          className="group flex items-center justify-between gap-4 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/15 to-transparent p-6 transition-colors hover:border-accent/50"
        >
          <div className="space-y-1">
            <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-accent">
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

      {/* Discover */}
      {recommended.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold tracking-tight text-text">
              Discover
            </h2>
            <Link
              href="/projects/discover"
              className="inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-primary"
            >
              See all projects
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recommended.map((p) => {
              const openRoles =
                p.roles?.filter((r) => !r.isFilled).length ?? 0;
              return (
                <Link
                  key={p._id.toString()}
                  href={`/projects/${p._id.toString()}`}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"
                >
                  <h3 className="font-heading text-base font-bold tracking-tight text-text">
                    {p.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
                    {p.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-text-muted">
                    <span>
                      {openRoles} open {openRoles === 1 ? "role" : "roles"}
                    </span>
                    {p.aiAnalysis?.estimatedDuration && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {p.aiAnalysis.estimatedDuration}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </p>
        <span className={`grid size-9 place-items-center rounded-lg ${tone}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-text">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <h2 className="font-heading text-xl font-bold tracking-tight text-text">
        {title}
      </h2>
      <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-muted">
        {count}
      </span>
    </div>
  );
}

function EmptyCard({
  icon,
  title,
  text,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="font-heading text-lg font-medium text-text">{title}</p>
        <p className="mt-1 text-sm text-text-muted">{text}</p>
      </div>
      <Link
        href={cta.href}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
      >
        {cta.label}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
