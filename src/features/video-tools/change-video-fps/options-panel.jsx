"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FPS_OPTIONS = [24, 25, 30, 48, 60, 120];

export function ChangeVideoFpsOptionsPanel({ options, setOptions }) {
  return (
    <Card className="p-5">
      <Label>Target frame rate</Label>
      <Select
        value={String(options.targetFps || 30)}
        onValueChange={(v) => setOptions({ ...options, targetFps: Number(v) })}
      >
        <SelectTrigger className="mt-1.5 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FPS_OPTIONS.map((fps) => (
            <SelectItem key={fps} value={String(fps)}>
              {fps} fps
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
}
