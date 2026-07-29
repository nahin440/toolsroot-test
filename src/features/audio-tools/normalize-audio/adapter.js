import { normalizeAudio } from "@/lib/engines/media/media-core";
import { NormalizeAudioOptionsPanel } from "./options-panel";

export const normalizeAudioAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel: NormalizeAudioOptionsPanel,
  defaultOptions: { targetLufs: -16 },
  runButtonLabel: "Normalize now",
  async run(files, options, onProgress) {
    const blob = await normalizeAudio(files[0], options.targetLufs ?? -16, (p) =>
      onProgress({ stage: "Normalizing loudness", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-normalized.$1") }];
  },
};
