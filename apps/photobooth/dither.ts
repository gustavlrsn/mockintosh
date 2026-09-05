export type DitherMode = "atkinson" | "bayer";

export interface DitherState {
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
  pixels: Uint8Array;
  luminance: Float32Array;
}

export function getOrCreateDitherState(
  ref: { current: DitherState | null },
  w: number,
  h: number
): DitherState {
  const existing = ref.current;
  if (existing && existing.canvas.width === w && existing.canvas.height === h) {
    return existing;
  }
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  ref.current = {
    canvas,
    ctx,
    pixels: new Uint8Array(w * h),
    luminance: new Float32Array(w * h),
  };
  return ref.current;
}

/** Atkinson dither → 1-bit (0=white, 1=black). */
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

export function bayerTo1bit(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  out: Uint8Array,
  threshold: number
): void {
  const len = w * h;
  for (let i = 0; i < len; i++) {
    const ri = i << 2;
    const lum = rgba[ri] * 0.299 + rgba[ri + 1] * 0.587 + rgba[ri + 2] * 0.114;
    const x = i % w;
    const y = (i / w) | 0;
    const mapped = (lum + BAYER_MAP[x & 3][y & 3]) >> 1;
    out[i] = mapped < threshold ? 1 : 0;
  }
}

/** Center-crop to square, mirror horizontally, dither into `state.pixels`. */
export function ditherVideoFrame(
  video: HTMLVideoElement,
  state: DitherState,
  mode: DitherMode
): void {
  const srcW = video.videoWidth;
  const srcH = video.videoHeight;
  if (srcW <= 0 || srcH <= 0) return;

  const targetW = state.canvas.width;
  const targetH = state.canvas.height;
  const cropSize = Math.min(srcW, srcH);
  const cropX = (srcW - cropSize) >> 1;
  const cropY = (srcH - cropSize) >> 1;

  const { ctx } = state;
  ctx.setTransform(-1, 0, 0, 1, targetW, 0);
  ctx.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, targetW, targetH);

  const scaled = ctx.getImageData(0, 0, targetW, targetH);
  if (mode === "bayer") {
    bayerTo1bit(scaled.data, targetW, targetH, state.pixels, 128);
  } else {
    state.luminance.fill(0);
    atkinsonTo1bit(scaled.data, targetW, targetH, state.pixels, state.luminance);
  }
}

/** Pack 1-bit pixels into the 2bpp sprite encoding used by FileManager.writeImage. */
export function pack1bitTo2bpp(pixels: Uint8Array): string {
  const packed = new Uint8Array(Math.ceil(pixels.length / 4));
  for (let i = 0; i < pixels.length; i++) {
    const bits = pixels[i] ? 0b10 : 0b01;
    packed[Math.floor(i / 4)] |= bits << (6 - (i % 4) * 2);
  }
  return btoa(String.fromCharCode(...packed));
}
