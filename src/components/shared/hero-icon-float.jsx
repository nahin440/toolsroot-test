"use client";

import { motion } from "motion/react";

/**
 * Animated floating frame for a single hero icon. Deliberately takes
 * pre-rendered `children` (a <SomeIcon /> element created server-side)
 * rather than a slug + resolver — resolving icons client-side would pull
 * the entire tool-icons registry (36 react-icons components) into this
 * component's client bundle on every route that renders it, even though
 * only one icon is ever shown at a time. Server-resolving and passing the
 * element keeps each route paying only for the icon it actually uses.
 */
export function HeroIconFloat({ children, className }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block"
    >
      <motion.div
        className={
          className ||
          "absolute top-1/2 right-[8%] flex size-28 -translate-y-1/2 items-center justify-center rounded-3xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm sm:size-36 lg:right-[12%] lg:size-44"
        }
        animate={{ y: [0, -16, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
