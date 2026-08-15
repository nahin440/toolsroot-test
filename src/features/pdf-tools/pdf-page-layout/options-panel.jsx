"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LAYOUTS = [
  { value: 2, label: "2-up", shape: "2×1" },
  { value: 4, label: "4-up", shape: "2×2" },
  { value: 6, label: "6-up", shape: "3×2" },
  { value: 9, label: "9-up", shape: "3×3" },
  { value: 16, label: "16-up", shape: "4×4" },
];

export function PdfPageLayoutOptionsPanel({ options, setOptions }) {
  const perSheet = options.perSheet || 4;

  return (
    <Card className="space-y-4 p-5">
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Pages per sheet</p>
        <div className="grid grid-cols-5 gap-2">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => setOptions({ ...options, perSheet: layout.value })}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl border p-3 transition-colors",
                perSheet === layout.value
                  ? "border-accent bg-accent-tint"
                  : "border-border bg-secondary/30 hover:border-accent/40"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  perSheet === layout.value ? "text-accent-active" : "text-foreground"
                )}
              >
                {layout.label}
              </span>
              <span className="text-[11px] text-muted-foreground">{layout.shape}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Pages are arranged left to right, top to bottom, scaled down to fit each cell while keeping
        their original proportions. The output uses your first page&apos;s size as the sheet size.
      </p>
    </Card>
  );
}
