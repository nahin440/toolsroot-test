import { convertImage } from "@/lib/engines/image/image-core";
import { makeLockedImageFormatPanel } from "@/components/tool-shared/locked-image-format-panel";

const pngToJpgOptionsPanel = makeLockedImageFormatPanel("jpg");

function replaceExt(name, ext) {
  return name.replace(/\.[^.]+$/, "") + "." + ext;
}

export const pngToJpgAdapter = {
  accepts: ["image/*"],
  multiple: true,
  OptionsPanel: pngToJpgOptionsPanel,
  defaultOptions: { targetFormat: "jpg", quality: 0.9 },
  runButtonLabel: "Convert now",
  zipName: "converted-images",
  async run(files, options, onProgress) {
    const outputs = [];
    for (let i = 0; i < files.length; i++) {
      onProgress({ stage: `Converting ${files[i].name}`, value: i / files.length });
      const blob = await convertImage(files[i], "jpg", options);
      outputs.push({ blob, name: replaceExt(files[i].name, "jpg") });
    }
    onProgress({ stage: "Done", value: 1 });
    return outputs;
  },
};
