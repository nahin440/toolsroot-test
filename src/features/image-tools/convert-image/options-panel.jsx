"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FORMATS = [
  { value: "png", label: "PNG", lossy: false },
  { value: "jpg", label: "JPG", lossy: true },
  { value: "webp", label: "WebP", lossy: true },
  { value: "avif", label: "AVIF", lossy: true },
  { value: "bmp", label: "BMP", lossy: false },
  { value: "ico", label: "ICO", lossy: false },
];

export function ConvertImageOptionsPanel({ options, setOptions }) {
  const format = options.targetFormat || "png";
  const selected = FORMATS.find((f) => f.value === format);

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Convert to</Label>
        <Select value={format} onValueChange={(v) => setOptions({ ...options, targetFormat: v })}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORMATS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected?.lossy && (
        <div>
          <Label>Quality: {Math.round((options.quality ?? 0.9) * 100)}%</Label>
          <Slider
            className="mt-2"
            min={10}
            max={100}
            value={[Math.round((options.quality ?? 0.9) * 100)]}
            onValueChange={([v]) => setOptions({ ...options, quality: v / 100 })}
          />
        </div>
      )}
    </Card>
  );
}
