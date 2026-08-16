"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "motion/react";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

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

export function ProcessingPanel({
  stage,
  overallProgress,
  isLoadingEngine = false,
  engineLoadProgress = null,
  engineLabel = null,
}) {
  // While the engine is loading, the label and percentage come from a
  // completely separate pair of values (engineLoadProgress, engineLabel)
  // rather than stage/overallProgress — those two continue to mean
  // exactly what they meant before this prop existed (the adapter's own
  // processing stage/percentage), so a tool that never sets
  // isLoadingEngine (47 of the 115+ tools; see MEDIA_ENGINE_TOOL_SLUGS in
  // tool-page-shell.jsx) renders identically to before this change.
  const displayStage = isLoadingEngine ? engineLabel || "Loading engine…" : stage;
  const displayProgress = isLoadingEngine ? engineLoadProgress : overallProgress;
  const percent = Math.round((displayProgress || 0) * 100);
  const hasProgress = Boolean(displayProgress);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <motion.div
          // Reduced motion: hold the gear at rest instead of spinning or
          // pulsing forever. The gear icon itself still renders (it's a
          // real status indicator, "processing is active", not
          // decoration), it just stops moving — same rationale as every
          // other ambient-loop fix in this codebase (see
          // background-paths.jsx, hero-floating-icons.jsx).
          animate={
            shouldReduceMotion ? { scale: 1, rotate: 0 } : hasProgress ? { scale: [1, 1.06, 1] } : { rotate: 360 }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : hasProgress
                ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                : { duration: 2, repeat: Infinity, ease: "linear" }
          }
          className="flex size-10 shrink-0 items-center justify-center rounded-full metallic-emerald text-white"
        >
          <HiOutlineCog6Tooth className="size-5" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={displayStage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="truncate text-sm font-medium text-foreground"
              >
                {displayStage || "Processing…"}
              </motion.p>
            </AnimatePresence>
            {hasProgress && (
              <span className="shrink-0 text-sm font-semibold text-accent">
                <AnimatedPercent value={percent} />
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoadingEngine
              ? "One-time download for this tool. Your file stays on your device."
              : "This happens entirely on your device. Nothing is uploaded."}
          </p>
        </div>
      </div>
      <Progress value={percent} indeterminate={!hasProgress} className="mt-4" />
    </Card>
  );
}
