import { trimMedia } from "@/lib/engines/media/media-core";
import { TrimAudioOptionsPanel } from "./options-panel";

export const trimAudioAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel: TrimAudioOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Trim now",
  async run(files, options, onProgress) {
    if (options.endSec === undefined || options.endSec <= (options.startSec ?? 0)) {
      throw new Error("Choose a valid trim range.");
    }
    const blob = await trimMedia(files[0], options.startSec ?? 0, options.endSec, false, (p) =>
      onProgress({ stage: "Trimming audio", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-trimmed.$1") }];
  },
};
