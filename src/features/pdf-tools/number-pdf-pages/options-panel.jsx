"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const POSITIONS = [
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
];

const FORMATS = [
  { value: "n", label: "1, 2, 3…" },
  { value: "page-n", label: "Page 1, Page 2…" },
  { value: "n-of-total", label: "1 of 10, 2 of 10…" },
];

export function NumberPdfPagesOptionsPanel({ options, setOptions }) {
  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Position</Label>
        <Select
          value={options.position || "bottom-center"}
          onValueChange={(v) => setOptions({ ...options, position: v })}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POSITIONS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Format</Label>
        <Select value={options.format || "n"} onValueChange={(v) => setOptions({ ...options, format: v })}>
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

      <div>
        <Label htmlFor="start-at">Start numbering at</Label>
        <Input
          id="start-at"
          type="number"
          min={1}
          value={options.startAt || 1}
          onChange={(e) => setOptions({ ...options, startAt: parseInt(e.target.value, 10) || 1 })}
          className="mt-1.5 w-24"
        />
      </div>
    </Card>
  );
}
