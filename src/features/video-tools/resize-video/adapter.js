import { resizeVideo } from "@/lib/engines/media/media-core";
import { ResizeVideoOptionsPanel } from "./options-panel";

export const resizeVideoAdapter = {
  accepts: ["video/*"],
  multiple: false,
  OptionsPanel: ResizeVideoOptionsPanel,
  defaultOptions: { preset: "1920x-1" },
  runButtonLabel: "Resize now",
  async run(files, options, onProgress) {
    let width;
    let height;
    if (options.preset === "custom") {
      width = options.width || -1;
      height = options.height || -1;
    } else {
      [width, height] = (options.preset || "1920x-1").split("x").map(Number);
    }
    const blob = await resizeVideo(files[0], width, height, (p) =>
      onProgress({ stage: "Resizing video", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-resized.$1") }];
  },
};
