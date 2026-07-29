import { rotateFlipImage } from "@/lib/engines/image/image-core";
import { RotateFlipImageOptionsPanel } from "./options-panel";

export const rotateFlipImageAdapter = {
  accepts: ["image/*"],
  multiple: true,
  OptionsPanel: RotateFlipImageOptionsPanel,
  defaultOptions: { rotationDeg: 0, flip: {} },
  runButtonLabel: "Apply now",
  zipName: "rotated-images",
  async run(files, options, onProgress) {
    const outputs = [];
    for (let i = 0; i < files.length; i++) {
      onProgress({ stage: `Processing ${files[i].name}`, value: i / files.length });
      const blob = await rotateFlipImage(files[i], options.rotationDeg || 0, options.flip || {});
      outputs.push({ blob, name: files[i].name });
    }
    onProgress({ stage: "Done", value: 1 });
    return outputs;
  },
};
