import { extractAudioFromVideo } from "@/lib/engines/media/media-core";
import { makeLockedMediaFormatPanel } from "@/components/tool-shared/locked-media-format-panel";

const OptionsPanel = makeLockedMediaFormatPanel("mp3");

export const mp4ToMp3Adapter = {
  accepts: ["video/*"],
  multiple: false,
  OptionsPanel,
  defaultOptions: { targetExt: "mp3" },
  runButtonLabel: "Extract audio now",
  async run(files, options, onProgress) {
    const blob = await extractAudioFromVideo(files[0], "mp3", (p) =>
      onProgress({ stage: "Extracting audio track", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "." + "mp3" }];
  },
};
