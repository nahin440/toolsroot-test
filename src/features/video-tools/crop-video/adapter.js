import { cropVideo } from "@/lib/engines/media/media-core";
import { CropVideoOptionsPanel } from "./options-panel";

export const cropVideoAdapter = {
  accepts: ["video/*"],
  multiple: false,
  // 1GB — ffmpeg.wasm runs entirely in-browser (no server), so this is
  // sized well above the app-wide 200MB default specifically for video,
  // which is the one file category large enough to need it; still well
  // under what a typical modern browser tab can hold in memory for a
  // single WASM operation.
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: CropVideoOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Crop now",
  async run(files, options, onProgress) {
    if (!options.cropBox) {
      throw new Error("Adjust the crop area before continuing.");
    }
    const box = {
      x: Math.round(options.cropBox.x),
      y: Math.round(options.cropBox.y),
      width: Math.round(options.cropBox.width),
      height: Math.round(options.cropBox.height),
    };
    const blob = await cropVideo(files[0], box, (p) => onProgress({ stage: "Cropping video", value: p }));
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-cropped.$1") }];
  },
};
