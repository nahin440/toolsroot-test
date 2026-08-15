import { convertAudio } from "@/lib/engines/media/media-core";
import { makeLockedMediaFormatPanel } from "@/components/tool-shared/locked-media-format-panel";

const OptionsPanel = makeLockedMediaFormatPanel("ogg");

export const mp3ToOggAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel,
  defaultOptions: { targetExt: "ogg" },
  runButtonLabel: "Convert now",
  async run(files, options, onProgress) {
    const blob = await convertAudio(files[0], "ogg", (p) => onProgress({ stage: "Converting audio", value: p }));
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + ".ogg" }];
  },
};
