"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SWATCHES = ["#4f46e5", "#dc2626", "#059669", "#f59e0b", "#0ea5e9", "#000000"];

export function VideoToWaveformOptionsPanel({ options, setOptions }) {
  const color = options.color || "#4f46e5";

  return (
    <Card className="space-y-4 p-5">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Waveform color</p>
        <div className="flex flex-wrap items-center gap-2">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Use ${swatch}`}
              onClick={() => setOptions({ ...options, color: swatch })}
              className={cn(
                "size-8 rounded-full border-2 transition-transform",
                color === swatch ? "scale-110 border-accent" : "border-border"
              )}
              style={{ backgroundColor: swatch }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setOptions({ ...options, color: e.target.value })}
            className="size-8 cursor-pointer rounded-full border border-border bg-transparent p-0.5"
            aria-label="Custom waveform color"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Renders your video&apos;s audio track as a static amplitude-over-time image, computed directly
        from the real audio data.
      </p>
    </Card>
  );
}
