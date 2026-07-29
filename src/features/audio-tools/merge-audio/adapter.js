import { mergeAudio } from "@/lib/engines/media/media-core";
import { MergeAudioOptionsPanel } from "./options-panel";

export const mergeAudioAdapter = {
  accepts: ["audio/*"],
  multiple: true,
  minFiles: 2,
  OptionsPanel: MergeAudioOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Merge audio now",
  async run(files, options, onProgress) {
    const orderedFiles = options.order ? options.order.map((i) => files[i]) : files;
    const blob = await mergeAudio(orderedFiles, (p) => onProgress({ stage: "Merging audio files", value: p }));
    const ext = orderedFiles[0].name.split(".").pop();
    return [{ blob, name: `merged.${ext}` }];
  },
};
