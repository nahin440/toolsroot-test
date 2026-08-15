"use client";

import { useEffect, useState } from "react";
import { HiOutlineDocument, HiOutlineExclamationTriangle, HiOutlineFolder } from "react-icons/hi2";

import { listArchiveContents } from "@/lib/engines/archive/archive-core";
import { formatBytes } from "@/lib/validation/validate-file";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ListArchiveContentsOptionsPanel({ files }) {
  const [state, setState] = useState({ key: null, entries: null, error: null });

  useEffect(() => {
    if (files.length === 0) return;
    const key = String(files[0]);
    let cancelled = false;

    listArchiveContents(files[0])
      .then((entries) => {
        if (!cancelled) setState({ key, entries, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ key, entries: null, error: e?.message || "Couldn't read this archive." });
      });

    return () => {
      cancelled = true;
    };
  }, [files]);

  const isCurrent = state.key === String(files[0]);
  const entries = isCurrent ? state.entries : null;
  const error = isCurrent ? state.error : null;

  if (error) {
    return (
      <Card className="flex items-center gap-3 p-5 text-sm text-primary">
        <HiOutlineExclamationTriangle className="size-5 shrink-0" />
        {error}
      </Card>
    );
  }

  if (!entries) {
    return (
      <Card className="space-y-2 p-5">
        <div className="h-4 w-1/3 animate-pulse rounded skeleton-shimmer" />
        <div className="h-40 animate-pulse rounded-lg skeleton-shimmer" />
      </Card>
    );
  }

  const fileCount = entries.filter((e) => !e.isDirectory).length;
  const totalSize = entries.reduce((sum, e) => sum + (e.uncompressedSize || 0), 0);

  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          {fileCount} file{fileCount === 1 ? "" : "s"}
        </Badge>
        <span className="text-xs text-muted-foreground">{formatBytes(totalSize)} uncompressed</span>
      </div>
      <div className="max-h-[420px] space-y-1 overflow-y-auto">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-secondary/40">
            {entry.isDirectory ? (
              <HiOutlineFolder className="size-4 shrink-0 text-accent-active" />
            ) : (
              <HiOutlineDocument className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{entry.name}</span>
            {!entry.isDirectory && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatBytes(entry.uncompressedSize || 0)}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
