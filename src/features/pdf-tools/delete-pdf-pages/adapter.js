import { deletePages } from "@/lib/engines/pdf/pdf-core";
import { DeletePdfPagesOptionsPanel } from "./options-panel";

export const deletePdfPagesAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: DeletePdfPagesOptionsPanel,
  defaultOptions: { pagesToDelete: [] },
  runButtonLabel: "Delete pages now",
  async run(files, options, onProgress) {
    if (!options.pagesToDelete?.length) {
      throw new Error("Select at least one page to delete.");
    }
    onProgress({ stage: "Removing pages", value: 0.3 });
    const blob = await deletePages(files[0], options.pagesToDelete);
    onProgress({ stage: "Removing pages", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-edited.pdf") }];
  },
};
