"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineDocumentText, HiOutlineExclamationTriangle } from "react-icons/hi2";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function AddSubtitlesOptionsPanel({ files, options, setOptions }) {
  const [videoUrl] = useState(() => URL.createObjectURL(files[0]));
  const fileInputRef = useRef(null);
  const subtitleFile = options.subtitleFile;

  useEffect(() => () => URL.revokeObjectURL(videoUrl), [videoUrl]);

  function handleSubtitleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "srt" && ext !== "vtt") {
      setOptions({ ...options, subtitleFile: null, subtitleError: "Please choose a .srt or .vtt file." });
      return;
    }
    setOptions({ ...options, subtitleFile: file, subtitleError: null });
  }

  return (
    <Card className="space-y-4 p-5">
      <video src={videoUrl} controls className="max-h-80 w-full rounded-lg bg-black" />

      <div>
        <Label htmlFor="subtitle-upload">Subtitle file (.srt or .vtt)</Label>
        <Input
          id="subtitle-upload"
          ref={fileInputRef}
          type="file"
          accept=".srt,.vtt"
          onChange={handleSubtitleChange}
          className="mt-2"
        />
      </div>

      {subtitleFile && (
        <div className="flex items-center gap-2 rounded-lg bg-secondary/40 p-3 text-sm text-foreground">
          <HiOutlineDocumentText className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{subtitleFile.name}</span>
        </div>
      )}

      {options.subtitleError && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
          <HiOutlineExclamationTriangle className="size-4 shrink-0" />
          {options.subtitleError}
        </div>
      )}
    </Card>
  );
}
