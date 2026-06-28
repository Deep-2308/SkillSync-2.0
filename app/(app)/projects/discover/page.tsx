"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Search, Sparkles, FolderPlus, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { SKILLS_BY_DOMAIN } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ProjectFeedCard,
  type FeedProject,
} from "@/components/projects/ProjectFeedCard";

type StatusFilter = "all" | "recruiting" | "building";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "recruiting", label: "Recruiting" },
  { value: "building", label: "Building" },
];

// Unique, sorted list of skills across every domain for the filter dropdown.
const ALL_SKILLS = Array.from(
  new Set(Object.values(SKILLS_BY_DOMAIN).flat())
).sort();

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 26 },
  },
};

export default function DiscoverProjectsPage() {
  const searchParams = useSearchParams();

  const [skill, setSkill] = useState(searchParams.get("skill") ?? "");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const [projects, setProjects] = useState<FeedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [mySkills, setMySkills] = useState<string[]>([]);

  // User's skills (used to highlight matching projects).
  useEffect(() => {
    let active = true;
    fetch("/api/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.user?.selectedSkills) {
          setMySkills(data.user.selectedSkills as string[]);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Fetch projects on load and whenever the skill / status filter changes.
  useEffect(() => {
    let active = true;
    setLoading(true);

    const params = new URLSearchParams({ status, limit: "48" });
    if (skill) params.set("skill", skill);

    fetch(`/api/projects?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (active) setProjects((data.projects ?? []) as FeedProject[]);
      })
      .catch(() => {
        if (active) setProjects([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [skill, status]);

  const mySkillSet = useMemo(() => new Set(mySkills), [mySkills]);

  function matchCountFor(p: FeedProject): number {
    const matched = new Set<string>();
    for (const role of p.roles) {
      if (role.isFilled) continue;
      for (const s of role.requiredSkills) {
        if (mySkillSet.has(s)) matched.add(s);
      }
    }
    return matched.size;
  }

  // Client-side title search + matched-first ordering.
  const visibleProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? projects.filter((p) => p.title.toLowerCase().includes(q))
      : projects;
    return [...filtered].sort((a, b) => matchCountFor(b) - matchCountFor(a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, search, mySkillSet]);

  const matchingCount = useMemo(
    () => projects.filter((p) => matchCountFor(p) > 0).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, mySkillSet]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
          Open Projects
        </h1>
        <p className="text-sm text-text-muted">
          Find a team that needs exactly what you can do.
        </p>
      </header>

      {/* Filter bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface/70 p-4 backdrop-blur-sm xl:flex-row xl:items-center xl:justify-between">
        {/* Status tabs */}
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              aria-pressed={status === tab.value}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
                status === tab.value
                  ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_var(--primary)]"
                  : "text-text-muted hover:text-text"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Skill filter */}
          <div className="relative">
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-text outline-none transition-colors focus-visible:border-ring sm:w-52"
            >
              <option value="">All skills</option>
              {ALL_SKILLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-9 bg-surface pl-9 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Matching highlight */}
      {!loading && mySkills.length > 0 && matchingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-5 py-4"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </span>
          <p className="text-sm text-text">
            We found{" "}
            <span className="font-semibold text-primary">{matchingCount}</span>{" "}
            {matchingCount === 1 ? "project" : "projects"} that match your
            verified skills.
          </p>
        </motion.div>
      )}

      {/* Grid / states */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="space-y-4 rounded-xl border border-border bg-surface/60 p-6"
            >
              <div className="skeleton-shimmer h-6 w-2/3 rounded-lg" />
              <div className="space-y-2">
                <div className="skeleton-shimmer h-4 w-full rounded" />
                <div className="skeleton-shimmer h-4 w-5/6 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="skeleton-shimmer h-6 w-20 rounded-full" />
                <div className="skeleton-shimmer h-6 w-24 rounded-full" />
              </div>
              <div className="skeleton-shimmer h-8 w-full rounded" />
            </div>
          ))}
        </div>
      ) : visibleProjects.length > 0 ? (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {visibleProjects.map((p) => (
            <ProjectFeedCard
              key={p._id}
              project={p}
              mySkills={mySkillSet}
              variants={cardVariants}
            />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl border border-border bg-surface text-text-muted">
            <FolderPlus className="size-6" />
          </span>
          <div>
            <p className="font-heading text-lg font-semibold text-text">
              No projects found
            </p>
            <p className="mt-1 max-w-sm text-sm text-text-muted">
              {search || skill
                ? "Try clearing your filters, or be the first to start a project here."
                : "Be the first to start a project and assemble your team."}
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/projects/create">
              <FolderPlus className="size-4" />
              Start a Project
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
