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

// Tool slugs whose adapter.run ultimately downloads a large (~31MB
// ffmpeg, or per-language tesseract) WASM engine on first use this
// session — see the grep-verified list in the comment on
// preloadEngineIfNeeded below. Used only to decide whether to show a
// "Loading engine…" message before the adapter's own onProgress callback
// starts firing; every other tool's flow is completely unaffected.
const MEDIA_ENGINE_TOOL_SLUGS = new Set([
  // ffmpeg-based (src/features/video-tools/*, some of src/features/audio-tools/*)
  "mov-to-mp4",
  "rotate-video",
  "merge-videos",
  "add-subtitles",
  "video-to-waveform",
  "extract-video-frame",
  "video-speed-changer",
  "change-video-fps",
  "avi-to-mp4",
  "compress-video",
  "convert-video",
  "crop-video",
  "mkv-to-mp4",
  "resize-video",
  "watermark-video",
  "trim-video",
  "mp4-to-gif",
  "extract-audio-from-video",
  "wav-to-mp3",
  "normalize-audio",
  "mp4-to-mp3",
  "mp3-to-wav",
  "convert-audio",
  "trim-audio",
  "merge-audio",
  "split-audio",
  "mov-to-mp3",
  "audio-speed-changer",
  "audio-pitch-changer",
  "audio-volume-changer",
  "reverse-audio",
  "audio-fade",
  // tesseract-based (src/features/pdf-tools/ocr-pdf)
  "ocr-pdf",
  // onnxruntime-web-based (src/features/image-tools/image-upscaler)
  "image-upscaler",
]);

/**
 * If toolSlug is one of the tools above, kicks off that tool's WASM
 * engine download and reports progress through onLoadProgress — called
 * right before adapter.run, so the person sees an accurate, specific
 * loading message with real download percentage (returned as
 * `engineLabel`) instead of the adapter's own fixed stage label
 * ("Compressing video", etc.) claiming real work is happening during
 * what is actually still a one-time download. Resolves
 * `{ engineLabel: null }` immediately for every other tool, and
 * immediately with no progress callbacks fired for a media-engine tool
 * on the 2nd+ tool run of a session (the underlying engine's own
 * singleton is already warm — see getFFmpeg in ffmpeg-loader.js).
 *
 * Uses a dynamic import specifically so this stays true for every OTHER
 * tool's bundle too: media-core.js pulls in @ffmpeg/util, and
 * ffmpeg-loader.js pulls in the real @ffmpeg/ffmpeg package, so a static
 * top-level import here would add both to this shared shell's bundle —
 * meaning every tool page on the site, not just the 22 ffmpeg-based
 * ones, would pay for ffmpeg's loader code. The adapter-registry.js
 * comment this codebase already has documents exactly this same
 * "dynamic import to preserve per-tool code-splitting" rationale for the
 * adapters themselves; this follows the same rule for the engine layer.
 */
async function preloadEngineIfNeeded(toolSlug, onLoadProgress) {
  if (!MEDIA_ENGINE_TOOL_SLUGS.has(toolSlug)) return { engineLabel: null };

  if (toolSlug === "ocr-pdf") {
    const { preloadOcrEngine } = await import("@/lib/engines/ocr/ocr-engine");
    await preloadOcrEngine(onLoadProgress);
    return { engineLabel: "Loading OCR engine…" };
  }
  if (toolSlug === "image-upscaler") {
    const { preloadUpscalerEngine } = await import("@/lib/engines/image/image-upscaler");
    await preloadUpscalerEngine(onLoadProgress);
    return { engineLabel: "Loading upscaling engine…" };
  }
  const { preloadFFmpegEngine } = await import("@/lib/engines/media/media-core");
  await preloadFFmpegEngine(onLoadProgress);
  return { engineLabel: "Loading video engine…" };
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

/** @param {{adapter: ToolAdapter, toolName: string, toolSlug: string}} props */
export function ToolPageShell({ adapter, toolName, toolSlug }) {
  const [files, setFiles] = useState([]);
  const [phase, setPhase] = useState("upload"); // upload | options | processing | completed | error
  const [options, setOptions] = useState(adapter.defaultOptions || {});
  const [stage, setStage] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoadingEngine, setIsLoadingEngine] = useState(false);
  const [engineLoadProgress, setEngineLoadProgress] = useState(null);
  const [engineLabel, setEngineLabel] = useState(null);
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
    setIsLoadingEngine(false);
    setEngineLoadProgress(null);
    setEngineLabel(null);
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
      setIsLoadingEngine(true);
      setEngineLoadProgress(null);
      const { engineLabel: label } = await preloadEngineIfNeeded(toolSlug, (p) => setEngineLoadProgress(p));
      setEngineLabel(label);
      setIsLoadingEngine(false);

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
  }, [adapter, files, options, toolSlug]);

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

          {phase === "processing" && (
            <ProcessingPanel
              stage={stage}
              overallProgress={overallProgress}
              isLoadingEngine={isLoadingEngine}
              engineLoadProgress={engineLoadProgress}
              engineLabel={engineLabel}
            />
          )}

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
