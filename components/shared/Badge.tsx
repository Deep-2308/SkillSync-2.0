import { cn } from "@/lib/utils";

interface BadgeDisplayProps {
  level: "bronze" | "silver" | "gold" | "platinum";
  title: string;
  skill: string;
  size?: "sm" | "md" | "lg";
}

const levelConfig = {
  bronze: {
    icon: "🥉",
    gradient: "from-amber-700 to-amber-500",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
  },
  silver: {
    icon: "🥈",
    gradient: "from-slate-400 to-slate-300",
    border: "border-slate-400/30",
    bg: "bg-slate-400/10",
  },
  gold: {
    icon: "🥇",
    gradient: "from-yellow-500 to-yellow-300",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
  },
  platinum: {
    icon: "💎",
    gradient: "from-cyan-400 to-blue-300",
    border: "border-cyan-400/30",
    bg: "bg-cyan-400/10",
  },
};

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-16 w-16 text-2xl",
};

export default function BadgeDisplay({
  level,
  title,
  skill,
  size = "md",
}: BadgeDisplayProps) {
  const config = levelConfig[level];

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border",
          config.border,
          config.bg,
          sizeClasses[size]
        )}
      >
        {config.icon}
      </div>
      {size !== "sm" && (
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {skill} • {level}
          </p>
        </div>
      )}
    </div>
  );
}
