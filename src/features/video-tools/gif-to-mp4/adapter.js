import { convertVideo } from "@/lib/engines/media/media-core";
import { makeLockedMediaFormatPanel } from "@/components/tool-shared/locked-media-format-panel";

const OptionsPanel = makeLockedMediaFormatPanel(
  "mp4",
  "The resulting MP4 will likely be much smaller than the original GIF, since video codecs compress far more efficiently than GIF's format."
);

export const gifToMp4Adapter = {
  accepts: ["image/gif", ".gif"],
  multiple: false,
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel,
  defaultOptions: { targetExt: "mp4" },
  runButtonLabel: "Convert now",
  async run(files, options, onProgress) {
    const blob = await convertVideo(files[0], "mp4", (p) => onProgress({ stage: "Converting video", value: p }));
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + ".mp4" }];
  },
};
