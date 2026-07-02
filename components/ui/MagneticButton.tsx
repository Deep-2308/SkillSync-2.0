"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { motion } from "@/lib/motion";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, className, ...props }, ref) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const resolvedRef = (ref as React.MutableRefObject<HTMLButtonElement>) || internalRef;
    
    // Use refs to store quickTo functions
    const xTo = useRef<gsap.QuickToFunc>(null);
    const yTo = useRef<gsap.QuickToFunc>(null);

    useEffect(() => {
      if (!resolvedRef.current) return;
      
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      xTo.current = gsap.quickTo(resolvedRef.current, "x", { duration: 0.4, ease: "power3" });
      yTo.current = gsap.quickTo(resolvedRef.current, "y", { duration: 0.4, ease: "power3" });
    }, [resolvedRef]);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!resolvedRef.current || !xTo.current || !yTo.current) return;
      motion.magnetic(resolvedRef.current, xTo.current, yTo.current, e.nativeEvent);
    };

    const handleMouseLeave = () => {
      if (!xTo.current || !yTo.current) return;
      motion.resetMagnetic(xTo.current, yTo.current);
    };

    return (
      <button
        ref={resolvedRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);
MagneticButton.displayName = "MagneticButton";
