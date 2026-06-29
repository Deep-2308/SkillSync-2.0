"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Code2,
  Globe,
  ShieldCheck,
  Pencil,
  ArrowRight,
  Sparkles,
  FolderOpen,
  Users,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type {
  PublicProfile,
  ProfileBadge,
  ProfileProject,
} from "@/lib/profile";

const DIFFICULTY_BORDER: Record<string, string> = {
  beginner: "border-border",
  intermediate: "border-primary/40 hover:border-primary/70",
  advanced: "border-accent/40 hover:border-accent/70",
};
const DIFFICULTY_PILL: Record<string, string> = {
  beginner: "bg-surface-2 text-text-muted",
  intermediate: "bg-primary/15 text-primary",
  advanced: "bg-accent/15 text-accent",
};
const STATUS_PILL: Record<string, string> = {
  recruiting: "border-primary/30 bg-primary/10 text-primary",
  building: "border-accent/30 bg-accent/10 text-accent",
  completed: "border-success/30 bg-success/10 text-success",
  abandoned: "border-border bg-surface-2 text-text-muted",
};

function initials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
function scoreColor(score: number): { bar: string; text: string } {
  if (score > 85) return { bar: "bg-success", text: "text-success" };
  if (score >= 70) return { bar: "bg-primary", text: "text-primary" };
  return { bar: "bg-accent", text: "text-accent" };
}

export function ProfileExperience({
  profile,
  isOwn,
}: {
  profile: PublicProfile;
  isOwn: boolean;
}) {
  const reduce = useReducedMotion();
  const { user, badges, projects, avgScore, privateStats } = profile;

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.04 },
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

  const stats = [
    { value: user.badgeCount, label: "Verified Badges" },
    { value: user.projectCount, label: "Projects" },
    { value: avgScore, label: "Avg Score" },
  ];
  if (isOwn && privateStats) {
    stats.push({ value: privateStats.totalAttempts, label: "Attempts" });
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl space-y-10 p-6 md:p-8"
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <motion.header
        variants={item}
        className="relative overflow-hidden rounded-3xl border border-border bg-surface/70 p-6 backdrop-blur-sm md:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-[100px]" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* identity */}
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="rounded-full bg-[linear-gradient(135deg,#5eead4,#22d3ee,#0891b2)] p-[3px] shadow-[0_0_34px_-8px_var(--primary)]">
              <Avatar className="size-24 border-2 border-surface md:size-28">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="text-2xl">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-3xl font-bold tracking-tight text-text md:text-4xl">
                  {user.name}
                </h1>
                {isOwn && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toast("Profile editing is coming soon")}
                    className="gap-1.5"
                  >
                    <Pencil className="size-3.5" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {user.primaryDomain && (
                <p className="font-heading text-lg font-semibold text-primary">
                  {user.primaryDomain}
                </p>
              )}

              {user.bio && (
                <p className="max-w-xl text-sm leading-relaxed text-text-muted">
                  {user.bio}
                </p>
              )}

              {(user.githubUrl || user.portfolioUrl) && (
                <div className="flex items-center gap-2 pt-1">
                  {user.githubUrl && (
                    <SocialLink href={user.githubUrl} label="GitHub">
                      <Code2 className="size-4" />
                    </SocialLink>
                  )}
                  {user.portfolioUrl && (
                    <SocialLink href={user.portfolioUrl} label="Portfolio">
                      <Globe className="size-4" />
                    </SocialLink>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* stats strip */}
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:flex sm:gap-0">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-surface px-5 py-4 text-center sm:min-w-[110px]"
              >
                <p className="font-heading text-3xl font-bold tracking-tight text-text">
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* ── Skill Passport ───────────────────────────────────────── */}
      <section className="space-y-5">
        <motion.div variants={item} className="flex items-center gap-3">
          <h2 className="flex items-center gap-2.5 font-heading text-2xl font-bold tracking-tight text-text">
            <BadgeCheck className="size-6 text-primary" />
            Skill Passport
          </h2>
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-muted">
            {badges.length}
          </span>
        </motion.div>

        {badges.length > 0 ? (
          <motion.div
            variants={container}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} variants={item} />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={<ShieldCheck className="size-6" />}
            title="No verified skills yet"
            text={
              isOwn
                ? "Prove a skill with an AI challenge to earn your first badge."
                : "This builder hasn't earned any badges yet."
            }
            cta={isOwn ? { href: "/skills/prove", label: "Prove a skill" } : undefined}
          />
        )}
      </section>

      {/* ── Projects ─────────────────────────────────────────────── */}
      <section className="space-y-5">
        <motion.h2
          variants={item}
          className="flex items-center gap-2.5 font-heading text-2xl font-bold tracking-tight text-text"
        >
          <FolderOpen className="size-6 text-accent" />
          Projects
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-muted">
            {projects.length}
          </span>
        </motion.h2>

        {projects.length > 0 ? (
          <motion.div
            variants={container}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                variants={item}
              />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={<Sparkles className="size-6" />}
            title="No projects yet"
            text={
              isOwn
                ? "Start a project and assemble your team."
                : "This builder isn't on any projects yet."
            }
            cta={
              isOwn ? { href: "/projects/create", label: "Start a Project" } : undefined
            }
          />
        )}
      </section>
    </motion.div>
  );
}

