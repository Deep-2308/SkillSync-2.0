import React from "react";
import { Sparkles } from "lucide-react";

interface AIGeneratedBadgeProps {
  label?: string;
  className?: string;
}

export function AIGeneratedBadge({ label = "AI Generated", className = "" }: AIGeneratedBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide material-proof-violet ${className}`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}
