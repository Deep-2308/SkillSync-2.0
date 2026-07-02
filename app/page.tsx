"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import Balancer from "react-wrap-balancer";
import { motion } from "@/lib/motion";
import { SplitText } from "@/lib/motion/SplitText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TheProblemSection } from "@/components/landing/TheProblemSection";

const SceneEngine = dynamic(
  () => import("@/lib/scene/SceneEngine").then((mod) => mod.SceneEngine),
  { ssr: false }
);

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Reveal Hero Text Characters
      motion.reveal(".split-char", 0.02, 0.2);
      
      // 2. Reveal Subheadline
      motion.reveal(".hero-sub", 0, 0.8);

      // 3. Reveal CTA
      motion.reveal(".hero-cta", 0, 1.0);
    },
    { scope: container }
  );

  return (
    <div ref={container} className="relative min-h-screen selection:bg-[var(--color-ember)] selection:text-[var(--color-canvas)]">
      <SceneEngine />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="max-w-5xl space-y-8">
          <h1 className="text-display-md md:text-display-lg lg:text-display-xl font-display font-medium tracking-tight">
            <Balancer>
              <SplitText>Prove Your Skills. Find Your Builders.</SplitText>
            </Balancer>
          </h1>
          
          <p className="hero-sub mx-auto max-w-2xl text-body-large text-foreground/70" style={{ opacity: 0 }}>
            Stop self-reporting skills that nobody believes. Complete AI-generated challenges, 
            earn verified badges, and match with co-builders who trust your proof.
          </p>

          <div className="hero-cta flex items-center justify-center pt-4" style={{ opacity: 0 }}>
            <MagneticButton 
              className="material-ember-glow rounded-full px-8 py-4 text-button font-medium text-white transition-colors hover:bg-[var(--color-ember-dim)]"
            >
              Start Proving Skills →
            </MagneticButton>
          </div>
        </div>
      </main>
      
      <TheProblemSection />
    </div>
  );
}
