"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlinePlus, HiOutlineXMark } from "react-icons/hi2";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SplitAudioOptionsPanel({ files, options, setOptions }) {
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(null);
  const [audioUrl] = useState(() => URL.createObjectURL(files[0]));
  const splitPoints = options.timestamps || [];

  useEffect(() => () => URL.revokeObjectURL(audioUrl), [audioUrl]);

  function addSplitPointAtCurrentTime() {
    const t = audioRef.current?.currentTime;
    if (t === undefined || t <= 0 || t >= duration) return;
    const next = [...new Set([...splitPoints, Math.round(t * 10) / 10])].sort((a, b) => a - b);
    setOptions({ ...options, timestamps: next });
  }

  function removeSplitPoint(t) {
    setOptions({ ...options, timestamps: splitPoints.filter((p) => p !== t) });
  }

  return (
    <Card className="space-y-4 p-5">
      <audio
        ref={audioRef}
        src={audioUrl}
        controls
        className="w-full"
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />

      <div>
        <Label>Split points</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Play the audio, pause where you want a split, then click &ldquo;Add split point here.&rdquo;
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={addSplitPointAtCurrentTime}>
          <HiOutlinePlus className="size-4" />
          Add split point here
        </Button>

        {splitPoints.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {splitPoints.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 rounded-full bg-accent-tint px-3 py-1 text-xs font-medium text-accent-active"
              >
                {formatTime(t)}
                <button onClick={() => removeSplitPoint(t)} aria-label={`Remove split point at ${formatTime(t)}`}>
                  <HiOutlineXMark className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
