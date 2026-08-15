"use client";

import { useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(1);
  return `${m}:${s.padStart(4, "0")}`;
}

export function ExtractVideoFrameOptionsPanel({ files, options, setOptions }) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(null);
  const [videoUrl] = useState(() => URL.createObjectURL(files[0]));
  const timestamp = options.timestampSec ?? 0;

  useEffect(() => () => URL.revokeObjectURL(videoUrl), [videoUrl]);

  function handleLoadedMetadata() {
    setDuration(videoRef.current.duration);
  }

  function handleSliderChange([value]) {
    setOptions({ ...options, timestampSec: value });
    if (videoRef.current) videoRef.current.currentTime = value;
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
          <Label>Frame at: {formatTime(timestamp)}</Label>
          <Slider
            className="mt-3"
            min={0}
            max={duration}
            step={0.1}
            value={[timestamp]}
            onValueChange={handleSliderChange}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Scrub the video above or drag the slider to the exact moment you want to capture, then
            extract.
          </p>
        </div>
      )}
    </Card>
  );
}
