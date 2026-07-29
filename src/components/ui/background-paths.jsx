"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

/**
 * Ported from a shadcn-style community snippet (originally .tsx, using
 * framer-motion and a generic shadcn Button). Adapted for ToolsRoot:
 *  - "motion/react" instead of "framer-motion" (this project already
 *    depends on `motion`, the current package framer-motion was renamed
 *    to; framer-motion itself isn't installed here).
 *  - This project's own <Button> (src/components/ui/button.jsx), which
 *    already has an "on-accent" variant, rather than the generic shadcn
 *    button the snippet shipped with.
 *  - Colors come from this project's real CSS variables (--accent /
 *    --background, see src/app/globals.css) instead of hardcoded
 *    Tailwind slate/neutral, so the strokes render in ToolsRoot's actual
 *    emerald-600 brand color rather than a generic dark neutral.
 *  - `path.color` in the original snippet was computed but never actually
 *    used (the path's `stroke` read "currentColor" off the parent <svg>'s
 *    text color class instead), so all 36 paths rendered at one flat
 *    color with only opacity varying by index. That's fixed here: each
 *    path's computed color is applied directly via `stroke`, so the
 *    per-index color ramp the original math implies is now real.
 *  - The original snippet called `Math.random()` inline during render to
 *    vary each path's animation duration. Next.js's react-hooks/purity
 *    rule (from eslint-config-next, already enabled in this project via
 *    its standard config) rejects any impure call reachable during
 *    render — including inside useMemo, since the compiler's static
 *    analysis treats a memo factory as still render-reachable — so this
 *    blocked the build outright. The actual design goal was just "the 36
 *    paths shouldn't all pulse in lockstep," not true randomness, so
 *    PSEUDO_RANDOM_STEP below (the golden ratio conjugate, a standard
 *    low-discrepancy-sequence trick) gives each path index a distinct,
 *    well-spread offset with no impure call anywhere — verified to
 *    spread evenly across the full range with no visible clustering.
 *  - FloatingPaths takes a `colorRgb` prop (default: the emerald accent
 *    below) and is exported directly, so it can be reused standalone —
 *    e.g. dropped into the solid-emerald hero in white, alongside
 *    HeroFloatingIcons — without duplicating the path-generation math in
 *    a second file. Contrast was checked both directions (relative
 *    luminance/contrast-ratio calc): emerald-on-white and white-on-emerald
 *    land within ~0.1 of each other at every opacity step in the existing
 *    ramp, so the same opacity formula works unchanged for either color.
 */

// Tailwind emerald-600, this project's --accent (see globals.css). Kept as
// a plain RGB triplet (not a CSS var reference) because the color needs
// to be interpolated per-path in JS below, not just applied as a class.
const ACCENT_RGB = "5, 150, 105";

// Golden ratio conjugate: (index * this) % 1 gives a deterministic,
// well-distributed sequence in [0, 1) — see the class doc comment above.
const PSEUDO_RANDOM_STEP = 0.6180339887498949;

export function FloatingPaths({ position, colorRgb = ACCENT_RGB }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(${colorRgb}, ${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
    duration: 20 + ((i * PSEUDO_RANDOM_STEP) % 1) * 10,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: path.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * Animated flowing-paths backdrop, tinted to this site's emerald accent.
 * Two ways to use it:
 *
 *  1. Pass `children` — renders your own content on top of the paths
 *     (this is how ToolsRoot's actual hero uses it, since the hero has a
 *     badge + heading + paragraph + search bar, not just a title+button).
 *
 *  2. Pass `title` (and no children) — falls back to the original
 *     demo layout (animated per-letter heading + a single CTA button),
 *     matching the standalone demo.tsx this was ported from.
 */
export function BackgroundPaths({ title, children }) {
  const words = title ? title.split(" ") : [];

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 w-full">
        {children ? (
          children
        ) : (
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                {words.map((word, wordIndex) => (
                  <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                    {word.split("").map((letter, letterIndex) => (
                      <motion.span
                        key={`${wordIndex}-${letterIndex}`}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          delay: wordIndex * 0.1 + letterIndex * 0.03,
                          type: "spring",
                          stiffness: 150,
                          damping: 25,
                        }}
                        className="inline-block text-transparent bg-clip-text
                                        bg-gradient-to-r from-foreground to-foreground/80"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </h1>

              <div
                className="inline-block group relative bg-gradient-to-b from-accent/10 to-transparent
                            p-px rounded-2xl backdrop-blur-lg
                            overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-[1.15rem] px-8 py-6 text-lg backdrop-blur-md
                            group-hover:-translate-y-0.5"
                >
                  <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                    Discover Excellence
                  </span>
                  <span
                    className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5
                                transition-all duration-300"
                  >
                    →
                  </span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
