/**
 * Recover a 1-bit bitmap from a screenshot of pixel art.
 *
 * The source is a photo of the bitmap: each art pixel is a block of screen
 * pixels, edges are anti-aliased, and a watermark may cross the blocks.
 * Block edges are the only strong steps in luminance, and the gaps between
 * those steps are integer multiples of the block size. The period is the
 * largest step that explains those gaps; each output pixel is the median
 * luminance at the center of its block, so fringe and a thin watermark drop out.
 */
import type { ImageFrame } from "@mockintosh/sdk";

/** Largest bitmap Trace will build. A finer result means the block size is too small. */
export const MAX_BITMAP = 256;

export const BLOCK_MIN = 1;
export const BLOCK_MAX = 128;
export const THRESHOLD_DEFAULT = 128;

export interface PixelGrid {
  /** Source pixels per bitmap pixel. Square: both axes share one block size. */
  block: number;
  /** Left edge of bitmap column 0, in source pixels. */
  originX: number;
  /** Top edge of bitmap row 0, in source pixels. */
  originY: number;
}

export interface TracedBitmap {
  width: number;
  height: number;
  /** 0 = white, 1 = black, row-major, one byte per pixel. */
  pixels: Uint8Array;
}

interface AxisFit {
  block: number;
  origin: number;
}

const FALLBACK: AxisFit = { block: 1, origin: 0 };

function luminance(rgba: Uint8ClampedArray, offset: number): number {
  return rgba[offset] * 0.299 + rgba[offset + 1] * 0.587 + rgba[offset + 2] * 0.114;
}

/** Mean absolute step between adjacent columns (`"x"`) or rows (`"y"`). */
function axisDiff(frame: ImageFrame, axis: "x" | "y"): Float32Array {
  const { width, height, rgba } = frame;
  if (axis === "x") {
    const diff = new Float32Array(Math.max(0, width - 1));
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width - 1; x++) {
        const i = (row + x) * 4;
        diff[x] += Math.abs(luminance(rgba, i) - luminance(rgba, i + 4));
      }
    }
    const inv = 1 / Math.max(1, height);
    for (let x = 0; x < diff.length; x++) diff[x] *= inv;
    return diff;
  }
  const diff = new Float32Array(Math.max(0, height - 1));
  for (let y = 0; y < height - 1; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const i = (row + x) * 4;
      diff[y] += Math.abs(luminance(rgba, i) - luminance(rgba, i + width * 4));
    }
  }
  const inv = 1 / Math.max(1, width);
  for (let y = 0; y < diff.length; y++) diff[y] *= inv;
  return diff;
}

/**
 * Positions of strong steps, in source-pixel coordinates (the first pixel of
 * the block after the step). Weak steps — watermark ink, flat regions — stay out.
 */
function boundaryEdges(diff: Float32Array): number[] {
  if (diff.length === 0) return [];
  // A real block edge is a long step. A watermark is a short, shallow one.
  // The cut sits below the strongest steps and above that shallow noise.
  let max = 0;
  for (let i = 0; i < diff.length; i++) if (diff[i] > max) max = diff[i];
  const cut = Math.max(12, max * 0.4);

  const edges: number[] = [];
  let start = -1;
  let mass = 0;
  let moment = 0;
  const flush = () => {
    if (start >= 0 && mass > 0) edges.push(moment / mass + 1);
    start = -1;
    mass = 0;
    moment = 0;
  };
  for (let i = 0; i <= diff.length; i++) {
    if (i < diff.length && diff[i] >= cut) {
      if (start < 0) start = i;
      mass += diff[i];
      moment += i * diff[i];
    } else if (start >= 0) {
      flush();
    }
  }
  return mergeClose(edges, 2);
}

/** Anti-aliasing fires twice for one art edge. Collapse steps that sit on top of each other. */
function mergeClose(edges: number[], minSep: number): number[] {
  if (edges.length === 0) return [];
  const merged = [edges[0]];
  for (let i = 1; i < edges.length; i++) {
    const prev = merged[merged.length - 1];
    if (edges[i] - prev < minSep) merged[merged.length - 1] = (prev + edges[i]) / 2;
    else merged.push(edges[i]);
  }
  return merged;
}

function gapsBetween(edges: number[]): number[] {
  const gaps: number[] = [];
  for (let i = 1; i < edges.length; i++) {
    const gap = edges[i] - edges[i - 1];
    if (gap >= 2) gaps.push(gap);
  }
  return gaps;
}

/**
 * Largest period that still lands on the gaps. A run of identical art pixels
 * is several blocks wide, so a gap may be 2× or 3× the period; a period that
 * only explains those multiples, and never a single block, is rejected.
 */
