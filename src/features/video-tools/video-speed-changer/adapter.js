import { changeVideoSpeed } from "@/lib/engines/media/media-core";
import { VideoSpeedChangerOptionsPanel } from "./options-panel";

export const videoSpeedChangerAdapter = {
  accepts: ["video/*"],
  multiple: false,
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: VideoSpeedChangerOptionsPanel,
  defaultOptions: { speedFactor: 1 },
  runButtonLabel: "Change speed now",
  async run(files, options, onProgress) {
    const speed = options.speedFactor ?? 1;
    if (speed === 1) throw new Error("Choose a speed other than 1× to apply a change.");
    const blob = await changeVideoSpeed(files[0], speed, (p) =>
      onProgress({ stage: "Changing speed", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-speed.$1") }];
  },
};
