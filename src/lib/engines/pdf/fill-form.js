"use client";

import { PDFDocument } from "@cantoo/pdf-lib";

/** Returns a description of every fillable field in the PDF's AcroForm, or an empty array if it has none. */
export async function detectFormFields(file) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();
  const fields = form.getFields();

  return fields.map((field) => {
    const name = field.getName();
    const type = field.constructor.name;
    let options = null;
    if (type === "PDFDropdown" || type === "PDFRadioGroup" || type === "PDFOptionList") {
      options = field.getOptions?.() || [];
    }
    return { name, type, options };
  });
}

/**
 * @param {File} file
 * @param {Record<string, string|boolean>} values - field name -> value
 * @param {boolean} flatten - if true, form becomes non-editable (values baked into page content)
 */
export async function fillPdfForm(file, values, flatten = false) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();

  for (const [name, value] of Object.entries(values)) {
    try {
      const field = form.getField(name);
      if (!field) continue;
      const type = field.constructor.name;

      if (type === "PDFTextField") {
        field.setText(String(value ?? ""));
      } else if (type === "PDFCheckBox") {
        if (value) field.check();
        else field.uncheck();
      } else if (type === "PDFDropdown") {
        field.select(String(value));
      } else if (type === "PDFRadioGroup") {
        field.select(String(value));
      }
    } catch {
      // A single field that fails to set (e.g. an invalid dropdown
      // option) is skipped rather than aborting the whole fill.
    }
  }

  if (flatten) form.flatten();

  const outBytes = await doc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}
