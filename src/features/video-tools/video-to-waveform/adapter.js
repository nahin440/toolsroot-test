import { videoToWaveform } from "@/lib/engines/media/media-core";
import { VideoToWaveformOptionsPanel } from "./options-panel";

export const videoToWaveformAdapter = {
  accepts: ["video/*"],
  multiple: false,
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: VideoToWaveformOptionsPanel,
  defaultOptions: { color: "#4f46e5" },
  runButtonLabel: "Generate waveform image",
  async run(files, options, onProgress) {
    const blob = await videoToWaveform(files[0], options, (p) =>
      onProgress({ stage: "Rendering waveform", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "-waveform.png" }];
  },
};
