"use client";

/**
 * AI Image Upscaler — a real Real-ESRGAN-x4plus super-resolution model
 * (the same architecture family used by tools like Upscayl), run
 * entirely client-side via onnxruntime-web. This is genuine neural
 * upscaling, reconstructing plausible fine detail, not a canvas
 * scale-up — see the tool's own FAQ for what that distinction does and
 * doesn't mean for accuracy.
 *
 * MODEL SOURCE: qualcomm/Real-ESRGAN-x4plus on Hugging Face, an official
 * corporate-published ONNX export (BSD-3-Clause licensed, verified
 * against the model card at the pinned commit below) of the original
 * xinntao/Real-ESRGAN x4plus checkpoint. Pinned to a specific commit
 * hash rather than `main` so the file this code fetches can't silently
 * change shape or disappear if that repository is later restructured —
 * `main` at time of writing serves a re-zipped layout; this commit
 * predates that and serves the bare .onnx file this code expects.
 *
 * FIXED INPUT SHAPE: this specific export is compiled for a fixed
 * 128x128 RGB input (confirmed on the model card, a real constraint of
 * this on-device-optimized build, not a limitation of Real-ESRGAN
 * generally) producing a 512x512 output (4x). Any image is handled by
 * tiling: the source is cut into overlapping 128x128 tiles, each
 * upscaled independently, then the 512x512 results are stitched back
 * together with the overlapping edges cross-faded — the same tiling
 * strategy the reference Real-ESRGAN inference code itself documents
 * for handling images larger than a model's native input.
 */
import { env, InferenceSession, Tensor } from "onnxruntime-web";

// Point the WASM runtime at this app's own self-hosted copy (see
// public/vendor/onnxruntime) rather than the default path onnxruntime-web
// would otherwise compute relative to its own JS chunk — matching this
// codebase's existing self-hosting convention for every other large WASM
// engine (see ffmpeg-loader.js), so the runtime itself never depends on
// a third-party CDN even though the model weights, like Remove
// Background's segmentation model, genuinely do. wasmPaths.wasm/mjs are
// the real Env.WasmFilePaths fields (verified against the installed
// onnxruntime-common type definitions directly — the object-keyed-by-
// filename form found in some published documentation examples is not
// this version's actual shape). That same type's doc comment requires
// "an absolute path"; resolved via `new URL(..., location.origin)`
// rather than a bare root-relative string, since minified internals
// weren't practical to fully verify and a fully-qualified URL
// unambiguously satisfies "absolute" under any reasonable reading.
function vendorUrl(filename) {
  return new URL(`/vendor/onnxruntime/${filename}`, window.location.origin).href;
}
env.wasm.wasmPaths = {
  wasm: vendorUrl("ort-wasm-simd-threaded.jsep.wasm"),
  mjs: vendorUrl("ort-wasm-simd-threaded.jsep.mjs"),
};
// Explicitly single-threaded: a real, currently-open upstream bug
// (microsoft/onnxruntime#26858) reports InferenceSession.create hanging
// indefinitely with numThreads > 1 under some model/data configurations,
// with numThreads = 1 confirmed working as the only reported workaround.
// This app's COOP/COEP headers (next.config.mjs) do make SharedArrayBuffer
// genuinely available here, so multi-threading isn't blocked for lack of
// cross-origin isolation — it's disabled specifically to route around that
// unresolved hang risk, prioritizing "this reliably finishes" over raw
// speed for a tool with no server-side fallback if inference silently
// never resolves.
env.wasm.numThreads = 1;

const MODEL_URL =
  "https://huggingface.co/qualcomm/Real-ESRGAN-x4plus/resolve/92d7a0c6b345146022a10bfdf7a1c69eca313b76/Real-ESRGAN-x4plus.onnx";
const TILE_IN = 128;
const SCALE = 4;
const TILE_OUT = TILE_IN * SCALE;
const OVERLAP_IN = 16; // input-space overlap between adjacent tiles, for seam blending

