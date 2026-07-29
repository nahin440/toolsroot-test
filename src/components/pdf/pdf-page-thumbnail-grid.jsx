"use client";

import { useEffect, useRef, useState } from "react";
import { HiCheck } from "react-icons/hi2";

import { openPdfDocument } from "@/lib/engines/pdf/pdfjs-loader";
import { cn } from "@/lib/utils";

/**
 * @param {object} props
 * @param {File} props.file
 * @param {Set<number>} props.selected - 1-indexed page numbers currently selected
 * @param {(pageNum: number) => void} props.onToggle
 * @param {string} [props.selectionStyle] - "highlight" (selected = kept) or "remove" (selected = will be removed)
 */
export function PdfPageThumbnailGrid({ file, selected, onToggle, selectionStyle = "highlight" }) {
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    (async () => {
      // Deferring the reset to the async task body (rather than calling
      // setState synchronously in the effect body itself) avoids the
      // cascading-render pattern the set-state-in-effect rule flags,
      // while still resetting the grid the moment a new file comes in.
      setLoading(true);
      setThumbnails([]);

      const doc = await openPdfDocument(file);
      const results = [];
      for (let i = 1; i <= doc.numPages; i++) {
        if (cancelledRef.current) return;
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        results.push({ pageNum: i, dataUrl: canvas.toDataURL("image/png") });
        setThumbnails([...results]);
      }
      if (!cancelledRef.current) setLoading(false);
    })();

    return () => {
      cancelledRef.current = true;
    };
  }, [file]);

  return (
    <div>
      {loading && thumbnails.length === 0 && (
        <div className="flex min-h-[160px] items-center justify-center">
          <div className="size-8 animate-pulse rounded-full skeleton-shimmer" />
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {thumbnails.map(({ pageNum, dataUrl }) => {
          const isSelected = selected.has(pageNum);
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onToggle(pageNum)}
              className={cn(
                "group relative overflow-hidden rounded-lg border-2 transition-all",
                isSelected
                  ? selectionStyle === "remove"
                    ? "border-primary"
                    : "border-accent"
                  : "border-border hover:border-accent/40"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic data-URL thumbnail, not a static asset next/image is designed for */}
              <img src={dataUrl} alt={`Page ${pageNum}`} className="w-full" />
              <div
                className={cn(
                  "absolute inset-0 transition-opacity",
                  isSelected
                    ? selectionStyle === "remove"
                      ? "bg-primary/30 opacity-100"
                      : "bg-accent/15 opacity-100"
                    : "opacity-0"
                )}
              />
              {isSelected && (
                <span
                  className={cn(
                    "absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full text-white",
                    selectionStyle === "remove" ? "bg-primary" : "bg-accent"
                  )}
                >
                  <HiCheck className="size-3.5" />
                </span>
              )}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {pageNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
