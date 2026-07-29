"use client";

import { motion } from "motion/react";
import { HiExclamationTriangle } from "react-icons/hi2";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ErrorPanel({ message, onRetry }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="flex items-start gap-4 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <HiExclamationTriangle className="size-5" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="font-semibold text-foreground">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
