"use client";

import {
  Code2,
  Palette,
  Server,
  BarChart2,
  Boxes,
  PenLine,
  Megaphone,
  Cloud,
  Check,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DOMAINS, type PrimaryDomain } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = {
  Code2,
  Palette,
  Server,
  BarChart2,
  Boxes,
  PenLine,
  Megaphone,
  Cloud,
};

interface DomainGridProps {
  selected: PrimaryDomain | null;
  onSelect: (domain: PrimaryDomain) => void;
}

export function DomainGrid({ selected, onSelect }: DomainGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {DOMAINS.map((domain) => {
        const Icon = ICONS[domain.icon] ?? Boxes;
        const active = selected === domain.value;
        return (
          <button
            key={domain.value}
            type="button"
            onClick={() => onSelect(domain.value)}
            aria-pressed={active}
            className={cn(
              "group relative flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all",
              active
                ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary),0_0_24px_-6px_var(--primary)]"
                : "border-border bg-surface hover:border-primary/50 hover:bg-surface-2"
            )}
          >
            {active && (
              <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            )}
            <span
              className={cn(
                "grid size-10 place-items-center rounded-md border transition-colors",
                active
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-surface-2 text-text-muted group-hover:text-text"
              )}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-text" : "text-text"
                )}
              >
                {domain.label}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-text-muted">
                {domain.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
