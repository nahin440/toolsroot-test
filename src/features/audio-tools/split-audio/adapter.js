import { splitAudio } from "@/lib/engines/media/media-core";
import { SplitAudioOptionsPanel } from "./options-panel";

export const splitAudioAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel: SplitAudioOptionsPanel,
  defaultOptions: { timestamps: [] },
  runButtonLabel: "Split now",
  zipName: "split-audio",
  async run(files, options, onProgress) {
    if (!options.timestamps?.length) {
      throw new Error("Add at least one split point.");
    }
    const outputs = await splitAudio(files[0], options.timestamps, (p) =>
      onProgress({ stage: "Splitting audio", value: p })
    );
    return outputs;
  },
};
