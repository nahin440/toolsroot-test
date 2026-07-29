import { cropImage } from "@/lib/engines/image/image-core";
import { CropImageOptionsPanel } from "./options-panel";

export const cropImageAdapter = {
  accepts: ["image/*"],
  multiple: false,
  OptionsPanel: CropImageOptionsPanel,
  defaultOptions: { aspectKey: "free" },
  runButtonLabel: "Crop now",
  async run(files, options, onProgress) {
    if (!options.cropBox) {
      throw new Error("Adjust the crop area before continuing.");
    }
    onProgress({ stage: "Cropping image", value: 0.4 });
    const blob = await cropImage(files[0], options.cropBox);
    onProgress({ stage: "Cropping image", value: 1 });
    return [{ blob, name: files[0].name }];
  },
};
