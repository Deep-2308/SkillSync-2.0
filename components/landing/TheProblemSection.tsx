"use client";

import React, { useRef } from "react";
import NumberFlow from "@number-flow/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sceneEventBus } from "@/lib/scene/SceneEvents";
import { motion } from "@/lib/motion";

const STATS = [
  { value: 85, label: "of tech resumes contain false or exaggerated skills", suffix: "%" },
  { value: 6, label: "seconds average time spent scanning a resume", suffix: "s" },
  { value: 200, label: "average applicants per junior developer role", suffix: "+" },
];

export function TheProblemSection() {
  const containerRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  
  // State for NumberFlow to trigger when in view
  const [inView, setInView] = React.useState(false);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    // The Master Timeline for this section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=150%", // Pin for 1.5x screen height
        pin: true,
        scrub: 1,
        onEnter: () => {
          sceneEventBus.emit({ state: "problem" });
          setInView(true);
        },
        onEnterBack: () => {
          sceneEventBus.emit({ state: "problem" });
          setInView(true);
        },
        onLeave: () => {
          setInView(false);
        },
        onLeaveBack: () => {
          sceneEventBus.emit({ state: "hero" });
          setInView(false);
        }
      }
    });

    // Reveal cards sequentially driven by scroll
    cardsRef.current.forEach((card, index) => {
      tl.fromTo(card,
        { opacity: 0, y: 50, filter: "blur(10px)", scale: 0.95 },
        { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, duration: 1, ease: "power2.out" },
        index * 0.5
      );
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden pt-20">
      
      {/* Narrative Intro */}
      <div className="absolute top-1/4 max-w-2xl px-6 text-center">
        <h2 className="text-section-heading font-sans font-medium tracking-tight text-[var(--color-ember)] mb-4">
          The Cost of Trusting Resumes
        </h2>
        <p className="text-body-large text-foreground/80">
          We built an ecosystem on self-reported claims, buzzword optimization, and algorithmic filters. The result is a broken hiring loop that penalizes actual builders.
        </p>
      </div>

      {/* High-Density Stat Cards */}
      <div className="absolute top-1/2 flex w-full max-w-5xl -translate-y-1/4 flex-col gap-6 px-6 md:flex-row md:justify-center">
        {STATS.map((stat, i) => (
          <div 
            key={i}
            ref={(el) => {
              if (el && !cardsRef.current.includes(el)) {
                cardsRef.current[i] = el;
              }
            }}
            className="material-obsidian flex flex-1 flex-col items-center justify-center rounded-2xl p-8 text-center"
            style={{ opacity: 0 }}
          >
            <div className="text-display-md font-display text-[var(--color-paper)]">
              <NumberFlow 
                value={inView ? stat.value : 0} 
                format={{ notation: "compact" }}
              />
              <span className="text-page-heading text-[var(--color-ember-dim)]">{stat.suffix}</span>
            </div>
            <p className="mt-4 text-body-small text-foreground/60 max-w-[200px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      
    </section>
  );
}
