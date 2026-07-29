"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LEVELS = [
  { value: "low", label: "Extreme compression", desc: "Smallest file size, lower image quality" },
  { value: "medium", label: "Recommended", desc: "Good balance of size and quality" },
  { value: "high", label: "Less compression", desc: "Larger file, best image quality" },
];

export function CompressPdfOptionsPanel({ options, setOptions }) {
  const level = options.level || "medium";

  return (
    <Card className="p-5">
      <p className="mb-3 text-sm font-medium text-foreground">Compression level</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => setOptions({ ...options, level: l.value })}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              level === l.value
                ? "border-accent bg-accent-tint"
                : "border-border bg-secondary/30 hover:border-accent/40"
            )}
          >
            <p className={cn("text-sm font-medium", level === l.value ? "text-accent-active" : "text-foreground")}>
              {l.label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{l.desc}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}
