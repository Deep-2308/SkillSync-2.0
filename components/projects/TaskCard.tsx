"use client";

import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type TaskStatus = "todo" | "in-progress" | "done";

export interface TaskAssignee {
  _id: string;
  name: string;
  image?: string;
}

interface TaskCardProps {
  title: string;
  status: TaskStatus;
  assignee?: TaskAssignee | null;
  onAdvance: () => void;
  busy?: boolean;
}

const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-text-muted",
  "in-progress": "bg-accent shadow-[0_0_8px_var(--accent)]",
  done: "bg-success shadow-[0_0_8px_var(--success)]",
};

const NEXT_LABEL: Record<TaskStatus, string> = {
  todo: "Start",
  "in-progress": "Complete",
  done: "Reopen",
};

function initials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function TaskCard({
  title,
  status,
  assignee,
  onAdvance,
  busy,
}: TaskCardProps) {
  const done = status === "done";
  const inProgress = status === "in-progress";

  return (
    <motion.button
      type="button"
      layout
      onClick={onAdvance}
      disabled={busy}
      title={`Click to ${NEXT_LABEL[status].toLowerCase()}`}
      className={cn(
        "group relative flex w-full flex-col gap-3 overflow-hidden rounded-lg border bg-surface p-3 text-left transition-all",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_18px_-8px_var(--primary)]",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60",
        inProgress ? "border-primary/30" : "border-border",
        done && "opacity-70 hover:opacity-100"
      )}
    >
      {inProgress && (
        <span className="absolute inset-y-0 left-0 w-1 bg-primary" />
      )}

      <div className={cn("flex items-start gap-2", inProgress && "pl-2")}>
        <GripVertical className="mt-0.5 size-4 shrink-0 text-text-muted/50 transition-colors group-hover:text-text-muted" />
        <p
          className={cn(
            "flex-1 text-sm font-medium leading-snug text-text",
            done && "text-text-muted line-through"
          )}
        >
          {title}
        </p>
      </div>

      <div
        className={cn(
          "flex items-center justify-between",
          inProgress ? "pl-8" : "pl-6"
        )}
      >
        <span className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", STATUS_DOT[status])} />
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
            {NEXT_LABEL[status]}
          </span>
        </span>

        {assignee && (
          <Avatar size="sm">
            {assignee.image && <AvatarImage src={assignee.image} />}
            <AvatarFallback>{initials(assignee.name)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </motion.button>
  );
}
