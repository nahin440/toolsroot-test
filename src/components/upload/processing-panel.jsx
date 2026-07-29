"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "motion/react";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

/** Animates a number counting toward its target rather than jumping, so
 * progress reads as continuous motion instead of a series of jumps —
 * purposeful because the number itself IS the information, not
 * decoration on top of it. */
function AnimatedPercent({ value }) {
  const spring = useSpring(value, { stiffness: 120, damping: 20, mass: 0.5 });
  const rounded = useTransform(spring, (v) => `${Math.round(v)}%`);
  const [display, setDisplay] = useState(`${Math.round(value)}%`);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = rounded.on("change", setDisplay);
    return unsub;
  }, [rounded]);

  return <span className="tabular-nums">{display}</span>;
}

export function ProcessingPanel({ stage, overallProgress }) {
  const percent = Math.round((overallProgress || 0) * 100);
  const hasProgress = Boolean(overallProgress);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <motion.div
          animate={hasProgress ? { scale: [1, 1.06, 1] } : { rotate: 360 }}
          transition={
            hasProgress
              ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 2, repeat: Infinity, ease: "linear" }
          }
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent"
        >
          <HiOutlineCog6Tooth className="size-5" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={stage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="truncate text-sm font-medium text-foreground"
              >
                {stage || "Processing…"}
              </motion.p>
            </AnimatePresence>
            {hasProgress && (
              <span className="shrink-0 text-sm font-semibold text-accent">
                <AnimatedPercent value={percent} />
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">This happens entirely on your device — nothing is uploaded.</p>
        </div>
      </div>
      <Progress value={percent} indeterminate={!hasProgress} className="mt-4" />
    </Card>
  );
}
