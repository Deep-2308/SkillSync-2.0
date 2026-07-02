"use client";

import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reqIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion unconditionally.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    setLenis(lenisInstance);

    lenisInstance.on("scroll", ScrollTrigger.update);

    const ticker = gsap.ticker;
    const updateLenis = (time: number) => {
      lenisInstance.raf(time * 1000);
    };

    ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0); // GSAP dictates lag smoothing to prevent jank

    return () => {
      ticker.remove(updateLenis);
      lenisInstance.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
