import { rearrangePages } from "@/lib/engines/pdf/pdf-core";
import { RearrangePdfPagesOptionsPanel } from "./options-panel";

export const rearrangePdfPagesAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: RearrangePdfPagesOptionsPanel,
  defaultOptions: { newOrder: [] },
  runButtonLabel: "Save new order",
  async run(files, options, onProgress) {
    if (!options.newOrder?.length) {
      throw new Error("At least one page must remain in the document.");
    }
    onProgress({ stage: "Rebuilding PDF in new order", value: 0.3 });
    const blob = await rearrangePages(files[0], options.newOrder);
    onProgress({ stage: "Rebuilding PDF in new order", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-rearranged.pdf") }];
  },
};
