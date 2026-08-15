import { changeAudioSpeed } from "@/lib/engines/media/media-core";
import { AudioSpeedChangerOptionsPanel } from "./options-panel";

export const audioSpeedChangerAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel: AudioSpeedChangerOptionsPanel,
  defaultOptions: { speedFactor: 1 },
  runButtonLabel: "Change speed now",
  async run(files, options, onProgress) {
    const speed = options.speedFactor ?? 1;
    if (speed === 1) throw new Error("Choose a speed other than 1× to apply a change.");
    const blob = await changeAudioSpeed(files[0], speed, (p) =>
      onProgress({ stage: "Changing speed", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-speed.$1") }];
  },
};
