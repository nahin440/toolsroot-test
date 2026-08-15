import { mergeVideos } from "@/lib/engines/media/media-core";
import { MergeVideosOptionsPanel } from "./options-panel";

export const mergeVideosAdapter = {
  accepts: ["video/*"],
  multiple: true,
  minFiles: 2,
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: MergeVideosOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Merge videos now",
  async run(files, options, onProgress) {
    const order = options.order || files.map((_, i) => i);
    const orderedFiles = order.map((i) => files[i]);
    onProgress({ stage: "Merging videos", value: 0 });
    const blob = await mergeVideos(orderedFiles, (p) =>
      onProgress({ stage: "Merging videos", value: p })
    );
    return [{ blob, name: "merged." + (orderedFiles[0].name.split(".").pop() || "mp4") }];
  },
};
