"use client";

import { useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TrimVideoOptionsPanel({ files, options, setOptions }) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(null);
  const [videoUrl] = useState(() => URL.createObjectURL(files[0]));
  const start = options.startSec ?? 0;
  const end = options.endSec ?? duration ?? 0;

  useEffect(() => () => URL.revokeObjectURL(videoUrl), [videoUrl]);

  function handleLoadedMetadata() {
    const d = videoRef.current.duration;
    setDuration(d);
    if (options.endSec === undefined) {
      setOptions((prev) => ({ ...prev, startSec: 0, endSec: d }));
    }
  }

  return (
    <Card className="space-y-4 p-5">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="max-h-80 w-full rounded-lg bg-black"
        onLoadedMetadata={handleLoadedMetadata}
      />
      {duration && (
        <div>
          <Label>
            Trim range: {formatTime(start)} – {formatTime(end)}
          </Label>
          <Slider
            className="mt-3"
            min={0}
            max={duration}
            step={0.1}
            value={[start, end]}
            onValueChange={([s, e]) => setOptions({ ...options, startSec: s, endSec: e })}
          />
        </div>
      )}
    </Card>
  );
}
