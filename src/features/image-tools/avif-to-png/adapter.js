import { convertImage } from "@/lib/engines/image/image-core";
import { makeLockedImageFormatPanel } from "@/components/tool-shared/locked-image-format-panel";

const avifToPngOptionsPanel = makeLockedImageFormatPanel("png");

function replaceExt(name, ext) {
  return name.replace(/\.[^.]+$/, "") + "." + ext;
}

export const avifToPngAdapter = {
  accepts: ["image/*"],
  multiple: true,
  OptionsPanel: avifToPngOptionsPanel,
  defaultOptions: { targetFormat: "png" },
  runButtonLabel: "Convert now",
  zipName: "converted-images",
  async run(files, options, onProgress) {
    const outputs = [];
    for (let i = 0; i < files.length; i++) {
      onProgress({ stage: `Converting ${files[i].name}`, value: i / files.length });
      const blob = await convertImage(files[i], "png", options);
      outputs.push({ blob, name: replaceExt(files[i].name, "png") });
    }
    onProgress({ stage: "Done", value: 1 });
    return outputs;
  },
};
