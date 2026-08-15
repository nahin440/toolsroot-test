import { changeAudioVolume } from "@/lib/engines/media/media-core";
import { AudioVolumeChangerOptionsPanel } from "./options-panel";

export const audioVolumeChangerAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel: AudioVolumeChangerOptionsPanel,
  defaultOptions: { db: 0 },
  runButtonLabel: "Change volume now",
  async run(files, options, onProgress) {
    const db = options.db ?? 0;
    if (db === 0) throw new Error("Choose a volume change other than 0dB to apply a change.");
    const blob = await changeAudioVolume(files[0], db, (p) =>
      onProgress({ stage: "Adjusting volume", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-volume.$1") }];
  },
};
