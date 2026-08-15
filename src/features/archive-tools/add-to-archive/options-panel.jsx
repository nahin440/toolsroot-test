"use client";

import { useState } from "react";
import { HiOutlineDocument, HiOutlineXMark } from "react-icons/hi2";

import { formatBytes } from "@/lib/validation/validate-file";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function AddToArchiveOptionsPanel({ files, options, setOptions }) {
  const [dragActive, setDragActive] = useState(false);
  const newFiles = options.newFiles || [];

  function addFiles(fileList) {
    const added = Array.from(fileList);
    setOptions({ ...options, newFiles: [...newFiles, ...added] });
  }

  function removeFile(index) {
    setOptions({ ...options, newFiles: newFiles.filter((_, i) => i !== index) });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-2 rounded-lg bg-secondary/40 p-3 text-sm text-foreground">
        <HiOutlineDocument className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">Adding files to {files[0].name}</span>
      </div>

      <div>
        <Label htmlFor="new-files-upload">Files to add</Label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`mt-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
            dragActive ? "border-accent bg-accent-tint" : "border-border bg-secondary/20"
          }`}
        >
          <Input
            id="new-files-upload"
            type="file"
            multiple
            onChange={(e) => e.target.files?.length && addFiles(e.target.files)}
            className="mb-1"
          />
          <p className="text-xs text-muted-foreground">or drag files here</p>
        </div>
      </div>

      {newFiles.length > 0 && (
        <div className="space-y-1.5">
          {newFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2 text-sm">
              <HiOutlineDocument className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-foreground">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <HiOutlineXMark className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
