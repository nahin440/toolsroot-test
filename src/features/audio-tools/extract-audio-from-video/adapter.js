import { extractAudioFromVideo } from "@/lib/engines/media/media-core";
import { ExtractAudioOptionsPanel } from "./options-panel";

export const extractAudioAdapter = {
  accepts: ["video/*"],
  multiple: false,
  // Source is a video file even though the output is audio, so this
  // needs the same video-sized ceiling as the video-tools adapters
  // (see that category's adapters for the full rationale).
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: ExtractAudioOptionsPanel,
  defaultOptions: { targetExt: "mp3" },
  runButtonLabel: "Extract audio now",
  async run(files, options, onProgress) {
    const blob = await extractAudioFromVideo(files[0], options.targetExt, (p) =>
      onProgress({ stage: "Extracting audio track", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "." + options.targetExt }];
  },
};
