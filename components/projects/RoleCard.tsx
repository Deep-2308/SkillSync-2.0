"use client";

import { motion, type Variants } from "framer-motion";
import { Check, Pencil, Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface AnalysisRole {
  title: string;
  description: string;
  requiredSkills: string[];
  importance: string;
}

interface RoleCardProps {
  role: AnalysisRole;
  index: number;
  editing: boolean;
  onToggleEdit: () => void;
  onChange: (next: AnalysisRole) => void;
  variants?: Variants;
}

const ROLE_BADGE_COLORS = [
  "border-primary/30 bg-primary/10 text-primary",
  "border-ai/30 bg-ai/10 text-ai",
  "border-accent/30 bg-accent/10 text-accent",
  "border-success/30 bg-success/10 text-success",
];

export function RoleCard({
  role,
  index,
  editing,
  onToggleEdit,
  onChange,
  variants,
}: RoleCardProps) {
  const badgeColor = ROLE_BADGE_COLORS[index % ROLE_BADGE_COLORS.length];

  function updateSkill(i: number, value: string) {
    const next = [...role.requiredSkills];
    next[i] = value;
    onChange({ ...role, requiredSkills: next });
  }

  function removeSkill(i: number) {
    onChange({
      ...role,
      requiredSkills: role.requiredSkills.filter((_, idx) => idx !== i),
    });
  }

  function addSkill() {
    onChange({ ...role, requiredSkills: [...role.requiredSkills, ""] });
  }

  return (
    <motion.article
      variants={variants}
      layout
      className="group relative rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/50 hover:shadow-[0_0_24px_-8px_var(--primary)]"
    >
      {/* header */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-md border text-xs font-bold",
              badgeColor
            )}
          >
            {index + 1}
          </span>
          {editing ? (
            <Input
              value={role.title}
              onChange={(e) => onChange({ ...role, title: e.target.value })}
              className="h-8 font-heading text-base font-bold"
              placeholder="Role title"
            />
          ) : (
            <h3 className="truncate font-heading text-lg font-bold tracking-tight text-text">
              {role.title}
            </h3>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
            <span className="size-1.5 rounded-full bg-success" />
            Accepting applicants
          </span>
          <button
            type="button"
            onClick={onToggleEdit}
            aria-label={editing ? "Done editing" : "Edit role"}
            className={cn(
              "grid size-7 place-items-center rounded-md border border-border text-text-muted transition-colors hover:border-primary/50 hover:text-primary",
              editing && "border-primary/50 text-primary"
            )}
          >
            {editing ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* description */}
      <p className="mb-4 text-sm leading-relaxed text-text-muted">
        {role.description}
      </p>

      {/* skills */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Required skills
        </span>
        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            {role.requiredSkills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 py-0.5 pl-2 pr-1"
              >
                <input
                  value={skill}
                  onChange={(e) => updateSkill(i, e.target.value)}
                  className="w-24 bg-transparent text-xs text-primary outline-none placeholder:text-primary/40"
                  placeholder="Skill"
                />
                <button
                  type="button"
                  onClick={() => removeSkill(i)}
                  aria-label="Remove skill"
                  className="grid size-4 place-items-center rounded-full text-primary/70 hover:bg-primary/20 hover:text-primary"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-1 text-xs text-text-muted hover:border-primary/50 hover:text-primary"
            >
              <Plus className="size-3" />
              Add
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {role.requiredSkills.map((skill, i) => (
              <span
                key={i}
                className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* importance */}
      {role.importance && (
        <p className="mt-4 border-t border-border pt-3 text-xs italic leading-relaxed text-text-muted">
          {role.importance}
        </p>
      )}
    </motion.article>
  );
}
