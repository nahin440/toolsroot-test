"use client";

import { HiOutlineArrowPath } from "react-icons/hi2";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ANGLES = [90, 180, 270];

export function RotatePdfOptionsPanel({ options, setOptions }) {
  const angle = options.angle || 90;

  return (
    <Card className="space-y-4 p-5">
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Rotation angle</p>
        <div className="flex gap-2">
          {ANGLES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setOptions({ ...options, angle: a })}
              className={cn(
                "flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                angle === a ? "border-accent bg-accent-tint" : "border-border bg-secondary/30 hover:border-accent/40"
              )}
            >
              <HiOutlineArrowPath className={cn("size-5", angle === a ? "text-accent" : "text-muted-foreground")} style={{ transform: `rotate(${a}deg)` }} />
              <span className={cn("text-sm font-medium", angle === a ? "text-accent-active" : "text-foreground")}>
                {a}°
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="page-range">Pages (optional — leave blank for all pages)</Label>
        <Input
          id="page-range"
          placeholder="e.g. 1,3,5-8"
          value={options.pageRangeText || ""}
          onChange={(e) => setOptions({ ...options, pageRangeText: e.target.value })}
          className="mt-1.5"
        />
      </div>
    </Card>
  );
}
