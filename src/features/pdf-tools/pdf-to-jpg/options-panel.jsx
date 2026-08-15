"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const SCALE_PRESETS = [
  { value: 1, label: "Standard", hint: "~72 DPI" },
  { value: 2, label: "High", hint: "~144 DPI" },
  { value: 3, label: "Print", hint: "~216 DPI" },
];

export function PdfToJpgOptionsPanel({ options, setOptions }) {
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

      <div>
        <Label>Quality: {Math.round((options.quality ?? 0.92) * 100)}%</Label>
        <Slider
          className="mt-2"
          min={40}
          max={100}
          value={[Math.round((options.quality ?? 0.92) * 100)]}
          onValueChange={([v]) => setOptions({ ...options, quality: v / 100 })}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Each page of your PDF becomes a separate JPG image. Multi-page PDFs download as a ZIP.
        </p>
      </div>
    </Card>
  );
}
