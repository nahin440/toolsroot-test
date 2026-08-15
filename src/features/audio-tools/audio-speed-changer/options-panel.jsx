"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function AudioSpeedChangerOptionsPanel({ options, setOptions }) {
  const speed = options.speedFactor ?? 1;

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Speed: {speed.toFixed(2)}×</Label>
        <Slider
          className="mt-2"
          min={0.25}
          max={4}
          step={0.05}
          value={[speed]}
          onValueChange={([v]) => setOptions({ ...options, speedFactor: v })}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setOptions({ ...options, speedFactor: p })}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              speed === p
                ? "border-accent bg-accent-tint text-accent-active"
                : "border-border bg-secondary/30 text-muted-foreground hover:border-accent/40"
            }`}
          >
            {p}×
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Speed changes without affecting pitch — your audio plays faster or slower, but voices and music
        don&apos;t sound higher or lower.
      </p>
    </Card>
  );
}
