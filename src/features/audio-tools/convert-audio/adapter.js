import { convertAudio } from "@/lib/engines/media/media-core";
import { ConvertAudioOptionsPanel } from "./options-panel";

export const convertAudioAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel: ConvertAudioOptionsPanel,
  defaultOptions: { targetExt: "mp3" },
  runButtonLabel: "Convert now",
  async run(files, options, onProgress) {
    const blob = await convertAudio(files[0], options.targetExt, (p) =>
      onProgress({ stage: "Converting audio", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "." + options.targetExt }];
  },
};
