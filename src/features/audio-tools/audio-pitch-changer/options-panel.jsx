"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function AudioPitchChangerOptionsPanel({ options, setOptions }) {
  const semitones = options.semitones ?? 0;

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>
          Pitch shift: {semitones > 0 ? "+" : ""}
          {semitones} semitone{Math.abs(semitones) === 1 ? "" : "s"}
        </Label>
        <Slider
          className="mt-2"
          min={-12}
          max={12}
          step={1}
          value={[semitones]}
          onValueChange={([v]) => setOptions({ ...options, semitones: v })}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Duration stays the same — only pitch changes. Smaller shifts (within a few semitones) sound
        cleanest; larger shifts toward either end of the range introduce more audible artifacts, which
        is a real characteristic of this processing technique rather than a bug.
      </p>
    </Card>
  );
}
