"use client";

import { useEffect, useMemo } from "react";
import { HiOutlineArrowPath, HiArrowsRightLeft, HiArrowsUpDown } from "react-icons/hi2";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RotateFlipImageOptionsPanel({ files, options, setOptions }) {
  const rotation = options.rotationDeg || 0;
  const flip = options.flip || {};
  const previewUrl = useMemo(() => URL.createObjectURL(files[0]), [files]);

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center justify-center rounded-xl bg-secondary/40 p-8">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic object-URL preview of the uploaded file, not a static asset
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-64 transition-transform"
            style={{
              transform: `rotate(${rotation}deg) scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`,
            }}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setOptions({ ...options, rotationDeg: (rotation + 90) % 360 })}>
          <HiOutlineArrowPath className="size-4" />
          Rotate 90°
        </Button>
        <Button
          variant={flip.horizontal ? "accent" : "outline"}
          onClick={() => setOptions({ ...options, flip: { ...flip, horizontal: !flip.horizontal } })}
        >
          <HiArrowsRightLeft className="size-4" />
          Flip horizontal
        </Button>
        <Button
          variant={flip.vertical ? "accent" : "outline"}
          onClick={() => setOptions({ ...options, flip: { ...flip, vertical: !flip.vertical } })}
        >
          <HiArrowsUpDown className="size-4" />
          Flip vertical
        </Button>
      </div>
    </Card>
  );
}
