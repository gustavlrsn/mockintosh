/**
 * Atkinson dithering to 1-bit.
 *
 * Operates on raw RGBA data and writes output into `out` (0 = white, 1 = black).
 * `lum` is a scratch Float32Array (must be length w*h) to avoid allocation on
 * hot paths.
 */
export function atkinsonTo1bit(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  out: Uint8Array,
  lum: Float32Array
): void {
  const len = w * h;
  for (let i = 0; i < len; i++) {
    const ri = i << 2;
    lum[i] = rgba[ri] * 0.299 + rgba[ri + 1] * 0.587 + rgba[ri + 2] * 0.114;
  }
  for (let i = 0; i < len; i++) {
    const val = lum[i];
    const bit = val < 129 ? 1 : 0;
    out[i] = bit;
    const err = (val - (bit ? 0 : 255)) / 8;
    if (i + 1 < len) lum[i + 1] += err;
    if (i + 2 < len) lum[i + 2] += err;
    if (i + w - 1 < len) lum[i + w - 1] += err;
    if (i + w < len) lum[i + w] += err;
    if (i + w + 1 < len) lum[i + w + 1] += err;
    if (i + (w << 1) < len) lum[i + (w << 1)] += err;
  }
}

/**
 * Load an image from a data URL or object URL, draw it scaled to targetW×targetH
 * on an OffscreenCanvas, then Atkinson-dither the result to a 1-bit Uint8Array.
 *
 * Returns a new Uint8Array of length targetW*targetH (0 = white, 1 = black), or
 * null if the image could not be loaded.
 */
export async function ditherImageToPixels(
  src: string,
  targetW: number,
  targetH: number
): Promise<Uint8Array | null> {
  try {
    const resp = await fetch(src);
    const blob = await resp.blob();
    const bmp = await createImageBitmap(blob);

    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    }) as OffscreenCanvasRenderingContext2D;

    ctx.drawImage(bmp, 0, 0, targetW, targetH);
    bmp.close();

    const imageData = ctx.getImageData(0, 0, targetW, targetH);
    const pixels = new Uint8Array(targetW * targetH);
    const lum = new Float32Array(targetW * targetH);
    atkinsonTo1bit(imageData.data, targetW, targetH, pixels, lum);
    return pixels;
  } catch {
    return null;
  }
}

/**
 * Same as ditherImageToPixels but accepts an existing Blob directly (avoids
 * an extra fetch round-trip when the caller already has the bytes).
 */
export async function ditherBlobToPixels(
  blob: Blob,
  targetW: number,
  targetH: number
): Promise<Uint8Array | null> {
  try {
    const bmp = await createImageBitmap(blob);

    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    }) as OffscreenCanvasRenderingContext2D;

    ctx.drawImage(bmp, 0, 0, targetW, targetH);
    bmp.close();

    const imageData = ctx.getImageData(0, 0, targetW, targetH);
    const pixels = new Uint8Array(targetW * targetH);
    const lum = new Float32Array(targetW * targetH);
    atkinsonTo1bit(imageData.data, targetW, targetH, pixels, lum);
    return pixels;
  } catch {
    return null;
  }
}
