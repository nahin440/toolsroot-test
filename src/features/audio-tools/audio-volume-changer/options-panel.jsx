"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function AudioVolumeChangerOptionsPanel({ options, setOptions }) {
  const db = options.db ?? 0;

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>
          Volume: {db > 0 ? "+" : ""}
          {db} dB
        </Label>
        <Slider
          className="mt-2"
          min={-30}
          max={30}
          step={1}
          value={[db]}
          onValueChange={([v]) => setOptions({ ...options, db: v })}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Positive values boost volume, negative values reduce it. A large boost on already-loud audio
        can introduce clipping (a harsh, distorted sound) — if that happens, try a smaller boost, or use
        Normalize Audio instead for a more automatic, clipping-safe loudness adjustment.
      </p>
    </Card>
  );
}
