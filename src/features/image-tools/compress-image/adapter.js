import { compressImage } from "@/lib/engines/image/image-core";
import { CompressImageOptionsPanel } from "./options-panel";

export const compressImageAdapter = {
  accepts: ["image/*"],
  multiple: true,
  OptionsPanel: CompressImageOptionsPanel,
  defaultOptions: { quality: 0.75 },
  runButtonLabel: "Compress now",
  zipName: "compressed-images",
  async run(files, options, onProgress) {
    const outputs = [];
    for (let i = 0; i < files.length; i++) {
      onProgress({ stage: `Compressing ${files[i].name}`, value: i / files.length });
      const blob = await compressImage(files[i], options);
      outputs.push({ blob, name: files[i].name });
    }
    onProgress({ stage: "Done", value: 1 });
    return outputs;
  },
};
