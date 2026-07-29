"use client";

import { useState } from "react";
import { Reorder } from "motion/react";
import { HiBars3, HiOutlineMusicalNote, HiExclamationTriangle } from "react-icons/hi2";

import { formatBytes } from "@/lib/validation/validate-file";
import { Card } from "@/components/ui/card";

function getExt(filename) {
  return (filename.split(".").pop() || "").toLowerCase();
}

export function MergeAudioOptionsPanel({ files, options, setOptions }) {
  const [order, setOrder] = useState(files.map((_, i) => i));

  const extensions = new Set(files.map((f) => getExt(f.name)));
  const hasMismatchedFormats = extensions.size > 1;

  function handleReorder(newOrder) {
    setOrder(newOrder);
    setOptions({ ...options, order: newOrder });
  }

  return (
    <Card className="p-4">
      {hasMismatchedFormats && (
        <div className="mb-3 flex items-start gap-3 rounded-xl border border-border bg-secondary/60 p-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
            <HiExclamationTriangle className="size-4" />
          </div>
          <p className="text-xs text-muted-foreground">
            Your files are in different formats ({Array.from(extensions).join(", ").toUpperCase()}). Merging works
            reliably when every file shares the same format — mixed formats can produce a corrupted or broken
            result. Converting them to match first with Audio Converter is the safer option.
          </p>
        </div>
      )}
      <p className="mb-3 text-sm font-medium text-foreground">Drag to reorder before merging</p>
      <Reorder.Group axis="y" values={order} onReorder={handleReorder} className="space-y-2">
        {order.map((idx) => {
          const file = files[idx];
          return (
            <Reorder.Item
              key={`${file.name}-${idx}`}
              value={idx}
              className="flex cursor-grab items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 active:cursor-grabbing"
            >
              <HiBars3 className="size-4 shrink-0 text-muted-foreground" />
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-tint text-accent">
                <HiOutlineMusicalNote className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </Card>
  );
}
