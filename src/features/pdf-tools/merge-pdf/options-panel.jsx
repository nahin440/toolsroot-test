"use client";

import { useState } from "react";
import { Reorder } from "motion/react";
import { HiBars3, HiOutlineDocument } from "react-icons/hi2";

import { formatBytes } from "@/lib/validation/validate-file";

export function MergePdfOptionsPanel({ files, options, setOptions }) {
  const [order, setOrder] = useState(files.map((_, i) => i));

  function handleReorder(newOrder) {
    setOrder(newOrder);
    setOptions({ ...options, order: newOrder });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
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
                <HiOutlineDocument className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
