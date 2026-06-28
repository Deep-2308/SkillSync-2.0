"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Settings,
  Users,
  UserPlus,
  Plus,
  X,
  ShieldCheck,
  Share2,
  Activity as ActivityIcon,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskCard, type TaskStatus } from "@/components/projects/TaskCard";

// ─── Types ───────────────────────────────────────────────────────────────────
interface WsUser {
  _id: string;
  name: string;
  image?: string;
  primaryDomain?: string;
}
interface WsMember {
  userId?: WsUser | null;
  role: string;
  joinedAt?: string;
}
interface WsProject {
  _id: string;
  title: string;
  description: string;
  status: "recruiting" | "building" | "completed" | "abandoned";
  tags: string[];
  createdAt?: string;
  ownerId: WsUser | null;
  members: WsMember[];
}
interface WsTask {
  _id: string;
  title: string;
  assignedTo: string | null;
  status: TaskStatus;
  createdAt?: string;
}
type BadgesByUser = Record<string, { skillName: string; score: number }[]>;

const STATUS_BADGE: Record<WsProject["status"], string> = {
  recruiting: "border-primary/30 bg-primary/10 text-primary",
  building: "border-accent/30 bg-accent/10 text-accent",
  completed: "border-success/30 bg-success/10 text-success",
  abandoned: "border-border bg-surface-2 text-text-muted",
};

const DOMAIN_COLORS: Record<string, string> = {
  "Frontend Dev": "text-primary",
  "UI/UX Design": "text-ai",
  "Backend Dev": "text-success",
  "Data Analysis": "text-accent",
  "Product Management": "text-primary",
  "Content Writing": "text-ai",
  Marketing: "text-accent",
  "DevOps/Cloud": "text-success",
};

const COLUMNS: { status: TaskStatus; label: string; dot: string; head: string }[] =
  [
    { status: "todo", label: "To Do", dot: "bg-text-muted", head: "text-text-muted" },
    {
      status: "in-progress",
      label: "In Progress",
      dot: "bg-accent",
      head: "text-accent",
    },
    { status: "done", label: "Done", dot: "bg-success", head: "text-success" },
  ];

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: "in-progress",
  "in-progress": "done",
  done: "todo",
};

