import { convertAudio } from "@/lib/engines/media/media-core";
import { makeLockedMediaFormatPanel } from "@/components/tool-shared/locked-media-format-panel";

const OptionsPanel = makeLockedMediaFormatPanel("mp3");

export const aacToMp3Adapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel,
  defaultOptions: { targetExt: "mp3" },
  runButtonLabel: "Convert now",
  async run(files, options, onProgress) {
    const blob = await convertAudio(files[0], "mp3", (p) => onProgress({ stage: "Converting audio", value: p }));
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + ".mp3" }];
  },
};