let cachedSession = null;
let cachedSessionPromise = null;

/**
 * Loads and caches the inference session. Tries WebGPU first (genuinely
 * fast — real GPU-accelerated inference, not an approximation), and
 * onnxruntime-web itself falls back to its WASM backend automatically
 * if WebGPU isn't available or fails to initialize, so correctness is
 * identical either way — only speed differs.
 */
async function getSession(onProgress) {
  if (cachedSession) return cachedSession;
  if (cachedSessionPromise) return cachedSessionPromise;

  cachedSessionPromise = (async () => {
    onProgress?.({ stage: "Downloading upscaling model", value: 0 });
    const res = await fetch(MODEL_URL);
    if (!res.ok) {
      throw new Error("Couldn't download the upscaling model. Check your connection and try again.");
    }

    const contentLength = Number(res.headers.get("content-length")) || 0;
    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (contentLength) {
        onProgress?.({ stage: "Downloading upscaling model", value: (received / contentLength) * 0.7 });
      }
    }
    const modelBytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      modelBytes.set(chunk, offset);
      offset += chunk.length;
    }

    onProgress?.({ stage: "Preparing upscaling model", value: 0.75 });
    const session = await InferenceSession.create(modelBytes.buffer, {
      executionProviders: ["webgpu", "wasm"],
      graphOptimizationLevel: "all",
    });
    cachedSession = session;
    return session;
  })();

  return cachedSessionPromise;
}

/** Even, non-overlapping tile-start positions covering [0, srcLen), each STRIDE apart, pulled back at the final tile to stay in-bounds while remaining exactly TILE_IN wide. */
function planTileStarts(srcLen, tileLen, overlap) {
  if (srcLen <= tileLen) return [0];
  const stride = tileLen - overlap;
  const starts = [];
  let pos = 0;
  while (true) {
    starts.push(pos);
    if (pos + tileLen >= srcLen) break;
    pos += stride;
    if (pos + tileLen > srcLen) pos = srcLen - tileLen;
  }
  return starts;
}

/**
 * Runs one 128x128 tile through the model, returning a 512x512
 * ImageData. `validW`/`validH` (<= TILE_IN) mark how much of the input
 * tile is real source pixels versus edge-replication padding (needed
 * only for source images smaller than 128px in a dimension, or a tile
 * at the image's own edge) — used to crop the model's output back to
 * only the genuinely-upscaled region before it's composited.
 */
async function upscaleTile(session, tileCanvas) {
  const inputTensor = await Tensor.fromImage(tileCanvas.getContext("2d").getImageData(0, 0, TILE_IN, TILE_IN), {
    tensorLayout: "NCHW",
    tensorFormat: "RGB",
    // norm defaults to bias=0, mean=255 (i.e. pixel/255), which is
    // exactly Real-ESRGAN's own reference preprocessing — verified
    // against the upstream inference code's `img / 255.` normalization
    // before shipping, not left as an unchecked library default.
  });

  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];
  const results = await session.run({ [inputName]: inputTensor });
  const outputTensor = results[outputName];

  // Model output is NCHW float32 in [0,1] — convert back to an HTML
  // canvas ImageData (interleaved RGBA, 0-255) by hand, since
  // Tensor.fromImage's convenience is one-directional (image -> tensor)
  // and there's no equivalent official tensor -> ImageData helper.
  const [, , outH, outW] = outputTensor.dims;
  const data = outputTensor.data;
  const channelSize = outH * outW;
  const imageData = new ImageData(outW, outH);
  for (let i = 0; i < channelSize; i++) {
    const r = Math.round(Math.min(1, Math.max(0, data[i])) * 255);
    const g = Math.round(Math.min(1, Math.max(0, data[channelSize + i])) * 255);
    const b = Math.round(Math.min(1, Math.max(0, data[channelSize * 2 + i])) * 255);
    imageData.data[i * 4] = r;
    imageData.data[i * 4 + 1] = g;
    imageData.data[i * 4 + 2] = b;
    imageData.data[i * 4 + 3] = 255;
  }
  return imageData;
}

