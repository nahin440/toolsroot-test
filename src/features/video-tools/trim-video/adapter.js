import { trimMedia } from "@/lib/engines/media/media-core";
import { TrimVideoOptionsPanel } from "./options-panel";

export const trimVideoAdapter = {
  accepts: ["video/*"],
  multiple: false,
  // 1GB — ffmpeg.wasm runs entirely in-browser (no server), so this is
  // sized well above the app-wide 200MB default specifically for video,
  // which is the one file category large enough to need it; still well
  // under what a typical modern browser tab can hold in memory for a
  // single WASM operation.
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: TrimVideoOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Trim now",
  async run(files, options, onProgress) {
    if (options.endSec === undefined || options.endSec <= (options.startSec ?? 0)) {
      throw new Error("Choose a valid trim range.");
    }
    const blob = await trimMedia(files[0], options.startSec ?? 0, options.endSec, true, (p) =>
      onProgress({ stage: "Trimming video", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-trimmed.$1") }];
  },
};
