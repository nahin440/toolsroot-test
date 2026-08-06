"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiCloudArrowUp, HiDocumentArrowUp } from "react-icons/hi2";

import { cn } from "@/lib/utils";
import { validateFiles, formatBytes } from "@/lib/validation/validate-file";

/**
 * Universal drag-and-drop upload zone used by every tool page. Implements
 * idle / drag-over / validating states directly; uploading / queued /
 * processing / completed / error are rendered by the caller via the
 * shared file-processing store, so every tool page shares one visual
 * language for these states rather than each tool reinventing its own
 * upload UI.
 */
export function Dropzone({
  accepts = ["*"],
  multiple = true,
  maxSizeBytes,
  onFilesAccepted,
  onValidationErrors,
  disabled = false,
  className,
  compact = false,
  label,
  helperText,
}) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const describedById = useId();

  const acceptAttr = accepts.includes("*") ? undefined : accepts.join(",");

  const processFileList = useCallback(
    (fileList) => {
      setIsValidating(true);
      const files = Array.from(fileList);
      requestAnimationFrame(() => {
        const { valid, errors } = validateFiles(files, accepts, { maxSizeBytes });
        setIsValidating(false);

        if (errors.length) {
          onValidationErrors?.(errors);
          setLiveMessage(
            errors.length === 1
              ? errors[0].error
              : `${errors.length} files couldn't be added. ${errors[0].error}`
          );
        }
        if (valid.length) {
          onFilesAccepted?.(multiple ? valid : [valid[0]]);
          setLiveMessage(
            `${valid.length} file${valid.length > 1 ? "s" : ""} added${errors.length ? `, ${errors.length} skipped` : ""}.`
          );
        }
      });
    },
    [accepts, maxSizeBytes, multiple, onFilesAccepted, onValidationErrors]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      if (e.dataTransfer?.files?.length) processFileList(e.dataTransfer.files);
    },
    [disabled, processFileList]
  );

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      if (e.target.files?.length) processFileList(e.target.files);
      e.target.value = "";
    },
    [processFileList]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled]
  );

  const acceptLabel = useMemo(
    () =>
      accepts.includes("*")
        ? "any file type"
        : accepts
            .map((a) => a.replace("application/", "").replace("image/*", "images").replace(".", "").toUpperCase())
            .join(", "),
    [accepts]
  );

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={describedById}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{ scale: isDragOver ? 1.015 : 1 }}
        transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
        className={cn(
          "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 text-center transition-colors outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          !disabled && "hover:border-accent/50 hover:bg-accent-tint/40",
          isDragOver && "border-accent bg-accent-tint shadow-[0_0_0_4px_rgba(5,150,105,0.08)]",
          disabled && "cursor-not-allowed opacity-50",
          compact ? "min-h-[140px] p-6" : "min-h-[280px] p-10"
        )}
      >
        {/* Faint sheen so the zone itself reads as a coated surface
            rather than a plain dashed box — same --glossy-card-sheen
            gradient used on cards, at rest opacity; the dashed border
            and secondary background (both functional affordances
            signaling "drop target") are unchanged. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: "var(--glossy-card-sheen)" }}
        />
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={acceptAttr}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          aria-label={label || "Choose files to upload"}
        />

        <AnimatePresence mode="wait">
          {isValidating ? (
            <motion.div
              key="validating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="size-12 rounded-full skeleton-shimmer" />
              <p className="text-sm text-muted-foreground">Checking your files…</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div
                className={cn(
                  "metallic-emerald relative flex items-center justify-center rounded-full text-white shadow-[0_2px_10px_-2px_rgba(5,150,105,0.5)] transition-transform",
                  compact ? "size-11" : "size-16",
                  isDragOver && "scale-110"
                )}
              >
                {isDragOver ? (
                  <HiDocumentArrowUp className={compact ? "size-5" : "size-7"} />
                ) : (
                  <HiCloudArrowUp className={compact ? "size-5" : "size-7"} />
                )}
              </div>
              <div className="space-y-1">
                <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base")}>
                  {label || (isDragOver ? "Drop your files here" : "Drag & drop files here, or click to browse")}
                </p>
                <p id={describedById} className="text-xs text-muted-foreground">
                  {helperText || `Supports ${acceptLabel}${maxSizeBytes ? ` · Up to ${formatBytes(maxSizeBytes)}` : ""}`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>
    </div>
  );
}

/** A small inline "add more files" variant for use inside a queue list. */
export function AddMoreFilesButton({ accepts, multiple, maxSizeBytes, onFilesAccepted, onValidationErrors }) {
  const inputRef = useRef(null);
  const acceptAttr = accepts?.includes("*") ? undefined : accepts?.join(",");

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={acceptAttr}
        multiple={multiple}
        onChange={(e) => {
          if (!e.target.files?.length) return;
          const { valid, errors } = validateFiles(Array.from(e.target.files), accepts, { maxSizeBytes });
          if (errors.length) onValidationErrors?.(errors);
          if (valid.length) onFilesAccepted?.(valid);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HiCloudArrowUp className="size-4" />
        Add more files
      </button>
    </>
  );
}
