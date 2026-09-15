/**
 * RGBA → 1-byte-per-pixel (`0` = white, `1` = black) — the `<bitmap>` /
 * `blitPixels` contract. Atkinson and Bayer are lifted from Photo Booth;
 * threshold is the simple luminance cut Picture and Video Player used.
 */

/** Decoded raster: 8-bit RGBA, row-major, as `ImageData` but without the DOM. */
export interface ImageFrame {
  width: number;
  height: number;
  rgba: Uint8ClampedArray;
}

export type DitherMode = "threshold" | "atkinson" | "bayer";

export interface DitherOptions {
  /** Luminance cut for `threshold` and Bayer (default 128). */
  threshold?: number;
}

function luminance(r: number, g: number, b: number): number {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

function thresholdTo1bit(rgba: Uint8ClampedArray, len: number, out: Uint8Array, cut: number): void {
  for (let i = 0; i < len; i++) {
    const ri = i << 2;
    out[i] = luminance(rgba[ri], rgba[ri + 1], rgba[ri + 2]) < cut ? 1 : 0;
  }
}

function atkinsonTo1bit(rgba: Uint8ClampedArray, w: number, h: number, out: Uint8Array, lum: Float32Array): void {
  const len = w * h;
  for (let i = 0; i < len; i++) {
    const ri = i << 2;
    lum[i] = luminance(rgba[ri], rgba[ri + 1], rgba[ri + 2]);
  }
  for (let i = 0; i < len; i++) {
    const val = lum[i];
    const bit = val < 129 ? 1 : 0;
    out[i] = bit;
    const err = (val - (bit ? 0 : 255)) / 8;
    lum[i + 1] += err;
    lum[i + 2] += err;
    lum[i + w - 1] += err;
    lum[i + w] += err;
    lum[i + w + 1] += err;
    lum[i + (w << 1)] += err;
  }
}

const BAYER_MAP = [
  [15, 135, 45, 165],
  [195, 75, 225, 105],
  [60, 180, 30, 150],
  [240, 120, 210, 90],
];

function bayerTo1bit(rgba: Uint8ClampedArray, w: number, h: number, out: Uint8Array, cut: number): void {
  const len = w * h;
  for (let i = 0; i < len; i++) {
    const ri = i << 2;
    const lum = luminance(rgba[ri], rgba[ri + 1], rgba[ri + 2]);
    const x = i % w;
    const y = (i / w) | 0;
    const mapped = (lum + BAYER_MAP[x & 3][y & 3]) >> 1;
    out[i] = mapped < cut ? 1 : 0;
  }
}

function apply(frame: ImageFrame, mode: DitherMode, out: Uint8Array, lum: Float32Array | undefined, cut: number): void {
  const len = frame.width * frame.height;
  if (mode === "atkinson") atkinsonTo1bit(frame.rgba, frame.width, frame.height, out, lum!);
  else if (mode === "bayer") bayerTo1bit(frame.rgba, frame.width, frame.height, out, cut);
  else thresholdTo1bit(frame.rgba, len, out, cut);
}

/** RGBA → 1 byte per pixel, 0 = white, 1 = black — the `<bitmap pixels>` format. */
export function toBits(frame: ImageFrame, mode: DitherMode = "threshold", options?: DitherOptions): Uint8Array {
  const out = new Uint8Array(frame.width * frame.height);
  const lum = mode === "atkinson" ? new Float32Array(frame.width * frame.height) : undefined;
  apply(frame, mode, out, lum, options?.threshold ?? 128);
  return out;
}

/** Same conversion, reusing a caller-owned buffer and error rows for per-frame use. */
export function createDitherer(
  width: number,
  height: number,
  mode: DitherMode,
): (frame: ImageFrame, out: Uint8Array) => void {
  const lum = mode === "atkinson" ? new Float32Array(width * height) : undefined;
  return (frame, out) => {
    if (frame.width !== width || frame.height !== height) {
      throw new Error(`Ditherer is ${width}×${height}, frame is ${frame.width}×${frame.height}`);
    }
    if (mode === "atkinson") lum!.fill(0);
    apply(frame, mode, out, lum, 128);
  };
}
