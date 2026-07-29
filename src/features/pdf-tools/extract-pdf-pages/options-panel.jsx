"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PdfPageThumbnailGrid } from "@/components/pdf/pdf-page-thumbnail-grid";

export function ExtractPdfPagesOptionsPanel({ files, options, setOptions }) {
  const [selected, setSelected] = useState(new Set(options.pagesToExtract || []));

  function toggle(pageNum) {
    const next = new Set(selected);
    if (next.has(pageNum)) next.delete(pageNum);
    else next.add(pageNum);
    setSelected(next);
    setOptions({ ...options, pagesToExtract: [...next].sort((a, b) => a - b) });
  }

  return (
    <Card className="p-5">
      <p className="mb-3 text-sm text-muted-foreground">
        Click the pages you want to keep in the new PDF ({selected.size} selected).
      </p>
      <PdfPageThumbnailGrid file={files[0]} selected={selected} onToggle={toggle} selectionStyle="highlight" />
    </Card>
  );
}
