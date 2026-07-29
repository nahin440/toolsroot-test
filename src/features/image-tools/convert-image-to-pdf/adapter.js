import { imagesToPdf } from "@/lib/engines/image/image-to-pdf";
import { ImageToPdfOptionsPanel } from "./options-panel";

export const imageToPdfAdapter = {
  accepts: ["image/*"],
  multiple: true,
  minFiles: 1,
  OptionsPanel: ImageToPdfOptionsPanel,
  defaultOptions: { pageSize: "a4", orientation: "portrait" },
  runButtonLabel: "Create PDF now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Building PDF", value: 0.3 });
    const blob = await imagesToPdf(files, options);
    onProgress({ stage: "Building PDF", value: 1 });
    return [{ blob, name: "images.pdf" }];
  },
};