function estimateBlock(gaps: number[]): number {
  if (gaps.length < 2) return 1;
  const sorted = [...gaps].sort((a, b) => a - b);
  const median = sorted[sorted.length >> 1];
  const limit = Math.min(BLOCK_MAX, median);
  let bestBlock = 1;
  let bestExplained = 0;
  let bestError = Infinity;
  for (let step = 20; step <= Math.round(limit * 10); step++) {
    const block = step / 10;
    let explained = 0;
    let singles = 0;
    let errorSum = 0;
    for (const gap of gaps) {
      const multiple = Math.round(gap / block);
      if (multiple < 1) continue;
      const error = Math.abs(gap - multiple * block);
      if (error <= Math.max(0.8, block * 0.14)) {
        explained++;
        errorSum += error;
        if (multiple === 1) singles++;
      }
    }
    if (singles < 2) continue;
    if (explained > bestExplained || (explained === bestExplained && errorSum < bestError)) {
      bestExplained = explained;
      bestError = errorSum;
      bestBlock = block;
    }
  }
  return bestExplained / gaps.length >= 0.45 ? bestBlock : 1;
}

function positiveMod(value: number, modulus: number): number {
  if (!(modulus > 0)) return 0;
  const remainder = value % modulus;
  return remainder < 0 ? remainder + modulus : remainder;
}

/** Phase of the grid against the image edge. Edges agree modulo the block size. */
function estimateOrigin(edges: number[], block: number): number {
  if (edges.length === 0 || !(block > 0)) return 0;
  const phases = edges.map((edge) => positiveMod(edge, block)).sort((a, b) => a - b);
  let best = phases[0];
  let bestSpan = Infinity;
  for (let i = 0; i < phases.length; i++) {
    const start = phases[i];
    const end = phases[(i + phases.length - 1) % phases.length];
    let span = end - start;
    if (span < 0) span += block;
    if (span < bestSpan) {
      bestSpan = span;
      best = phases[(i + (phases.length >> 1)) % phases.length];
    }
  }
  return best;
}

function residual(edges: number[], block: number, origin: number): number {
  let error = 0;
  for (const edge of edges) {
    const k = Math.round((edge - origin) / block);
    error += Math.abs(edge - (origin + k * block));
  }
  return error;
}

/** Re-fit period and phase so a slightly off guess does not drift across the picture. */
function refine(edges: number[], block: number, origin: number): AxisFit {
  if (edges.length < 3 || block < 2) return { block, origin };
  let count = 0;
  let sumK = 0;
  let sumE = 0;
  let sumKK = 0;
  let sumKE = 0;
  for (const edge of edges) {
    const k = Math.round((edge - origin) / block);
    if (k < 0) continue;
    count++;
    sumK += k;
    sumE += edge;
    sumKK += k * k;
    sumKE += k * edge;
  }
  const denom = count * sumKK - sumK * sumK;
  if (count < 3 || Math.abs(denom) < 1e-3) return { block, origin };
  const nextBlock = (count * sumKE - sumK * sumE) / denom;
  const nextOrigin = (sumE - nextBlock * sumK) / count;
  if (nextBlock < 1.5 || nextBlock > BLOCK_MAX) return { block, origin };
  const next = { block: nextBlock, origin: positiveMod(nextOrigin, nextBlock) };
  if (residual(edges, next.block, next.origin) > residual(edges, block, origin) + 0.05) {
    return { block, origin };
  }
  return next;
}

function fitAxis(diff: Float32Array): AxisFit {
  const edges = boundaryEdges(diff);
  const block = estimateBlock(gapsBetween(edges));
  if (block < 2) return FALLBACK;
  const origin = estimateOrigin(edges, block);
  const fitted = refine(edges, block, origin);
  if (fitted.block < 2) return FALLBACK;
  return fitted;
}

function clampBlock(block: number): number {
  if (!Number.isFinite(block) || block < BLOCK_MIN) return BLOCK_MIN;
  return Math.min(BLOCK_MAX, block);
}

export function detectGrid(frame: ImageFrame): PixelGrid {
  const horizontal = fitAxis(axisDiff(frame, "x"));
  const vertical = fitAxis(axisDiff(frame, "y"));
  const horizontalOk = horizontal.block >= 2;
  const verticalOk = vertical.block >= 2;
  let block = 1;
  if (horizontalOk && verticalOk) {
    const delta = Math.abs(horizontal.block - vertical.block) / Math.max(horizontal.block, vertical.block);
    block = delta < 0.2 ? (horizontal.block + vertical.block) / 2 : horizontal.block;
  } else if (horizontalOk) {
    block = horizontal.block;
  } else if (verticalOk) {
    block = vertical.block;
  }
  return {
    block: clampBlock(block),
    originX: horizontalOk || block >= 2 ? horizontal.origin : 0,
    originY: verticalOk || block >= 2 ? vertical.origin : 0,
  };
}

export function bitmapSize(frame: ImageFrame, grid: PixelGrid): { width: number; height: number } {
  const block = clampBlock(grid.block);
  return {
    width: countSamples(frame.width, grid.originX, block),
    height: countSamples(frame.height, grid.originY, block),
  };
}

