"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ImageToPdfOptionsPanel({ options, setOptions }) {
  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Page size</Label>
        <Select value={options.pageSize || "a4"} onValueChange={(v) => setOptions({ ...options, pageSize: v })}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a4">A4</SelectItem>
            <SelectItem value="letter">US Letter</SelectItem>
            <SelectItem value="fit">Fit to image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {options.pageSize !== "fit" && (
        <div>
          <Label>Orientation</Label>
          <Select
            value={options.orientation || "portrait"}
            onValueChange={(v) => setOptions({ ...options, orientation: v })}
          >
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </Card>
  );
}
