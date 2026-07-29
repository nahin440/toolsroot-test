import { extractAudioFromVideo } from "@/lib/engines/media/media-core";
import { ExtractAudioOptionsPanel } from "./options-panel";

export const extractAudioAdapter = {
  accepts: ["video/*"],
  multiple: false,
  OptionsPanel: ExtractAudioOptionsPanel,
  defaultOptions: { targetExt: "mp3" },
  runButtonLabel: "Extract audio now",
  async run(files, options, onProgress) {
    const blob = await extractAudioFromVideo(files[0], options.targetExt, (p) =>
      onProgress({ stage: "Extracting audio track", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "." + options.targetExt }];
  },
};