/** How many block centers fall inside the image. */
function countSamples(length: number, origin: number, block: number): number {
  if (!(block > 0)) return 0;
  const first = origin + block * 0.5;
  if (first >= length) return 0;
  return Math.max(0, Math.floor((length - first - 1e-6) / block) + 1);
}

function medianAt(frame: ImageFrame, cx: number, cy: number, radius: number): number {
  const { width, height, rgba } = frame;
  const x0 = Math.floor(cx - radius);
  const x1 = Math.ceil(cx + radius);
  const y0 = Math.floor(cy - radius);
  const y1 = Math.ceil(cy + radius);
  const samples: number[] = [];
  for (let y = y0; y <= y1; y++) {
    if (y < 0 || y >= height) continue;
    const row = y * width;
    for (let x = x0; x <= x1; x++) {
      if (x < 0 || x >= width) continue;
      samples.push(luminance(rgba, (row + x) * 4));
    }
  }
  if (samples.length === 0) return 255;
  samples.sort((a, b) => a - b);
  return samples[samples.length >> 1];
}

/** Sample one bitmap pixel per block. `null` when the result would be empty or over {@link MAX_BITMAP}. */
export function traceBitmap(
  frame: ImageFrame,
  grid: PixelGrid,
  threshold = THRESHOLD_DEFAULT,
): TracedBitmap | null {
  const block = clampBlock(grid.block);
  const { width, height } = bitmapSize(frame, { ...grid, block });
  if (width < 1 || height < 1 || width > MAX_BITMAP || height > MAX_BITMAP) return null;
  const pixels = new Uint8Array(width * height);
  const radius = Math.max(0, block * 0.22);
  for (let y = 0; y < height; y++) {
    const cy = grid.originY + (y + 0.5) * block;
    for (let x = 0; x < width; x++) {
      const cx = grid.originX + (x + 0.5) * block;
      pixels[y * width + x] = medianAt(frame, cx, cy, radius) < threshold ? 1 : 0;
    }
  }
  return { width, height, pixels };
}

export interface BitmapRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Where the black ink sits, or `null` when the bitmap is empty. */
export function inkBounds(bitmap: TracedBitmap): BitmapRect | null {
  let minX = bitmap.width;
  let minY = bitmap.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < bitmap.height; y++) {
    const row = y * bitmap.width;
    for (let x = 0; x < bitmap.width; x++) {
      if (!bitmap.pixels[row + x]) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * A crop window over a traced bitmap. `(cropX, cropY)` is the top-left of the
 * window in source pixels — negative pads white on that side.
 */
export interface BitmapFrame {
  width: number;
  height: number;
  cropX: number;
  cropY: number;
}

export function clampFrameSize(size: number): number {
  if (!Number.isFinite(size)) return 1;
  return Math.max(1, Math.min(MAX_BITMAP, Math.round(size)));
}

/** Frame that hugs the ink, with `margin` white pixels around it. */
export function fitInkFrame(bitmap: TracedBitmap, margin = 1): BitmapFrame {
  const ink = inkBounds(bitmap);
  if (!ink) {
    return { width: bitmap.width, height: bitmap.height, cropX: 0, cropY: 0 };
  }
  const width = clampFrameSize(ink.width + margin * 2);
  const height = clampFrameSize(ink.height + margin * 2);
  return {
    width,
    height,
    cropX: ink.x - margin,
    cropY: ink.y - margin,
  };
}

/** Center the ink inside a fixed frame (classic 32×32 icon canvas). */
export function centerInkFrame(bitmap: TracedBitmap, frameW: number, frameH: number): BitmapFrame {
  const width = clampFrameSize(frameW);
  const height = clampFrameSize(frameH);
  const ink = inkBounds(bitmap);
  if (!ink) return { width, height, cropX: 0, cropY: 0 };
  return {
    width,
    height,
    cropX: ink.x - Math.floor((width - ink.width) / 2),
    cropY: ink.y - Math.floor((height - ink.height) / 2),
  };
}

/** Copy the frame window out of `src`, filling missing pixels with white. */
export function frameBitmap(src: TracedBitmap, frame: BitmapFrame): TracedBitmap {
  const width = clampFrameSize(frame.width);
  const height = clampFrameSize(frame.height);
  const pixels = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const sy = frame.cropY + y;
    if (sy < 0 || sy >= src.height) continue;
    const srcRow = sy * src.width;
    const dstRow = y * width;
    for (let x = 0; x < width; x++) {
      const sx = frame.cropX + x;
      if (sx < 0 || sx >= src.width) continue;
      pixels[dstRow + x] = src.pixels[srcRow + sx];
    }
  }
  return { width, height, pixels };
}

/** Drop the white margin around the ink, keeping `margin` pixels of white. */
export function trimBitmap(bitmap: TracedBitmap, margin = 1): TracedBitmap {
  return frameBitmap(bitmap, fitInkFrame(bitmap, margin));
}
