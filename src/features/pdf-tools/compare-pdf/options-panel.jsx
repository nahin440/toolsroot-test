"use client";

import { useEffect, useState } from "react";
import { HiOutlineDocumentText, HiOutlineExclamationTriangle } from "react-icons/hi2";

import { comparePdfs } from "@/lib/engines/pdf/compare-pdf";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function DiffLine({ entry }) {
  return (
    <div
      className={cn(
        "rounded-md px-2 py-1 font-mono text-xs leading-relaxed break-words",
        entry.type === "added" && "bg-accent-tint text-accent-active",
        entry.type === "removed" && "bg-primary/10 text-primary line-through decoration-primary/40",
        entry.type === "same" && "text-muted-foreground"
      )}
    >
      <span className="mr-2 select-none opacity-60">
        {entry.type === "added" ? "+" : entry.type === "removed" ? "−" : " "}
      </span>
      {entry.text}
    </div>
  );
}

export function ComparePdfOptionsPanel({ files, options, setOptions }) {
  const [state, setState] = useState({ files: null, result: null, error: null });

  useEffect(() => {
    if (files.length < 2) return;

    // Race guard: only apply this effect's outcome if `files` hasn't
    // already changed again by the time the async comparison resolves
    // (e.g. swapping the second file before the first comparison
    // finishes). Bundling files/result/error into one state object
    // (rather than three separate useState calls cleared independently)
    // is what keeps a stale result from a previous `files` value from
    // ever rendering alongside the new loading state.
    let cancelled = false;

    comparePdfs(files[0], files[1])
      .then((result) => {
        if (cancelled) return;
        setState({ files, result, error: null });
      })
      .catch((e) => {
        if (cancelled) return;
        setState({ files, result: null, error: e?.message || "Couldn't compare these files." });
      });

    return () => {
      cancelled = true;
    };
  }, [files]);

  const isCurrent = state.files === files;
  const result = isCurrent ? state.result : null;
  const error = isCurrent ? state.error : null;

  if (files.length < 2) {
    return (
      <Card className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
        <HiOutlineExclamationTriangle className="size-5 shrink-0 text-primary" />
        Add a second PDF above to compare against the first one.
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex items-center gap-3 p-5 text-sm text-primary">
        <HiOutlineExclamationTriangle className="size-5 shrink-0" />
        {error}
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="space-y-3 p-5">
        <div className="h-4 w-1/3 animate-pulse rounded skeleton-shimmer" />
        <div className="h-24 animate-pulse rounded-lg skeleton-shimmer" />
      </Card>
    );
  }

  const changedPages = result.pages.filter((p) => p.changeCount > 0);

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <HiOutlineDocumentText className="size-4 text-muted-foreground" />
          <span className="truncate font-medium">{files[0].name}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="truncate font-medium">{files[1].name}</span>
        </div>
        <Badge variant={result.totalChanges > 0 ? "accent" : "outline"}>
          {result.totalChanges > 0
            ? `${result.totalChanges} line change${result.totalChanges === 1 ? "" : "s"}`
            : "Identical text content"}
        </Badge>
      </div>

      {result.pageCountA !== result.pageCountB && (
        <p className="text-xs text-muted-foreground">
          File A has {result.pageCountA} page{result.pageCountA === 1 ? "" : "s"}; File B has{" "}
          {result.pageCountB} page{result.pageCountB === 1 ? "" : "s"}. Extra pages are shown as fully
          added or removed below.
        </p>
      )}

      {changedPages.length === 0 ? (
        <p className="rounded-lg bg-secondary/50 p-3 text-sm text-muted-foreground">
          No text differences found on any page — the two documents contain the same text content.
        </p>
      ) : (
        <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
          {changedPages.map((page) => (
            <div key={page.pageNum}>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                Page {page.pageNum}
                {!page.inA && " (only in File B)"}
                {!page.inB && " (only in File A)"}
              </p>
              <div className="space-y-0.5 rounded-lg border border-border/70 bg-secondary/20 p-2">
                {page.diff.map((entry, i) => (
                  <DiffLine key={i} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={options.onlyChangedPages ?? true}
          onChange={(e) => setOptions({ ...options, onlyChangedPages: e.target.checked })}
          className="size-4 rounded border-border accent-accent"
        />
        Downloaded report includes only pages with changes
      </label>
    </Card>
  );
}
