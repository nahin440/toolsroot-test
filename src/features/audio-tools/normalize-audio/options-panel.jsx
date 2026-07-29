"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRESETS = [
  { value: -14, label: "Streaming (Spotify, YouTube) — -14 LUFS" },
  { value: -16, label: "Podcast — -16 LUFS" },
  { value: -23, label: "Broadcast — -23 LUFS" },
];

export function NormalizeAudioOptionsPanel({ options, setOptions }) {
  return (
    <Card className="p-5">
      <Label>Target loudness</Label>
      <Select
        value={String(options.targetLufs ?? -16)}
        onValueChange={(v) => setOptions({ ...options, targetLufs: Number(v) })}
      >
        <SelectTrigger className="mt-1.5 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={String(p.value)}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
}
