"use client";

import { createElement } from "react";
import { motion } from "motion/react";
import {
  HiDocumentCheck,
  HiExclamationCircle,
  HiOutlineDocument,
  HiOutlinePhoto,
  HiOutlineMusicalNote,
  HiOutlineFilm,
  HiOutlineArchiveBox,
} from "react-icons/hi2";
import { HiX, HiDownload } from "react-icons/hi";

import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/validation/validate-file";
import { Progress } from "@/components/ui/progress";

function iconForType(type, name) {
  if (type.startsWith("image/")) return HiOutlinePhoto;
  if (type.startsWith("audio/")) return HiOutlineMusicalNote;
  if (type.startsWith("video/")) return HiOutlineFilm;
  if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) return HiOutlineArchiveBox;
  return HiOutlineDocument;
}

/**
 * @param {object} props
 * @param {object} props.entry - a file entry from useFileProcessingStore
 * @param {boolean} [props.isProcessing]
 * @param {() => void} [props.onRemove]
 * @param {() => void} [props.onDownload]
 */
export function FileQueueItem({ entry, index = 0, isProcessing, onRemove, onDownload }) {
  const hasError = Boolean(entry.error);
  const isDone = Boolean(entry.resultBlob) && !hasError;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.24), ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-3",
        hasError && "border-foreground/20 bg-secondary/60"
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          hasError ? "bg-secondary text-muted-foreground" : isDone ? "bg-accent-tint text-accent" : "bg-secondary text-muted-foreground"
        )}
      >
        {hasError ? (
          <HiExclamationCircle className="size-5" />
        ) : isDone ? (
          <HiDocumentCheck className="size-5" />
        ) : (
          createElement(iconForType(entry.type || "", entry.name), { className: "size-5" })
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{entry.name}</p>
        {hasError ? (
          <p className="truncate text-xs text-foreground/70">{entry.error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {formatBytes(entry.size)}
            {isProcessing && !isDone ? ` · ${entry.progress}%` : ""}
            {isDone ? " · Ready" : ""}
          </p>
        )}
        {isProcessing && !isDone && !hasError && (
          <Progress value={entry.progress} className="mt-2 h-1" />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {isDone && onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="flex size-9 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Download ${entry.resultName || entry.name}`}
          >
            <HiDownload className="size-4" />
          </button>
        )}
        {onRemove && !isProcessing && (
          <button
            type="button"
            onClick={onRemove}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Remove ${entry.name}`}
          >
            <HiX className="size-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
