"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.05, wheelMultiplier: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
