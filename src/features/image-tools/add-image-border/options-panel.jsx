"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const STYLES = [
  { value: "solid", label: "Solid" },
  { value: "rounded", label: "Rounded corners" },
];

const SWATCHES = ["#ffffff", "#000000", "#f5f5f4", "#1e293b", "#dc2626", "#2563eb"];

export function AddImageBorderOptionsPanel({ options, setOptions }) {
  const widthPercent = options.widthPercent ?? 4;
  const color = options.color || "#ffffff";
  const style = options.style || "solid";

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Border width: {widthPercent}% of image size</Label>
        <Slider
          className="mt-2"
          min={1}
          max={20}
          value={[widthPercent]}
          onValueChange={([v]) => setOptions({ ...options, widthPercent: v })}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Border color</p>
        <div className="flex flex-wrap items-center gap-2">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Use ${swatch}`}
              onClick={() => setOptions({ ...options, color: swatch })}
              className={cn(
                "size-8 rounded-full border-2 transition-transform",
                color === swatch ? "scale-110 border-accent" : "border-border"
              )}
              style={{ backgroundColor: swatch }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setOptions({ ...options, color: e.target.value })}
            className="size-8 cursor-pointer rounded-full border border-border bg-transparent p-0.5"
            aria-label="Custom border color"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Corner style</p>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setOptions({ ...options, style: s.value })}
              className={cn(
                "rounded-xl border p-3 text-sm font-medium transition-colors",
                style === s.value
                  ? "border-accent bg-accent-tint text-accent-active"
                  : "border-border bg-secondary/30 text-foreground hover:border-accent/40"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
