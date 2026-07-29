"use client";

/**
 * Shared utilities for reliably resolving embedded image objects from a
 * pdf.js page. Used by every engine that walks a page's operator list
 * looking for images (content-extractor.js, compress-pdf.js).
 *
 * BACKGROUND — a real, confirmed bug this fixes:
 * Reading only `page.getOperatorList()` is not sufficient to reliably
 * resolve every embedded image. Confirmed by direct reproduction against
 * a real multi-page document where an image nested inside a Form XObject
 * never resolved via `page.objs.get()` after `getOperatorList()` alone —
 * the returned promise simply never settled, hanging the entire
 * conversion with no error and no way to recover, because pdf.js only
 * queues certain nested image objects for decode during an actual
 * render pass, not during operator-list construction.
 *
 * The fix has two layers:
 *   1. `ensurePageRendered` — render the page to a throwaway canvas
 *      before touching any image objects. This is what actually
 *      resolves the previously-stuck objects in practice.
 *   2. `resolvePageObject` — even after rendering, wrap resolution in a
 *      timeout so a page that still can't resolve one particular image
 *      skips that one image with a clear error instead of hanging the
 *      whole document forever.
 */

/**
 * Renders a page to a detached, throwaway canvas purely to force pdf.js
 * to fully resolve every image object it references. The rendered
 * pixels themselves are never used or read back — only the side effect
 * of resolution matters. Never throws: a page whose render fails or
 * times out still proceeds using whatever got resolved before the
 * failure, rather than blocking the whole document.
 */
export async function ensurePageRendered(page, timeoutMs = 10000) {
  try {
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    const ctx = canvas.getContext("2d");

    const renderTask = page.render({ canvasContext: ctx, viewport });
    await Promise.race([
      renderTask.promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("render timeout")), timeoutMs)),
    ]).catch(() => {
      try {
        renderTask.cancel();
      } catch {
        // renderTask may already be settled; cancel() throwing here is expected and harmless.
      }
    });

    canvas.width = 0;
    canvas.height = 0;
  } catch {
    // If we can't even construct a canvas/context (should not happen in
    // a real browser), proceed straight to extraction rather than
    // aborting the whole page.
  }
}

/**
 * Resolves one image object from a page's `objs` cache, with a timeout
 * so an unresolvable object rejects cleanly instead of hanging forever.
 * Call `ensurePageRendered(page)` first — this alone is not the fix,
 * just the safety net for whatever it doesn't catch.
 */
export function resolvePageObject(page, objId, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`Image "${objId}" did not resolve within ${timeoutMs}ms — skipping it.`));
      }
    }, timeoutMs);

    try {
      page.objs.get(objId, (obj) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(obj);
        }
      });
    } catch (e) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(e);
      }
    }
  });
}
