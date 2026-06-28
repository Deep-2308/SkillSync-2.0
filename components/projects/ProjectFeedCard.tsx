"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Clock, Gauge, CheckCircle2, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

export type Complexity = "low" | "medium" | "high";

export interface FeedOwner {
  _id: string;
  name: string;
  image?: string;
  primaryDomain?: string;
}

export interface FeedMember {
  userId?: { _id: string; name: string; image?: string } | null;
  role: string;
}

export interface FeedRole {
  _id?: string;
  title: string;
  requiredSkills: string[];
  isFilled: boolean;
}

export interface FeedProject {
  _id: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
  ownerId: FeedOwner | null;
  members: FeedMember[];
  roles: FeedRole[];
  aiAnalysis?: {
    summary?: string;
    estimatedDuration?: string;
    complexity?: Complexity;
  };
}

const ROLE_PILL_COLORS = [
  "border-primary/30 bg-primary/10 text-primary",
  "border-ai/30 bg-ai/10 text-ai",
  "border-accent/30 bg-accent/10 text-accent",
  "border-success/30 bg-success/10 text-success",
];

const COMPLEXITY_LABEL: Record<Complexity, string> = {
  low: "Low complexity",
  medium: "Med. complexity",
  high: "Adv. complexity",
};

function initials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

interface ProjectFeedCardProps {
  project: FeedProject;
  mySkills: Set<string>;
  variants?: Variants;
}

export function ProjectFeedCard({
  project,
  mySkills,
  variants,
}: ProjectFeedCardProps) {
  const openRoles = project.roles.filter((r) => !r.isFilled);

  const matchedSkills = new Set<string>();
  for (const role of openRoles) {
    for (const skill of role.requiredSkills) {
      if (mySkills.has(skill)) matchedSkills.add(skill);
    }
  }
  const matchCount = matchedSkills.size;

  const summary =
    project.aiAnalysis?.summary?.trim() || project.description;
  const complexity = project.aiAnalysis?.complexity;
  const duration = project.aiAnalysis?.estimatedDuration;

  const visibleMembers = project.members
    .filter((m) => m.userId)
    .slice(0, 4);
  const extraMembers = Math.max(0, project.members.length - visibleMembers.length);

  return (
    <motion.article
      variants={variants}
      layout
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border bg-surface/70 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_24px_-10px_var(--primary)]",
        matchCount > 0 ? "border-primary/30" : "border-border"
      )}
    >
      {matchCount > 0 && (
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-xl font-bold leading-tight tracking-tight text-text">
          {project.title}
        </h3>
        {visibleMembers.length > 0 && (
          <AvatarGroup className="shrink-0">
            {visibleMembers.map((m) => (
              <Avatar key={m.userId?._id} size="sm">
                {m.userId?.image && <AvatarImage src={m.userId.image} />}
                <AvatarFallback>{initials(m.userId?.name)}</AvatarFallback>
              </Avatar>
            ))}
            {extraMembers > 0 && (
              <AvatarGroupCount>+{extraMembers}</AvatarGroupCount>
            )}
          </AvatarGroup>
        )}
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
        {summary}
      </p>

      {/* owner */}
      {project.ownerId && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Avatar size="sm">
            {project.ownerId.image && (
              <AvatarImage src={project.ownerId.image} />
            )}
            <AvatarFallback>{initials(project.ownerId.name)}</AvatarFallback>
          </Avatar>
          <span>
            by <span className="text-text">{project.ownerId.name}</span>
          </span>
        </div>
      )}

      {/* open roles */}
      {openRoles.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Open roles
          </span>
          <div className="flex flex-wrap gap-1.5">
            {openRoles.slice(0, 4).map((role, i) => (
              <span
                key={role._id ?? role.title}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  ROLE_PILL_COLORS[i % ROLE_PILL_COLORS.length]
                )}
              >
                {role.title}
              </span>
            ))}
            {openRoles.length > 4 && (
              <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs text-text-muted">
                +{openRoles.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {matchCount > 0 && (
        <div className="flex w-fit items-center gap-1.5 rounded-lg border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
          <CheckCircle2 className="size-3.5" />
          Matches {matchCount} of your skills
        </div>
      )}

      {/* footer */}
      <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
        <div className="flex flex-wrap gap-4 text-xs text-text-muted">
          {complexity && (
            <span className="flex items-center gap-1">
              <Gauge className="size-3.5" />
              {COMPLEXITY_LABEL[complexity]}
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {project.members.length}
          </span>
        </div>

        <Link
          href={`/projects/${project._id}`}
          aria-label="View project"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
        >
          View
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}
