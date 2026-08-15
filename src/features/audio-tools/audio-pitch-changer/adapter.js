import { changeAudioPitch } from "@/lib/engines/media/media-core";
import { AudioPitchChangerOptionsPanel } from "./options-panel";

export const audioPitchChangerAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel: AudioPitchChangerOptionsPanel,
  defaultOptions: { semitones: 0 },
  runButtonLabel: "Change pitch now",
  async run(files, options, onProgress) {
    const semitones = options.semitones ?? 0;
    if (semitones === 0) throw new Error("Choose a pitch shift other than 0 to apply a change.");
    const blob = await changeAudioPitch(files[0], semitones, (p) =>
      onProgress({ stage: "Changing pitch", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-pitch.$1") }];
  },
};
