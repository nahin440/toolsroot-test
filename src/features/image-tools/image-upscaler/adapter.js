import { upscaleImage } from "@/lib/engines/image/image-upscaler";
import { ImageUpscalerOptionsPanel } from "./options-panel";

export const imageUpscalerAdapter = {
  accepts: ["image/*"],
  multiple: false,
  OptionsPanel: ImageUpscalerOptionsPanel,
  defaultOptions: { scale: 4 },
  runButtonLabel: "Upscale now",
  async run(files, options, onProgress) {
    const blob = await upscaleImage(files[0], options.scale || 4, onProgress);
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + `-upscaled-${options.scale || 4}x.png` }];
  },
};
