"use client";

import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_SKILLS } from "@/lib/constants";

interface SkillPillsProps {
  skills: string[];
  selected: string[];
  onToggle: (skill: string) => void;
}

export function SkillPills({ skills, selected, onToggle }: SkillPillsProps) {
  const atLimit = selected.length >= MAX_SKILLS;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => {
        const active = selected.includes(skill);
        const disabled = !active && atLimit;
        return (
          <button
            key={skill}
            type="button"
            onClick={() => onToggle(skill)}
            disabled={disabled}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface text-text-muted hover:border-primary/50 hover:text-text",
              disabled && "cursor-not-allowed opacity-40 hover:border-border"
            )}
          >
            {skill}
            {active ? (
              <Check className="size-3.5" />
            ) : (
              <Plus className="size-3.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
