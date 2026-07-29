"use client";

import { motion } from "motion/react";
import { HiCheckCircle } from "react-icons/hi2";
import { HiDownload, HiRefresh } from "react-icons/hi";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBytes } from "@/lib/validation/validate-file";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * @param {object} props
 * @param {Array} props.completedFiles - entries with resultBlob + resultName set
 * @param {() => void} props.onReset
 * @param {() => Promise<void>} [props.onDownloadAllZip] - provided by the
 *   caller when there are multiple output files, using JSZip to bundle them.
 */
export function ResultPanel({ completedFiles, onReset, onDownloadAllZip, title = "All done" }) {
  const single = completedFiles.length === 1;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="flex items-center gap-4 p-5">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.05 }}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent"
        >
          <HiCheckCircle className="size-6" />
        </motion.div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">
            {completedFiles.length} file{completedFiles.length > 1 ? "s" : ""} ready to download.
          </p>
        </div>
        {single ? (
          <Button
            variant="accent"
            onClick={() => downloadBlob(completedFiles[0].resultBlob, completedFiles[0].resultName)}
          >
            <HiDownload className="size-4" />
            Download
          </Button>
        ) : (
          onDownloadAllZip && (
            <Button variant="accent" onClick={onDownloadAllZip}>
              <HiDownload className="size-4" />
              Download all (.zip)
            </Button>
          )
        )}
      </Card>

      {!single && (
        <div className="space-y-2">
          {completedFiles.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{f.resultName}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(f.resultBlob.size)}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => downloadBlob(f.resultBlob, f.resultName)}>
                <HiDownload className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" onClick={onReset} className="w-full">
        <HiRefresh className="size-4" />
        Convert another file
      </Button>
    </motion.div>
  );
}

export { downloadBlob };
