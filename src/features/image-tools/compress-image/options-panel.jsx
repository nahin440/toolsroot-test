"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function CompressImageOptionsPanel({ options, setOptions }) {
  return (
    <Card className="p-5">
      <Label>Quality: {Math.round((options.quality ?? 0.75) * 100)}%</Label>
      <Slider
        className="mt-2"
        min={5}
        max={100}
        value={[Math.round((options.quality ?? 0.75) * 100)]}
        onValueChange={([v]) => setOptions({ ...options, quality: v / 100 })}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Lower quality means a smaller file size. PNG images are re-optimized losslessly since PNG
        doesn&apos;t support a quality setting.
      </p>
    </Card>
  );
}
