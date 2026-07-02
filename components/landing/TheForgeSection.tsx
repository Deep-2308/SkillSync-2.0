"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sceneEventBus } from "@/lib/scene/SceneEvents";

export function TheForgeSection() {
  const containerRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {
    if (!containerRef.current) return;

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 60%",
      end: "bottom top",
      onEnter: () => sceneEventBus.emit({ state: "forge" }),
      onEnterBack: () => sceneEventBus.emit({ state: "forge" }),
      onLeaveBack: () => sceneEventBus.emit({ state: "problem" }),
    });

    // Stagger reveal the evidence panels
    panelsRef.current.forEach((panel, index) => {
      gsap.fromTo(
        panel,
        { opacity: 0, x: index % 2 === 0 ? -50 : 50, filter: "blur(10px)" },
        {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
          }
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full py-32 md:py-48 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-24 md:text-center">
          <h2 className="text-display-md font-display font-medium text-[var(--color-paper)]">
            The Digital Forge
          </h2>
          <p className="mt-4 text-body-large text-foreground/70 md:mx-auto max-w-2xl">
            Where skills are tested, proven, and forged. We don't ask what you know; we ask what you can build. 
            Pass the AI-driven technical evaluations to earn your proof.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Panel 1 */}
          <div 
            ref={(el) => { if (el) panelsRef.current[0] = el; }}
            className="group relative flex flex-col justify-end overflow-hidden rounded-3xl material-steel border border-[var(--color-surface-border)] p-8 min-h-[400px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-40" />
            
            <div className="relative z-20">
              <h3 className="text-page-heading font-medium text-white mb-2">Real-World Sandboxes</h3>
              <p className="text-body-base text-white/70">
                Execute actual code against integration tests. No multiple choice. No whiteboarding tricks. Pure engineering.
              </p>
            </div>
          </div>

          {/* Panel 2 */}
          <div 
            ref={(el) => { if (el) panelsRef.current[1] = el; }}
            className="group relative flex flex-col justify-end overflow-hidden rounded-3xl material-glass border border-[var(--color-surface-border)] p-8 min-h-[400px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <div className="relative z-20">
              <h3 className="text-page-heading font-medium text-white mb-2">Cryptographic Proof</h3>
              <p className="text-body-base text-white/70">
                Every passed challenge generates an immutable badge. Share your public profile to skip technical screens instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
