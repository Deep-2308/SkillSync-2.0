"use client";

import { useEffect, useId, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  /** Switches the gradient + label colour between the pass / fail palettes. */
  variant?: "pass" | "fail";
  /** Seconds to wait before the sweep begins (lets it follow other reveals). */
  delay?: number;
  className?: string;
}

const GRADIENTS: Record<"pass" | "fail", [string, string, string]> = {
  // mint → cyan → teal (project primary / primary-dark family)
  pass: ["#5eead4", "#22d3ee", "#0891b2"],
  // amber family for the "keep practicing" state
  fail: ["#fcd34d", "#f59e0b", "#b45309"],
};

/**
 * Circular SVG score ring. The stroke sweeps from 0 → score and the centre
 * number counts up in lockstep on mount. Honours prefers-reduced-motion by
 * snapping straight to the final value.
 */
export function ScoreRing({
  score,
  max = 100,
  size = 200,
  strokeWidth = 14,
  variant = "pass",
  delay = 0,
  className,
}: ScoreRingProps) {
  const gradientId = useId();
  const reduceMotion = useReducedMotion();

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useMotionValue(0);
  const offset = useTransform(
    progress,
    (latest) => circumference - (latest / max) * circumference
  );

  const [display, setDisplay] = useState(0);
  const [from, via, to] = GRADIENTS[variant];

  useEffect(() => {
    if (reduceMotion) {
      progress.set(score);
      setDisplay(score);
      return;
    }
    const controls = animate(progress, score, {
      duration: 1.6,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [score, delay, reduceMotion, progress]);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible -rotate-90"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="55%" stopColor={via} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>

        {/* track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />

        {/* animated progress */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            filter: `drop-shadow(0 0 6px ${via}66)`,
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-heading font-bold leading-none tracking-tight text-text"
          style={{ fontSize: size * 0.3 }}
        >
          {display}
        </span>
        <span
          className="mt-1 text-xs font-medium uppercase tracking-widest"
          style={{ color: via }}
        >
          out of {max}
        </span>
      </div>
    </div>
  );
}
