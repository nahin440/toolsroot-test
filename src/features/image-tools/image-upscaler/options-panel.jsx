"use client";

import { HiOutlineInformationCircle } from "react-icons/hi2";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SCALES = [
  { value: 2, label: "2×", hint: "Sharper, smaller output" },
  { value: 4, label: "4×", hint: "Maximum detail" },
];

export function ImageUpscalerOptionsPanel({ options, setOptions }) {
  const scale = options.scale || 4;

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3.5 text-sm text-muted-foreground">
        <HiOutlineInformationCircle className="mt-0.5 size-4 shrink-0 text-accent-active" />
        <p>
          The first time you use this, your browser downloads a real AI upscaling model (about 67MB) —
          it&apos;s cached after that, so every upscale after the first is instant to start. Works best
          on images up to 1600px on the longest side; larger images should be resized down first.
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Upscale factor</p>
        <div className="grid grid-cols-2 gap-2">
          {SCALES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setOptions({ ...options, scale: s.value })}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl border p-3 transition-colors",
                scale === s.value
                  ? "border-accent bg-accent-tint"
                  : "border-border bg-secondary/30 hover:border-accent/40"
              )}
            >
              <span
                className={cn("text-lg font-semibold", scale === s.value ? "text-accent-active" : "text-foreground")}
              >
                {s.label}
              </span>
              <span className="text-[11px] text-muted-foreground">{s.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
