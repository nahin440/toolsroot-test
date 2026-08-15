"use client";

/**
 * Merges multiple Word (.docx) documents into one, in upload order, with
 * a page break between each source document. Reuses readDocxContentModel
 * (the real .docx structural reader Word to PDF and Word to Excel are
 * both built on) to read each file, then reuses buildStyledDocx (the
 * real docx-writing engine PDF to Word is built on, including its
 * correct multi-script font handling) to write the merged result — not
 * a separate, simpler writer that would lose that font-handling
 * correctness for the merged output.
 *
 * buildStyledDocx expects a PDF-shaped {pages: [{blocks, widthPt}]}
 * content model, since it's shared with the PDF -> Word path. A Word
 * document doesn't have that same fixed-page concept (text reflows
 * continuously), so each SOURCE DOCUMENT is treated as one "page" here
 * purely for page-break placement — this maps to what merging Word docs
 * actually means to a person doing it: each original document's content
 * flows together, with a natural break introduced before the next one
 * starts, not real per-page pagination carried over from the source.
 */
import { readDocxContentModel } from "../docx/read-docx";
import { buildStyledDocx } from "../pdf/build-docx";

/**
 * @param {File[]} files
 * @param {(progress:number)=>void} [onProgress]
 * @returns {Promise<Blob>}
 */
export async function mergeWordDocuments(files, onProgress) {
  const models = [];
  for (let i = 0; i < files.length; i++) {
    const model = await readDocxContentModel(files[i]);
    models.push(model);
    onProgress?.((i / files.length) * 0.7);
  }

  // First document's own page dimensions set the merged document's
  // overall page size — matching how mergePdfs in pdf-core.js treats
  // the first file's properties as the baseline for the combined output.
  const pageWidthPt = models[0]?.pageWidthPt || 612;

  const contentModel = {
    pages: models.map((model) => ({
      blocks: model.blocks,
      widthPt: model.pageWidthPt || pageWidthPt,
    })),
  };

  const blob = await buildStyledDocx(contentModel);
  onProgress?.(1);
  return blob;
}
