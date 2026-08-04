"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Animated floating frame for a single hero icon. Deliberately takes
 * pre-rendered `children` (a <SomeIcon /> element created server-side)
 * rather than a slug + resolver — resolving icons client-side would pull
 * the entire tool-icons registry (36 react-icons components) into this
 * component's client bundle on every route that renders it, even though
 * only one icon is ever shown at a time. Server-resolving and passing the
 * element keeps each route paying only for the icon it actually uses.
 *
 * Shared by every tool-page hero, every category-page hero, the blog
 * index/post heroes, and the contact/about heroes — so the default
 * className below (bumped from a flat bg-white/10 blur to the
 * glass-panel utility, see globals.css) is the "glassy chip" look across
 * the entire site, not just the homepage. Callers that pass their own
 * `className` (blog post hero, contact hero — smaller/differently
 * positioned chips) keep whatever surface treatment they specify; only
 * the default path picks up glass-panel, so this stays additive rather
 * than silently changing an already-tuned override elsewhere.
 */
export function HeroIconFloat({ children, className }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block"
    >
      <motion.div
        className={
          className ||
          "glass-panel absolute top-1/2 right-[8%] flex size-28 -translate-y-1/2 items-center justify-center rounded-3xl text-white sm:size-36 lg:right-[12%] lg:size-44"
        }
        // Reduced motion: render at the resting pose, no perpetual
        // float/rotate loop (see the equivalent fix in
        // hero-floating-icons.jsx and background-paths.jsx).
        animate={shouldReduceMotion ? { y: 0, rotate: 0 } : { y: [0, -16, 0], rotate: [0, 6, 0] }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
