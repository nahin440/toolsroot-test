"use client";

import { useEffect, useState } from "react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

import { pdfToMarkdown } from "@/lib/engines/pdf/pdf-to-markdown";
import { Card } from "@/components/ui/card";

export function PdfToMarkdownOptionsPanel({ files }) {
  const [state, setState] = useState({ key: null, markdown: null, error: null });

  useEffect(() => {
    if (files.length === 0) return;
    const key = String(files[0]);
    let cancelled = false;

    pdfToMarkdown(files[0])
      .then((markdown) => {
        if (!cancelled) setState({ key, markdown, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ key, markdown: null, error: e?.message || "Couldn't read this PDF." });
      });

    return () => {
      cancelled = true;
    };
  }, [files]);

  const isCurrent = state.key === String(files[0]);
  const markdown = isCurrent ? state.markdown : null;
  const error = isCurrent ? state.error : null;

  if (error) {
    return (
      <Card className="flex items-center gap-3 p-5 text-sm text-primary">
        <HiOutlineExclamationTriangle className="size-5 shrink-0" />
        {error}
      </Card>
    );
  }

  if (!markdown) {
    return (
      <Card className="space-y-3 p-5">
        <div className="h-4 w-1/3 animate-pulse rounded skeleton-shimmer" />
        <div className="h-40 animate-pulse rounded-lg skeleton-shimmer" />
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <p className="mb-2 text-sm font-medium text-foreground">Markdown preview</p>
      <pre className="max-h-[420px] overflow-auto rounded-lg bg-secondary/30 p-3 font-mono text-xs whitespace-pre-wrap text-foreground">
        {markdown}
      </pre>
    </Card>
  );
}
