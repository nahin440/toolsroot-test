"use client";

import { HiOutlineArrowPath } from "react-icons/hi2";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ANGLES = [90, 180, 270];

export function RotateVideoOptionsPanel({ options, setOptions }) {
  const angle = options.degreesVal || 90;

  return (
    <Card className="p-5">
      <p className="mb-3 text-sm font-medium text-foreground">Rotation angle</p>
      <div className="flex gap-2">
        {ANGLES.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setOptions({ ...options, degreesVal: a })}
            className={cn(
              "flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
              angle === a ? "border-accent bg-accent-tint" : "border-border bg-secondary/30 hover:border-accent/40"
            )}
          >
            <HiOutlineArrowPath
              className={cn("size-5", angle === a ? "text-accent" : "text-muted-foreground")}
              style={{ transform: `rotate(${a}deg)` }}
            />
            <span className={cn("text-sm font-medium", angle === a ? "text-accent-active" : "text-foreground")}>
              {a}°
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
