import { fadeAudio } from "@/lib/engines/media/media-core";
import { AudioFadeOptionsPanel } from "./options-panel";

/**
 * Reads a file's real duration via the browser's native Audio element —
 * the same decoder the options panel's <audio> preview already uses,
 * just without needing a mounted DOM element for this one-off read.
 */
function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read this audio file's duration."));
    });
    audio.src = url;
  });
}

export const audioFadeAdapter = {
  accepts: ["audio/*"],
  multiple: false,
  OptionsPanel: AudioFadeOptionsPanel,
  defaultOptions: { fadeInSec: 0, fadeOutSec: 0 },
  runButtonLabel: "Apply fade now",
  async run(files, options, onProgress) {
    const fadeInSec = options.fadeInSec ?? 0;
    const fadeOutSec = options.fadeOutSec ?? 0;
    if (fadeInSec <= 0 && fadeOutSec <= 0) {
      throw new Error("Set a fade-in and/or fade-out duration greater than zero.");
    }

    let fadeOutStartSec;
    if (fadeOutSec > 0) {
      const duration = await getAudioDuration(files[0]);
      fadeOutStartSec = Math.max(0, duration - fadeOutSec);
    }

    const blob = await fadeAudio(files[0], { fadeInSec, fadeOutSec, fadeOutStartSec }, (p) =>
      onProgress({ stage: "Applying fade", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-faded.$1") }];
  },
};
