"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// whileInView (not a manual IntersectionObserver) so this respects
// Motion's own viewport margin/once semantics without reinventing them.
// `once: true` is the key setting: this reveals a section as it scrolls
// into view a single time, then stays settled — it never re-triggers on
// scroll-up/scroll-down, so it can't become the kind of repeated motion
// the skill's frequency gate warns about.
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } },
};

const staticVariants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

export function TrustPoints({ points }) {
  const shouldReduceMotion = useReducedMotion();
  const container = shouldReduceMotion ? staticVariants : containerVariants;
  const item = shouldReduceMotion ? staticVariants : itemVariants;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="relative grid grid-cols-1 gap-8 sm:grid-cols-3"
    >
      {points.map((point) => (
        <motion.div key={point.title} variants={item} className="flex flex-col items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl metallic-emerald text-white shadow-accent-glow">
            {/* point.icon is a pre-rendered element (<HiLockClosed className="size-5" />),
                not a component reference — React can't serialize a bare
                function reference across the Server->Client boundary, so
                the parent Server Component renders the icon element itself
                and passes the result, same pattern as HeroIconFloat. */}
            {point.icon}
          </div>
          <h3 className="font-semibold text-foreground">{point.title}</h3>
          <p className="text-sm text-muted-foreground">{point.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
