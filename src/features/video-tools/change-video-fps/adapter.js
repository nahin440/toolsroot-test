import { changeVideoFps } from "@/lib/engines/media/media-core";
import { ChangeVideoFpsOptionsPanel } from "./options-panel";

export const changeVideoFpsAdapter = {
  accepts: ["video/*"],
  multiple: false,
  // 1GB — ffmpeg.wasm runs entirely in-browser (no server), so this is
  // sized well above the app-wide 200MB default specifically for video,
  // which is the one file category large enough to need it; still well
  // under what a typical modern browser tab can hold in memory for a
  // single WASM operation.
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: ChangeVideoFpsOptionsPanel,
  defaultOptions: { targetFps: 30 },
  runButtonLabel: "Apply now",
  async run(files, options, onProgress) {
    const blob = await changeVideoFps(files[0], options.targetFps || 30, (p) =>
      onProgress({ stage: "Changing frame rate", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-fps.$1") }];
  },
};
