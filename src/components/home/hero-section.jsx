"use client";

import { motion } from "motion/react";
import { HiOutlineCheckCircle } from "react-icons/hi2";

import { ToolSearchBar } from "@/components/home/tool-search-bar";
import { HeroFloatingIcons } from "@/components/home/hero-floating-icons";
import { FloatingPaths } from "@/components/ui/background-paths";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// One shared stagger container + child variant set, reused for badge →
// heading → subtext → search. Motivated by hierarchy (Section 5 of the
// design-taste skill: "what does this animation communicate?") — it
// establishes reading order on first paint. Runs once on mount, never
// re-triggers on scroll, so it never competes with the page for
// attention after the first second.
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
  },
};

// Reduced-motion variant: same final state, no offset to animate from,
// so content simply appears rather than sliding in.
const staticVariants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const container = shouldReduceMotion ? staticVariants : containerVariants;
  const item = shouldReduceMotion ? staticVariants : itemVariants;

  return (
    <section className="relative isolate overflow-hidden metallic-emerald-soft metallic-breathe">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <FloatingPaths position={1} colorRgb="255, 255, 255" />
        <FloatingPaths position={-1} colorRgb="255, 255, 255" />
      </div>
      <HeroFloatingIcons />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 lg:py-28"
      >
        <div className="text-center lg:text-left">
          <motion.span
            variants={item}
            className="glass-panel inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
          >
            <HiOutlineCheckCircle className="size-3.5" />
            70 tools, entirely free
          </motion.span>
          <motion.h1
            variants={item}
            className="font-display mx-auto mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl lg:mx-0"
          >
            Every file tool you need, in one place
          </motion.h1>
          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-xl text-lg text-balance text-white/85 lg:mx-0"
          >
            Merge, convert, compress, and edit PDFs, images, documents, audio, and video. Free,
            private, and processed entirely in your browser.
          </motion.p>
          <motion.div variants={item} className="mt-8 flex justify-center lg:justify-start">
            <ToolSearchBar />
          </motion.div>
        </div>

        {/* Spacer column on large screens — the floating icons render as
            an absolutely-positioned overlay across the whole section, so
            this reserves the visual right-hand space for them without
            needing its own content. */}
        <div className="hidden lg:block" aria-hidden="true" />
      </motion.div>
    </section>
  );
}
