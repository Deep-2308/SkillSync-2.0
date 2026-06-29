"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Templates re-mount on every navigation (unlike layouts), so this gives each
 * authenticated page a subtle fade-in transition. Kept short and easing-only
 * so it never feels distracting; disabled under prefers-reduced-motion.
 */
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
