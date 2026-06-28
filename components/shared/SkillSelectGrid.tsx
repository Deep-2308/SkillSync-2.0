"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillSelectGridProps {
  skills: string[];
  selected: string | null;
  onSelect: (skill: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Single-select pill grid for choosing the skill to be assessed.
 *
 * The selected pill gets an animated mint/cyan border glow (the platform's
 * `--primary`) with a smooth transition. Built on the Midnight Craft tokens
 * so it stays consistent with the rest of the dark-themed UI.
 */
export function SkillSelectGrid({
  skills,
  selected,
  onSelect,
  disabled = false,
  className,
}: SkillSelectGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2.5", className)}>
      {skills.map((skill) => {
        const active = selected === skill;
        return (
          <button
            key={skill}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(skill)}
            aria-pressed={active}
            className={cn(
              "relative inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium",
              "transition-all duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              disabled && "cursor-not-allowed opacity-50",
              active
                ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_1px_var(--primary),0_0_18px_-2px_var(--primary)]"
                : "border-border bg-surface text-text-muted hover:border-primary/50 hover:text-text"
            )}
          >
            <span className="truncate">{skill}</span>
            {active && <Check className="size-3.5 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
