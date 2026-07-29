"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FORMATS = ["mp3", "wav", "aac", "m4a", "flac", "ogg"];

export function ExtractAudioOptionsPanel({ options, setOptions }) {
  return (
    <Card className="p-5">
      <Label>Output format</Label>
      <Select value={options.targetExt || "mp3"} onValueChange={(v) => setOptions({ ...options, targetExt: v })}>
        <SelectTrigger className="mt-1.5 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FORMATS.map((f) => (
            <SelectItem key={f} value={f}>
              {f.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
}
