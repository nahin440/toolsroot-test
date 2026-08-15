import { splitArchiveIntoParts } from "@/lib/engines/archive/archive-core";
import { SplitArchiveOptionsPanel } from "./options-panel";

export const splitArchiveAdapter = {
  accepts: ["*"],
  multiple: true,
  minFiles: 1,
  OptionsPanel: SplitArchiveOptionsPanel,
  defaultOptions: { maxPartSizeBytes: 50 * 1024 * 1024 },
  runButtonLabel: "Split into parts",
  zipName: "split-archive-parts",
  async run(files, options, onProgress) {
    onProgress({ stage: "Splitting archive", value: 0 });
    const outputs = await splitArchiveIntoParts(files, options.maxPartSizeBytes || 50 * 1024 * 1024, (p) =>
      onProgress({ stage: "Splitting archive", value: p })
    );
    return outputs;
  },
};
