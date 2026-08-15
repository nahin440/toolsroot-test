"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SCALE_PRESETS = [
  { value: 1, label: "Standard", hint: "~72 DPI" },
  { value: 2, label: "High", hint: "~144 DPI" },
  { value: 3, label: "Print", hint: "~216 DPI" },
];

export function PdfToPngOptionsPanel({ options, setOptions }) {
  const scale = options.scale || 2;

  return (
    <Card className="space-y-4 p-5">
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Output resolution</p>
        <div className="grid grid-cols-3 gap-2">
          {SCALE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setOptions({ ...options, scale: preset.value })}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl border p-3 transition-colors",
                scale === preset.value
                  ? "border-accent bg-accent-tint"
                  : "border-border bg-secondary/30 hover:border-accent/40"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  scale === preset.value ? "text-accent-active" : "text-foreground"
                )}
              >
                {preset.label}
              </span>
              <span className="text-[11px] text-muted-foreground">{preset.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        PNG output is lossless, so there&apos;s no quality setting to trade off — higher resolution
        means a larger file, at full fidelity either way. Each page becomes a separate PNG; multi-page
        PDFs download as a ZIP.
      </p>
    </Card>
  );
}
