import { convertVideo } from "@/lib/engines/media/media-core";
import { ConvertVideoOptionsPanel } from "./options-panel";

export const convertVideoAdapter = {
  accepts: ["video/*"],
  multiple: false,
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
