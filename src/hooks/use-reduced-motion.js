"use client";

import { useReducedMotion as useMotionReducedMotion } from "motion/react";

/**
 * Thin re-export of Motion's own useReducedMotion, centralized so every
 * component that gates an infinite/ambient animation imports from one
 * place (@/hooks/use-reduced-motion) rather than each file remembering to
 * reach into "motion/react" directly.
 *
 * Why this exists at all: the site's global CSS already has a
 * `@media (prefers-reduced-motion: reduce)` rule (see globals.css), but
 * that rule only zeroes out CSS `animation`/`transition` durations. Motion
 * drives its own `animate` prop via the Web Animations API / rAF, which
 * that CSS rule does not touch — so any component using Motion's
 * `animate={{ ... repeat: Infinity ... }}` needs to check this value
 * itself and either skip the animated variant or render a static end
 * state. This was previously missing from every ambient-motion component
 * in the codebase (FloatingPaths, SectionFlowLines) — components created
 * from now on should import this and branch instead of unconditionally
 * animating.
 *
 * Usage:
 *   const shouldReduceMotion = useReducedMotion();
 *   <motion.path animate={shouldReduceMotion ? { opacity: 0.3 } : { opacity: [0.3, 0.6, 0.3], ... }} />
 */
export function useReducedMotion() {
  return useMotionReducedMotion();
}
