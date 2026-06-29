"use client";

import { Children } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds between each child's entrance. */
  stagger?: number;
  /** Seconds to wait before the first child animates. */
  delayChildren?: number;
}

/**
 * Staggers the entrance of its direct children. Each child is auto-wrapped in a
 * motion item (fade-up), so you can drop in any markup. Reveals once on scroll
 * into view; respects prefers-reduced-motion.
 */
export function StaggerContainer({
  children,
  className,
  stagger = 0.1,
  delayChildren = 0,
}: StaggerContainerProps) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: reduce ? 0 : delayChildren,
      },
    },
  };

  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 240, damping: 26 },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
}

export default StaggerContainer;
