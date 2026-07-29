"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRESETS = [
  { value: "3840x-1", label: "4K (2160p)" },
  { value: "1920x-1", label: "Full HD (1080p)" },
  { value: "1280x-1", label: "HD (720p)" },
  { value: "854x-1", label: "SD (480p)" },
  { value: "custom", label: "Custom dimensions" },
];

export function ResizeVideoOptionsPanel({ options, setOptions }) {
  const preset = options.preset || "1920x-1";

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Resolution</Label>
        <Select value={preset} onValueChange={(v) => setOptions({ ...options, preset: v })}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-3">
          <div>
            <Label htmlFor="video-width">Width</Label>
            <Input
              id="video-width"
              type="number"
              value={options.width || ""}
              onChange={(e) => setOptions({ ...options, width: parseInt(e.target.value, 10) })}
              className="mt-1.5 w-28"
            />
          </div>
          <div>
            <Label htmlFor="video-height">Height</Label>
            <Input
              id="video-height"
              type="number"
              value={options.height || ""}
              onChange={(e) => setOptions({ ...options, height: parseInt(e.target.value, 10) })}
              className="mt-1.5 w-28"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
