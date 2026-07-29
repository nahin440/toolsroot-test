import { resizeImage } from "@/lib/engines/image/image-core";
import { ResizeImageOptionsPanel } from "./options-panel";

export const resizeImageAdapter = {
  accepts: ["image/*"],
  multiple: true,
  OptionsPanel: ResizeImageOptionsPanel,
  defaultOptions: { mode: "exact", maintainAspectRatio: true, percentage: 100 },
  runButtonLabel: "Resize now",
  zipName: "resized-images",
  async run(files, options, onProgress) {
    const outputs = [];
    for (let i = 0; i < files.length; i++) {
      onProgress({ stage: `Resizing ${files[i].name}`, value: i / files.length });
      const blob = await resizeImage(files[i], options);
      outputs.push({ blob, name: files[i].name });
    }
    onProgress({ stage: "Done", value: 1 });
    return outputs;
  },
};
