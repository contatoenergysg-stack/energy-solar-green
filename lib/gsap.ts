"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

// cubic-bezier(0.23, 1, 0.32, 1) — strong ease-out, Emil standard
export const EASE = "power3.out";
export const EASE_STRONG = "power4.out";

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Fade-up reveal for a list of elements with optional stagger.
 * Respects prefers-reduced-motion: skips y movement, fast opacity only.
 */
export function revealFadeUp(
  targets: gsap.TweenTarget,
  opts: {
    trigger: Element;
    start?: string;
    delay?: number;
    stagger?: number;
    duration?: number;
    y?: number;
  },
) {
  const rm = reducedMotion();
  return gsap.fromTo(
    targets,
    { opacity: 0, y: rm ? 0 : (opts.y ?? 28) },
    {
      opacity: 1,
      y: 0,
      duration: rm ? 0.25 : (opts.duration ?? 0.75),
      ease: EASE,
      delay: opts.delay ?? 0,
      stagger: opts.stagger ?? 0,
      scrollTrigger: {
        trigger: opts.trigger,
        start: opts.start ?? "top 82%",
        once: true,
      },
    },
  );
}