// ─── Badge card ────────────────────────────────────────────────────────────────
function BadgeCard({
  badge,
  variants,
}: {
  badge: ProfileBadge;
  variants: Variants;
}) {
  const difficulty = badge.difficulty ?? "beginner";
  const sc = scoreColor(badge.score);

  return (
    <motion.article
      variants={variants}
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-surface/80 p-5 backdrop-blur-sm transition-colors",
        DIFFICULTY_BORDER[difficulty]
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      {/* verified chip */}
      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
        <ShieldCheck className="size-3" />
        Verified
      </span>

      <div className="relative z-10 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
              DIFFICULTY_PILL[difficulty]
            )}
          >
            {difficulty}
          </span>
          <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-muted">
            {badge.domain}
          </span>
        </div>

        <h3 className="pr-16 font-heading text-xl font-bold tracking-tight text-text">
          {badge.skillName}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Score</span>
            <span className={cn("font-semibold tabular-nums", sc.text)}>
              {badge.score} / 100
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={cn("h-full rounded-full", sc.bar)}
              style={{ width: `${Math.min(badge.score, 100)}%` }}
            />
          </div>
        </div>

        {badge.badgeSummary && (
          <p className="line-clamp-2 text-sm italic leading-relaxed text-text-muted">
            “{badge.badgeSummary}”
          </p>
        )}

        <p className="border-t border-border pt-3 text-xs text-text-muted/70">
          Issued {formatDate(badge.issuedAt)}
        </p>
      </div>
    </motion.article>
  );
}

// ─── Project card ──────────────────────────────────────────────────────────────
function ProjectCard({
  project,
  variants,
}: {
  project: ProfileProject;
  variants: Variants;
}) {
  return (
    <motion.div variants={variants} layout>
      <Link
        href={`/projects/${project.id}`}
        className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface/70 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_24px_-10px_var(--primary)]"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-bold tracking-tight text-text">
            {project.title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
              STATUS_PILL[project.status]
            )}
          >
            {project.status}
          </span>
        </div>

        <p className="text-xs font-medium text-primary">{project.myRole}</p>

        <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
          {project.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {project.teamSize} {project.teamSize === 1 ? "member" : "members"}
          </span>
          <span className="inline-flex items-center gap-1 text-text-muted transition-colors group-hover:text-primary">
            View
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────────
function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid size-9 place-items-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:border-primary/50 hover:text-primary"
    >
      {children}
    </a>
  );
}

function EmptyState({
  icon,
  title,
  text,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="font-heading text-lg font-medium text-text">{title}</p>
        <p className="mt-1 text-sm text-text-muted">{text}</p>
      </div>
      {cta && (
        <Button asChild size="lg" className="gap-1.5">
          <Link href={cta.href}>
            {cta.label}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
