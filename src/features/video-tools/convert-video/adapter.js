import { convertVideo } from "@/lib/engines/media/media-core";
import { ConvertVideoOptionsPanel } from "./options-panel";

export const convertVideoAdapter = {
  accepts: ["video/*"],
  multiple: false,
  // 1GB — ffmpeg.wasm runs entirely in-browser (no server), so this is
  // sized well above the app-wide 200MB default specifically for video,
  // which is the one file category large enough to need it; still well
  // under what a typical modern browser tab can hold in memory for a
  // single WASM operation.
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: ConvertVideoOptionsPanel,
  defaultOptions: { targetExt: "mp4" },
  runButtonLabel: "Convert now",
  async run(files, options, onProgress) {
    const blob = await convertVideo(files[0], options.targetExt, (p) =>
      onProgress({ stage: "Converting video", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "." + options.targetExt }];
  },
};