function initials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function relativeDate(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Joined today";
  if (days === 1) return "Joined yesterday";
  if (days < 7) return `Joined ${days} days ago`;
  if (days < 30) return `Joined ${Math.floor(days / 7)} weeks ago`;
  return `Joined ${Math.floor(days / 30)} months ago`;
}

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const [project, setProject] = useState<WsProject | null>(null);
  const [badgesByUser, setBadgesByUser] = useState<BadgesByUser>({});
  const [tasks, setTasks] = useState<WsTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  // ─── Load project + tasks ────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/tasks`),
      ]);

      if (tRes.status === 403) {
        setDenied(true);
        return;
      }
      if (!pRes.ok) {
        setDenied(true);
        return;
      }

      const pData = await pRes.json();
      setProject(pData.project as WsProject);
      setBadgesByUser((pData.badgesByUser ?? {}) as BadgesByUser);

      if (tRes.ok) {
        const tData = await tRes.json();
        setTasks((tData.tasks ?? []) as WsTask[]);
      }
    } catch {
      setDenied(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // member lookup: owner + members, keyed by user id
  const memberMap = useMemo(() => {
    const map = new Map<string, WsUser>();
    if (project?.ownerId) map.set(project.ownerId._id, project.ownerId);
    project?.members.forEach((m) => {
      if (m.userId) map.set(m.userId._id, m.userId);
    });
    return map;
  }, [project]);

  async function handleAdvance(task: WsTask) {
    const next = NEXT_STATUS[task.status];
    setBusyTaskId(task._id);
    // optimistic
    setTasks((cur) =>
      cur.map((t) => (t._id === task._id ? { ...t, status: next } : t))
    );
    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task._id, status: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // revert
      setTasks((cur) =>
        cur.map((t) => (t._id === task._id ? { ...t, status: task.status } : t))
      );
      toast.error("Couldn't update the task. Try again.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleAddTask(status: TaskStatus, title: string) {
    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, status }),
      });
      const data = await res.json();
      if (!res.ok || !data?.task) throw new Error(data?.error);
      setTasks((cur) => [...cur, data.task as WsTask]);
    } catch {
      toast.error("Couldn't add the task.");
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/projects/${id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Project link copied"))
      .catch(() => toast.error("Couldn't copy the link"));
  }

  if (loading) return <WorkspaceSkeleton />;

  if (denied || !project) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="grid size-14 place-items-center rounded-2xl border border-border bg-surface text-text-muted">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="font-heading text-2xl font-bold text-text">
          Members only
        </h1>
        <p className="max-w-sm text-sm text-text-muted">
          This workspace is only available to people on the project team.
        </p>
        <Button asChild variant="outline">
          <Link href={`/projects/${id}`}>View project page</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-screen max-w-7xl flex-col gap-6 p-6 md:p-8">
      {/* Top bar */}
      <header className="flex flex-col items-start justify-between gap-3 border-b border-border pb-5 md:flex-row md:items-center">
        <div className="space-y-2">
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            Project page
          </Link>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text md:text-3xl">
            {project.title}
          </h1>
          <div className="flex items-center gap-3 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium capitalize",
                STATUS_BADGE[project.status]
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {project.status}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 font-medium text-text-muted">
              <Users className="size-3.5" />
              {project.members.length}{" "}
              {project.members.length === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => toast("Project settings coming soon")}
          aria-label="Project settings"
          className="grid size-9 place-items-center rounded-lg border border-border text-text-muted transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Settings className="size-4" />
        </button>
      </header>

      {/* Three columns */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Column 1 — Team */}
        <aside className="flex flex-col gap-3 overflow-y-auto lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold tracking-tight text-text">
              Team
            </h2>
            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-muted">
              {project.members.length}
            </span>
          </div>

          {project.members
            .filter((m) => m.userId)
            .map((m) => {
              const u = m.userId!;
              const badges = badgesByUser[u._id] ?? [];
              return (
                <article
                  key={u._id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-4 backdrop-blur-sm transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar size="lg">
                        {u.image && <AvatarImage src={u.image} />}
                        <AvatarFallback>{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-success" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-text">
                        {u.name}
                      </h3>
                      <p
                        className={cn(
                          "truncate text-sm",
                          DOMAIN_COLORS[u.primaryDomain ?? ""] ?? "text-primary"
                        )}
                      >
                        {m.role}
                      </p>
                    </div>
                  </div>

                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {badges.slice(0, 4).map((b, i) => (
                        <span
                          key={`${b.skillName}-${i}`}
                          className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-success"
                        >
                          <ShieldCheck className="size-2.5" />
                          {b.skillName}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-text-muted/70">
                    {relativeDate(m.joinedAt)}
                  </p>
                </article>
              );
            })}

          <Button
            type="button"
            variant="ghost"
            onClick={() => toast("Invites are coming soon")}
            className="mt-1 w-full gap-2 border border-dashed border-border"
          >
            <UserPlus className="size-4" />
            Invite
          </Button>
        </aside>

        {/* Column 2 — Task board */}
        <section className="min-h-0 overflow-y-auto lg:col-span-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.status);
              return (
                <div key={col.status} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <h3
                      className={cn(
                        "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider",
                        col.head
                      )}
                    >
                      <span className={cn("size-2 rounded-full", col.dot)} />
                      {col.label}
                    </h3>
                    <span className="text-xs text-text-muted/60">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {colTasks.map((task) => {
                      const assignee = task.assignedTo
                        ? memberMap.get(task.assignedTo)
                        : null;
                      return (
                        <TaskCard
                          key={task._id}
                          title={task.title}
                          status={task.status}
                          assignee={assignee}
                          busy={busyTaskId === task._id}
                          onAdvance={() => handleAdvance(task)}
                        />
                      );
                    })}

                    <AddTaskComposer
                      onAdd={(title) => handleAddTask(col.status, title)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Column 3 — Activity + info */}
        <aside className="flex flex-col gap-6 overflow-y-auto border-border lg:col-span-3 lg:border-l lg:pl-6">
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold tracking-tight text-text">
              <ActivityIcon className="size-4 text-primary" />
              Activity
            </h2>
            <ActivityFeed project={project} />
          </div>

          <div className="mt-auto space-y-4 rounded-xl border border-border bg-surface/70 p-4 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Project Info
            </h3>
            <p className="line-clamp-4 text-sm leading-relaxed text-text-muted">
              {project.description}
            </p>
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="uppercase tracking-wider text-text-muted">
                Started
              </span>
              <span className="font-semibold text-text">
                {project.createdAt
                  ? new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(project.createdAt))
                  : "—"}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleShare}
              className="w-full gap-2"
            >
              <Share2 className="size-4" />
              Share Project
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Add task composer ─────────────────────────────────────────────────────────
function AddTaskComposer({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function submit() {
    const title = value.trim();
    if (!title) return;
    onAdd(title);
    setValue("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-text-muted transition-colors hover:border-primary/50 hover:text-primary"
      >
        <Plus className="size-4" />
        Add task
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-2.5">
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Task title..."
        className="h-8 bg-surface-2 text-sm"
      />
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={submit} className="flex-1">
          Add
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
          aria-label="Cancel"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Activity feed (demo content) ──────────────────────────────────────────────
function ActivityFeed({ project }: { project: WsProject }) {
  const names = [
    project.ownerId?.name,
    ...project.members.map((m) => m.userId?.name),
  ].filter(Boolean) as string[];

  const owner = names[0] ?? "Someone";
  const second = names[1] ?? owner;
  const third = names[2] ?? owner;

  const items = [
    { who: owner, what: 'moved "Design wireframes" to Done', when: "2 hours ago", dot: "bg-success" },
    { who: second, what: "started Integrate Gemini API", when: "5 hours ago", dot: "bg-accent" },
    { who: third, what: `joined as ${project.members[2]?.role ?? "a teammate"}`, when: "1 day ago", dot: "bg-ai" },
    { who: owner, what: "created the project", when: "1 week ago", dot: "bg-text-muted" },
  ];

  return (
    <div className="relative space-y-5 border-l border-border pl-4">
      {items.map((it, i) => (
        <div key={i} className="relative">
          <span
            className={cn(
              "absolute -left-[21px] top-1 size-2 rounded-full border-2 border-background",
              it.dot
            )}
          />
          <p className="text-[13px] leading-snug text-text">
            <span className="font-semibold">{it.who}</span> {it.what}
          </p>
          <p className="mt-0.5 text-[11px] text-text-muted/60">{it.when}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function WorkspaceSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      <div className="space-y-3 border-b border-border pb-5">
        <div className="skeleton-shimmer h-8 w-72 rounded-lg" />
        <div className="flex gap-3">
          <div className="skeleton-shimmer h-6 w-24 rounded-full" />
          <div className="skeleton-shimmer h-6 w-28 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-surface/60 skeleton-shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <div className="skeleton-shimmer h-5 w-20 rounded" />
              <div className="skeleton-shimmer h-20 rounded-lg" />
              <div className="skeleton-shimmer h-20 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="space-y-4 lg:col-span-3">
          <div className="skeleton-shimmer h-40 rounded-xl" />
          <div className="skeleton-shimmer h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
