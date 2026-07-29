import { convertImage } from "@/lib/engines/image/image-core";
import { ConvertImageOptionsPanel } from "./options-panel";

function replaceExt(name, ext) {
  return name.replace(/\.[^.]+$/, "") + "." + ext;
}

export const convertImageAdapter = {
  accepts: ["image/*"],
  multiple: true,
  OptionsPanel: ConvertImageOptionsPanel,
  defaultOptions: { targetFormat: "png", quality: 0.9 },
  runButtonLabel: "Convert now",
  zipName: "converted-images",
  async run(files, options, onProgress) {
    const outputs = [];
    for (let i = 0; i < files.length; i++) {
      onProgress({ stage: `Converting ${files[i].name}`, value: i / files.length });
      const blob = await convertImage(files[i], options.targetFormat, options);
      outputs.push({ blob, name: replaceExt(files[i].name, options.targetFormat) });
    }
    onProgress({ stage: "Done", value: 1 });
    return outputs;
  },
};
