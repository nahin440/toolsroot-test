import { reverseAudio } from "@/lib/engines/media/media-core";

export const reverseAudioAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Reverse audio now",
  async run(files, options, onProgress) {
    const blob = await reverseAudio(files[0], (p) => onProgress({ stage: "Reversing audio", value: p }));
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-reversed.$1") }];
  },
};
