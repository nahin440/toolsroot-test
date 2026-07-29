"use client";

import { useEffect, useMemo, useState } from "react";

import { ToolPageShell } from "./tool-page-shell";
import { getAdapterLoader } from "@/features/adapter-registry";
import { Skeleton } from "@/components/ui/skeleton";

export function ToolPageClient({ toolSlug, toolName }) {
  const [adapter, setAdapter] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const loader = useMemo(() => getAdapterLoader(toolSlug), [toolSlug]);

  useEffect(() => {
    if (!loader) return;
    let cancelled = false;
    loader()
      .then((a) => {
        if (!cancelled) setAdapter(() => a);
      })
      .catch((err) => {
        console.error(`Failed to load adapter for ${toolSlug}:`, err);
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loader, toolSlug]);

  if (!loader || loadFailed) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        This tool couldn&apos;t be loaded. Please refresh the page and try again.
      </div>
    );
  }

  if (!adapter) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/40">
        <Skeleton className="size-10 rounded-full" />
      </div>
    );
  }

  return <ToolPageShell adapter={adapter} toolName={toolName} />;
}
