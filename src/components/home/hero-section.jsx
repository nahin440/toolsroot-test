"use client";

import { motion } from "motion/react";
import { HiOutlineCheckCircle } from "react-icons/hi2";

import { ToolSearchBar } from "@/components/home/tool-search-bar";
import { HeroFloatingIcons } from "@/components/home/hero-floating-icons";
import { FloatingPaths } from "@/components/ui/background-paths";
import { OrganicBlobs } from "@/components/illustrations/organic-blobs";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

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

const staticVariants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const container = shouldReduceMotion ? staticVariants : containerVariants;
  const item = shouldReduceMotion ? staticVariants : itemVariants;

  return (
    <section className="relative isolate z-20 metallic-emerald-loud metallic-breathe">
      {/* Decorative background layer only — overflow-hidden lives here
          instead of on the section itself, so it clips the blobs/paths/
          floating icons but no longer clips the search dropdown below,
          which needs to be able to render past the hero's own bottom
          edge without getting cut off or visually detached from its
          input (see ToolSearchBar). */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <OrganicBlobs tone="on-accent" />
        <FloatingPaths
          position={1}
          colorRgb="255, 255, 255"
          reverseX
          metallic
        />
        <FloatingPaths
          position={-1}
          colorRgb="255, 255, 255"
          reverseX
          metallic
        />
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
            Merge, convert, compress, and edit PDFs, images, documents, audio,
            and video. Free, private, and processed entirely in your browser.
          </motion.p>
          <motion.div
            variants={item}
            className="mt-8 flex justify-center lg:justify-start"
          >
            <ToolSearchBar />
          </motion.div>
        </div>

        <div className="hidden lg:block" aria-hidden="true" />
      </motion.div>
    </section>
  );
}