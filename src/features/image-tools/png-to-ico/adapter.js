import { convertImage } from "@/lib/engines/image/image-core";
import { makeLockedImageFormatPanel } from "@/components/tool-shared/locked-image-format-panel";

const pngToIcoOptionsPanel = makeLockedImageFormatPanel("ico");

function replaceExt(name, ext) {
  return name.replace(/\.[^.]+$/, "") + "." + ext;
}

export const pngToIcoAdapter = {
  accepts: ["image/*"],
  multiple: true,
  OptionsPanel: pngToIcoOptionsPanel,
  defaultOptions: { targetFormat: "ico" },
  runButtonLabel: "Convert now",
  zipName: "converted-icons",
  async run(files, options, onProgress) {
    const outputs = [];
    for (let i = 0; i < files.length; i++) {
      onProgress({ stage: `Converting ${files[i].name}`, value: i / files.length });
      const blob = await convertImage(files[i], "ico", options);
      outputs.push({ blob, name: replaceExt(files[i].name, "ico") });
    }
    onProgress({ stage: "Done", value: 1 });
    return outputs;
  },
};