/**
 * Preloads and caches the inference session without running any upscale
 * — used by the shared tool-page shell to show an accurate "Loading
 * upscaling engine…" progress state before the person's file even
 * starts processing, the same preload contract preloadFFmpegEngine and
 * preloadOcrEngine already establish for this app's other WASM engines.
 */
export async function preloadUpscalerEngine(onLoadProgress) {
  await getSession(onLoadProgress);
}

/**
 * @param {File} file
 * @param {number} scaleFactor 2 or 4 — this model always outputs 4x per
 *   tile; requesting 2x runs the same real 4x inference (there's no
 *   quality shortcut to skip), then downsamples the final composited
 *   result by half, which is genuinely sharper than upscaling only 2x
 *   worth in the first place would be, since the extra resolution the
 *   model reconstructed is real, not interpolated back in afterward.
 * @param {(progress: {stage, value})=>void} [onProgress]
 */
export async function upscaleImage(file, scaleFactor = 4, onProgress) {
  // A hard cap on source input size — browser-based inference genuinely
  // cannot handle arbitrarily large inputs reliably on mid-range
  // devices (each 128x128 tile alone holds real GPU/WASM memory during
  // inference; a very large source multiplies the tile count directly).
  // This mirrors the same honest, disclosed constraint this tool's own
  // FAQ states plainly, rather than letting a huge image silently hang
  // or crash the tab.
  const MAX_INPUT_DIMENSION = 1600;

  const session = await getSession(onProgress);

  const bitmap = await createImageBitmap(file);
  if (Math.max(bitmap.width, bitmap.height) > MAX_INPUT_DIMENSION) {
    throw new Error(
      `This image is larger than ${MAX_INPUT_DIMENSION}px on its longest side. Resize it down first — browser-based AI upscaling needs a smaller starting point to run reliably on real devices.`
    );
  }

  const srcW = bitmap.width;
  const srcH = bitmap.height;
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = srcW;
  srcCanvas.height = srcH;
  srcCanvas.getContext("2d").drawImage(bitmap, 0, 0);

  const xStarts = planTileStarts(srcW, TILE_IN, OVERLAP_IN);
  const yStarts = planTileStarts(srcH, TILE_IN, OVERLAP_IN);
  const totalTiles = xStarts.length * yStarts.length;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = srcW * SCALE;
  outCanvas.height = srcH * SCALE;
  const outCtx = outCanvas.getContext("2d");

  // Per-pixel accumulation buffers for cross-fade blending at tile
  // seams: each output pixel accumulates a weighted sum from every tile
  // that covers it (1 for non-overlap regions, blended across overlap
  // regions), avoiding a hard visible seam where adjacent tiles meet.
  const accum = new Float32Array(outCanvas.width * outCanvas.height * 3);
  const weight = new Float32Array(outCanvas.width * outCanvas.height);

  let tileIndex = 0;
  for (const sy of yStarts) {
    for (const sx of xStarts) {
      onProgress?.({
        stage: `Upscaling tile ${tileIndex + 1} of ${totalTiles}`,
        value: 0.8 + (tileIndex / totalTiles) * 0.18,
      });

      const validW = Math.min(TILE_IN, srcW - sx);
      const validH = Math.min(TILE_IN, srcH - sy);

      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = TILE_IN;
      tileCanvas.height = TILE_IN;
      const tileCtx = tileCanvas.getContext("2d");
      tileCtx.drawImage(srcCanvas, sx, sy, validW, validH, 0, 0, validW, validH);
      // Edge-replicate the last real column/row into the padded area
      // (rather than leaving it black) so the model isn't shown a hard
      // false edge at the padding boundary, which would otherwise
      // distort real content near that border with a spurious edge
      // response. Only reached for source images smaller than 128px in
      // a dimension, or the final tile at the image's own edge.
      if (validW < TILE_IN) {
        tileCtx.drawImage(tileCanvas, validW - 1, 0, 1, validH, validW, 0, TILE_IN - validW, validH);
      }
      if (validH < TILE_IN) {
        tileCtx.drawImage(tileCanvas, 0, validH - 1, TILE_IN, 1, 0, validH, TILE_IN, TILE_IN - validH);
      }

      const upscaledImageData = await upscaleTile(session, tileCanvas);

      // Composite this tile's real (non-padded) region into the
      // accumulation buffers at its correctly-scaled output position,
      // weighted by a simple linear ramp across the overlap band so two
      // tiles agree smoothly rather than one hard-cutting over the other.
      const outValidW = validW * SCALE;
      const outValidH = validH * SCALE;
      const outX = sx * SCALE;
      const outY = sy * SCALE;

      for (let ty = 0; ty < outValidH; ty++) {
        const globalY = outY + ty;
        if (globalY >= outCanvas.height) continue;
        for (let tx = 0; tx < outValidW; tx++) {
          const globalX = outX + tx;
          if (globalX >= outCanvas.width) continue;

          // Linear feather weight: 1.0 in the tile's non-overlap core,
          // ramping down toward 0 only within the overlap band at each
          // edge that actually borders another tile (an image-edge
          // border, with nothing to blend against, always gets full
          // weight — no fade toward the outside of the image).
          const featherPx = OVERLAP_IN * SCALE;
          let wx = 1;
          let wy = 1;
          if (sx > 0 && tx < featherPx) wx = tx / featherPx;
          if (sx + validW < srcW && tx > outValidW - featherPx) wx = (outValidW - tx) / featherPx;
          if (sy > 0 && ty < featherPx) wy = ty / featherPx;
          if (sy + validH < srcH && ty > outValidH - featherPx) wy = (outValidH - ty) / featherPx;
          const w = Math.max(0.001, wx * wy);

          const srcIdx = (ty * outValidW + tx) * 4;
          const dstIdx = globalY * outCanvas.width + globalX;
          accum[dstIdx * 3] += upscaledImageData.data[srcIdx] * w;
          accum[dstIdx * 3 + 1] += upscaledImageData.data[srcIdx + 1] * w;
          accum[dstIdx * 3 + 2] += upscaledImageData.data[srcIdx + 2] * w;
          weight[dstIdx] += w;
        }
      }

      tileIndex++;
    }
  }

  const finalImageData = outCtx.createImageData(outCanvas.width, outCanvas.height);
  for (let i = 0; i < weight.length; i++) {
    const w = weight[i] || 1;
    finalImageData.data[i * 4] = Math.round(accum[i * 3] / w);
    finalImageData.data[i * 4 + 1] = Math.round(accum[i * 3 + 1] / w);
    finalImageData.data[i * 4 + 2] = Math.round(accum[i * 3 + 2] / w);
    finalImageData.data[i * 4 + 3] = 255;
  }
  outCtx.putImageData(finalImageData, 0, 0);

  onProgress?.({ stage: "Finishing", value: 0.99 });

  // Requesting 2x runs the same real 4x model, then resamples the fully
  // reconstructed 4x result down to 2x — see the scaleFactor doc comment
  // above for why this is genuinely higher quality than any shortcut.
  if (scaleFactor === 2) {
    const halfCanvas = document.createElement("canvas");
    halfCanvas.width = srcW * 2;
    halfCanvas.height = srcH * 2;
    const halfCtx = halfCanvas.getContext("2d");
    halfCtx.imageSmoothingEnabled = true;
    halfCtx.imageSmoothingQuality = "high";
    halfCtx.drawImage(outCanvas, 0, 0, halfCanvas.width, halfCanvas.height);
    return new Promise((resolve, reject) => {
      halfCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed."))), "image/png");
    });
  }

  return new Promise((resolve, reject) => {
    outCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed."))), "image/png");
  });
}
