import { compressVideo } from "@/lib/engines/media/media-core";
import { CompressVideoOptionsPanel } from "./options-panel";

export const compressVideoAdapter = {
  accepts: ["video/*"],
  multiple: false,
  // 1GB — ffmpeg.wasm runs entirely in-browser (no server), so this is
  // sized well above the app-wide 200MB default specifically for video,
  // which is the one file category large enough to need it; still well
  // under what a typical modern browser tab can hold in memory for a
  // single WASM operation.
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: CompressVideoOptionsPanel,
  defaultOptions: { level: "medium" },
  runButtonLabel: "Compress now",
  async run(files, options, onProgress) {
    const blob = await compressVideo(files[0], options.level, (p) =>
      onProgress({ stage: "Compressing video", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-compressed.$1") }];
  },
};
