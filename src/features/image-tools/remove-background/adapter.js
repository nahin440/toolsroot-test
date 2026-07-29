import { removeImageBackground } from "@/lib/engines/image/remove-background";

export const removeBackgroundAdapter = {
  accepts: ["image/*"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Remove background now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Loading segmentation model", value: 0 });
    const blob = await removeImageBackground(files[0], (p) =>
      onProgress({ stage: "Analyzing image", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "-no-bg.png" }];
  },
};
