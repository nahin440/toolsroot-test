import { convertAudio } from "@/lib/engines/media/media-core";
import { makeLockedMediaFormatPanel } from "@/components/tool-shared/locked-media-format-panel";

const OptionsPanel = makeLockedMediaFormatPanel("wav");

export const mp3ToWavAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel,
  defaultOptions: { targetExt: "wav" },
  runButtonLabel: "Convert now",
  async run(files, options, onProgress) {
    const blob = await convertAudio(files[0], "wav", (p) =>
      onProgress({ stage: "Converting audio", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "." + "wav" }];
  },
};
