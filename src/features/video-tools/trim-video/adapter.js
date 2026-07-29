import { trimMedia } from "@/lib/engines/media/media-core";
import { TrimVideoOptionsPanel } from "./options-panel";

export const trimVideoAdapter = {
  accepts: ["video/*"],
  multiple: false,
  OptionsPanel: TrimVideoOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Trim now",
  async run(files, options, onProgress) {
    if (options.endSec === undefined || options.endSec <= (options.startSec ?? 0)) {
      throw new Error("Choose a valid trim range.");
    }
    const blob = await trimMedia(files[0], options.startSec ?? 0, options.endSec, true, (p) =>
      onProgress({ stage: "Trimming video", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-trimmed.$1") }];
  },
};
