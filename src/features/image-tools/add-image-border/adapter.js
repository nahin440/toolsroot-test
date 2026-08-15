import { addImageBorder } from "@/lib/engines/image/image-core";
import { AddImageBorderOptionsPanel } from "./options-panel";

export const addImageBorderAdapter = {
  accepts: ["image/*"],
  multiple: true,
  OptionsPanel: AddImageBorderOptionsPanel,
  defaultOptions: { widthPercent: 4, color: "#ffffff", style: "solid" },
  runButtonLabel: "Add border now",
  zipName: "bordered-images",
  async run(files, options, onProgress) {
    const outputs = [];
    for (let i = 0; i < files.length; i++) {
      onProgress({ stage: "Adding border", value: i / files.length });
      const blob = await addImageBorder(files[i], options);
      outputs.push({ blob, name: files[i].name.replace(/(\.[^.]+)$/, "-bordered$1") });
    }
    onProgress({ stage: "Adding border", value: 1 });
    return outputs;
  },
};
