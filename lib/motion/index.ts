import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const motion = {
  reveal(targets: string | Element | NodeList | Element[], stagger = 0.05, delay = 0) {
    return gsap.fromTo(
      targets,
      { opacity: 0, y: 20, filter: "blur(10px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power3.out",
        stagger,
        delay,
      }
    );
  },
  
  magnetic(element: HTMLElement, xTo: gsap.QuickToFunc, yTo: gsap.QuickToFunc, e: MouseEvent) {
    const { left, top, width, height } = element.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);
    
    // Dampen the movement
    xTo(x * 0.2);
    yTo(y * 0.2);
  },

  resetMagnetic(xTo: gsap.QuickToFunc, yTo: gsap.QuickToFunc) {
    xTo(0);
    yTo(0);
  }
};
