"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PdfPageThumbnailGrid } from "@/components/pdf/pdf-page-thumbnail-grid";

export function DeletePdfPagesOptionsPanel({ files, options, setOptions }) {
  const [selected, setSelected] = useState(new Set(options.pagesToDelete || []));

  function toggle(pageNum) {
    const next = new Set(selected);
    if (next.has(pageNum)) next.delete(pageNum);
    else next.add(pageNum);
    setSelected(next);
    setOptions({ ...options, pagesToDelete: [...next] });
  }

  return (
    <Card className="p-5">
      <p className="mb-3 text-sm text-muted-foreground">
        Click pages to mark them for deletion ({selected.size} selected).
      </p>
      <PdfPageThumbnailGrid file={files[0]} selected={selected} onToggle={toggle} selectionStyle="remove" />
    </Card>
  );
}
