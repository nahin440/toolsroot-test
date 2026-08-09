import { rotateVideo } from "@/lib/engines/media/media-core";
import { RotateVideoOptionsPanel } from "./options-panel";

export const rotateVideoAdapter = {
  accepts: ["video/*"],
  multiple: false,
  // 1GB — ffmpeg.wasm runs entirely in-browser (no server), so this is
  // sized well above the app-wide 200MB default specifically for video,
  // which is the one file category large enough to need it; still well
  // under what a typical modern browser tab can hold in memory for a
  // single WASM operation.
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: RotateVideoOptionsPanel,
  defaultOptions: { degreesVal: 90 },
  runButtonLabel: "Rotate now",
  async run(files, options, onProgress) {
    const blob = await rotateVideo(files[0], options.degreesVal || 90, (p) =>
      onProgress({ stage: "Rotating video", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-rotated.$1") }];
  },
};
