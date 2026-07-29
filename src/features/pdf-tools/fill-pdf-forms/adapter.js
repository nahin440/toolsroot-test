import { fillPdfForm } from "@/lib/engines/pdf/fill-form";
import { FillPdfFormsOptionsPanel } from "./options-panel";

export const fillPdfFormsAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: FillPdfFormsOptionsPanel,
  defaultOptions: { values: {}, flatten: false },
  runButtonLabel: "Save filled PDF",
  async run(files, options, onProgress) {
    onProgress({ stage: "Filling form fields", value: 0.4 });
    const blob = await fillPdfForm(files[0], options.values || {}, options.flatten);
    onProgress({ stage: "Filling form fields", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-filled.pdf") }];
  },
};
