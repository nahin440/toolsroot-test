import { extractVideoFrame } from "@/lib/engines/media/media-core";
import { ExtractVideoFrameOptionsPanel } from "./options-panel";

export const extractVideoFrameAdapter = {
  accepts: ["video/*"],
  multiple: false,
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: ExtractVideoFrameOptionsPanel,
  defaultOptions: { timestampSec: 0 },
  runButtonLabel: "Extract frame",
  async run(files, options, onProgress) {
    const blob = await extractVideoFrame(files[0], options.timestampSec ?? 0, (p) =>
      onProgress({ stage: "Extracting frame", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "-frame.png" }];
  },
};
