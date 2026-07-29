"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import JSZip from "jszip";

import { Dropzone, AddMoreFilesButton } from "@/components/upload/dropzone";
import { FileQueueItem } from "@/components/upload/file-queue-item";
import { ProcessingPanel } from "@/components/upload/processing-panel";
import { ResultPanel, downloadBlob } from "@/components/upload/result-panel";
import { ErrorPanel } from "@/components/upload/error-panel";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";

// Module-level (not component-state, not a ref read during render) map
// from File object identity to a stable display id. Reading/writing a
// module-level Map during render is fine — it's the render-time access
// to useRef's `.current` specifically that the lint rule (correctly)
// flags, since ref reads during render can silently miss re-renders.
const fileIdMap = new WeakMap();
let nextFileId = 1;

function getStableFileId(file) {
  if (!fileIdMap.has(file)) {
    fileIdMap.set(file, `${file.name}-${file.size}-${nextFileId++}`);
  }
  return fileIdMap.get(file);
}

/**
 * @typedef ToolAdapter
 * @property {string[]} accepts
 * @property {boolean} multiple
 * @property {number} [minFiles]
 * @property {number} [maxSizeBytes]
 * @property {React.ComponentType} [OptionsPanel] - receives {files, options, setOptions}, renders BEFORE processing starts
 * @property {(files: File[], options: object, onProgress: (p:{stage,value}) => void) => Promise<{blob: Blob, name: string}[]>} run
 * @property {string} [runButtonLabel]
 * @property {boolean} [autoRunOnUpload] - skip the options panel and process immediately
 */

/** @param {{adapter: ToolAdapter, toolName: string}} props */
export function ToolPageShell({ adapter, toolName }) {
  const [files, setFiles] = useState([]);
  const [phase, setPhase] = useState("upload"); // upload | options | processing | completed | error
  const [options, setOptions] = useState(adapter.defaultOptions || {});
  const [stage, setStage] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFilesAccepted = useCallback(
    (newFiles) => {
      setFiles((prev) => (adapter.multiple ? [...prev, ...newFiles] : newFiles));
      setPhase(adapter.autoRunOnUpload ? "upload" : "options");
    },
    [adapter.multiple, adapter.autoRunOnUpload]
  );

  const handleValidationErrors = useCallback((errors) => {
    errors.forEach((e) => toast.error(e.error));
  }, []);

  const handleRemoveFile = useCallback((id) => {
    setFiles((prev) => {
      const next = prev.filter((f) => getStableFileId(f) !== id);
      if (!next.length) setPhase("upload");
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setFiles([]);
    setResults([]);
    setPhase("upload");
    setErrorMessage(null);
    setOverallProgress(0);
    setStage(null);
    setOptions(adapter.defaultOptions || {});
  }, [adapter.defaultOptions]);

  const handleRun = useCallback(async () => {
    if (adapter.minFiles && files.length < adapter.minFiles) {
      toast.error(`Add at least ${adapter.minFiles} files to continue.`);
      return;
    }
    setPhase("processing");
    setErrorMessage(null);
    try {
      const outputs = await adapter.run(files, options, ({ stage: s, value }) => {
        setStage(s);
        setOverallProgress(value ?? 0);
      });
      setResults(outputs);
      setPhase("completed");
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.message || "Something unexpected went wrong while processing your file.");
      setPhase("error");
    }
  }, [adapter, files, options]);

  const handleDownloadAllZip = useCallback(async () => {
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.name, r.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `${adapter.zipName || "toolsroot-output"}.zip`);
  }, [results, adapter.zipName]);

  // Tag files with a stable id for the queue list UI (File objects don't
  // have one natively). getStableFileId reads/writes a module-level
  // WeakMap rather than a ref, so this is a pure derivation from `files`
  // and safe to compute during render.
  const taggedFiles = useMemo(
    () => files.map((f) => ({ file: f, id: getStableFileId(f) })),
    [files]
  );

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {phase === "upload" && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <Dropzone
              accepts={adapter.accepts}
              multiple={adapter.multiple}
              maxSizeBytes={adapter.maxSizeBytes}
              onFilesAccepted={handleFilesAccepted}
              onValidationErrors={handleValidationErrors}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {(phase === "options" || phase === "processing") && files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {taggedFiles.map(({ file, id }, index) => (
              <FileQueueItem
                key={id}
                index={index}
                entry={{ id, name: file.name, size: file.size, type: file.type, progress: 0 }}
                isProcessing={phase === "processing"}
                onRemove={phase === "options" ? () => handleRemoveFile(id) : undefined}
              />
            ))}
          </div>

          {phase === "options" && adapter.multiple && (
            <AddMoreFilesButton
              accepts={adapter.accepts}
              multiple={adapter.multiple}
              maxSizeBytes={adapter.maxSizeBytes}
              onFilesAccepted={(more) => setFiles((prev) => [...prev, ...more])}
              onValidationErrors={handleValidationErrors}
            />
          )}

          {phase === "options" && adapter.OptionsPanel && (
            <adapter.OptionsPanel files={files} options={options} setOptions={setOptions} />
          )}

          {phase === "processing" && <ProcessingPanel stage={stage} overallProgress={overallProgress} />}

          {phase === "options" && (
            <Button variant="accent" size="lg" onClick={handleRun} className="w-full">
              {adapter.runButtonLabel || `${toolName} now`}
            </Button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "completed" && (
          <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ResultPanel
              completedFiles={results.map((r, i) => ({ id: i, resultBlob: r.blob, resultName: r.name }))}
              onReset={handleReset}
              onDownloadAllZip={results.length > 1 ? handleDownloadAllZip : undefined}
              title={`${toolName} complete`}
            />
          </motion.div>
        )}
        {phase === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ErrorPanel message={errorMessage} onRetry={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
