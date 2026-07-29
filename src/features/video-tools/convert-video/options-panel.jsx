"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FORMATS = ["mp4", "webm", "avi", "mov", "mkv", "gif"];

export function ConvertVideoOptionsPanel({ options, setOptions }) {
  return (
    <Card className="p-5">
      <Label>Convert to</Label>
      <Select value={options.targetExt || "mp4"} onValueChange={(v) => setOptions({ ...options, targetExt: v })}>
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
      {options.targetExt === "gif" && (
        <p className="mt-2 text-xs text-muted-foreground">
          GIF conversion works best with short clips (under ~15 seconds) since animated GIFs don&apos;t
          compress nearly as efficiently as video codecs.
        </p>
      )}
    </Card>
  );
}
