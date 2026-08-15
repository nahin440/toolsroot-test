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

export function AudioFadeOptionsPanel({ files, options, setOptions }) {
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(null);
  const [audioUrl] = useState(() => URL.createObjectURL(files[0]));
  const fadeIn = options.fadeInSec ?? 0;
  const fadeOut = options.fadeOutSec ?? 0;

  useEffect(() => {
    return () => URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  // Deliberately no effect deriving anything from `duration` here —
  // it's read-once display-only state for the slider's max bound and
  // the "total duration" caption. The fade-out's absolute start
  // timestamp that the engine actually needs is computed by the
  // adapter's run() from the file directly (see adapter.js), not synced
  // into `options` via an effect, so nothing here writes state in
  // response to other state changing.

  function handleLoadedMetadata() {
    setDuration(audioRef.current.duration);
  }

  const maxFade = duration ? Math.floor(duration / 2) : 30;

  return (
    <Card className="space-y-4 p-5">
      <audio ref={audioRef} src={audioUrl} controls className="w-full" onLoadedMetadata={handleLoadedMetadata} />

      {duration && (
        <>
          <div>
            <Label>Fade in: {fadeIn.toFixed(1)}s</Label>
            <Slider
              className="mt-2"
              min={0}
              max={maxFade}
              step={0.5}
              value={[fadeIn]}
              onValueChange={([v]) => setOptions({ ...options, fadeInSec: v })}
            />
          </div>
          <div>
            <Label>Fade out: {fadeOut.toFixed(1)}s</Label>
            <Slider
              className="mt-2"
              min={0}
              max={maxFade}
              step={0.5}
              value={[fadeOut]}
              onValueChange={([v]) => setOptions({ ...options, fadeOutSec: v })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Total duration is {formatTime(duration)}. Fade in starts at the very beginning; fade out
            ends at the very end.
          </p>
        </>
      )}
    </Card>
  );
}
