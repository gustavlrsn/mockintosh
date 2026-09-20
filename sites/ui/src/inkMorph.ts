/**
 * Ink morph for catalog navigations, clipped to a `<Morph>` box.
 *
 * Sample ink from the outgoing and incoming clip, pair the points, and tween
 * them. The host frames the live tree (header) and stamps the particles.
 */

import type { BitMap } from "@mockintosh/quickdraw";
import { bitMapHeight, bitMapWidth, clearBitMap, getBit, newBitMap, setBit } from "@mockintosh/quickdraw/bits";
import { createSignal } from "@mockintosh/ui";
import type { CanvasUIHost } from "@mockintosh/ui/web";

/** Inspection name used to clip the ink morph to a `<Morph>` box. */
export const MORPH_CLIP = "morph";

export const PAGE_TRANSITIONS = [
  { id: "none", label: "None" },
  { id: "morph", label: "Morph" },
  { id: "dither", label: "Dithered" },
] as const;

export type PageTransition = (typeof PAGE_TRANSITIONS)[number]["id"];

export type MorphVariant = "throw" | "nearest" | "columns" | "wind" | "snap" | "drip";

export type MorphExtras = "drop" | "edge" | "stack";

const TRANSITION_KEY = "mockintosh-ui-page-transition";
const LEGACY_VARIANT_KEY = "mockintosh-ui-morph";
const STEP = 1;
const MAX_PARTICLES = 5000;
const TRANSITION_MS = 180;
const MORPH_VARIANT: MorphVariant = "nearest";
const MORPH_EXTRAS: MorphExtras = "stack";
/** How far past the clip unpaired ink starts or lands. */
const FLOOR_PAD = 14;
const COL_W = 3;
const NEAR_CELL = 8;

function readStoredTransition(): PageTransition {
  try {
    const raw = localStorage.getItem(TRANSITION_KEY);
    if (PAGE_TRANSITIONS.some((v) => v.id === raw)) return raw as PageTransition;
    const legacy = localStorage.getItem(LEGACY_VARIANT_KEY);
    if (legacy === "dither" || legacy === "wipe" || legacy === "dissolve") return "dither";
    if (legacy === "none") return "none";
  } catch {
    /* ignore */
  }
  return "morph";
}

const [pageTransition, setPageTransitionSignal] = createSignal<PageTransition>(readStoredTransition());

export { pageTransition };

export function setPageTransition(next: PageTransition): void {
  try {
    localStorage.setItem(TRANSITION_KEY, next);
  } catch {
    /* ignore */
  }
  setPageTransitionSignal(next);
  retargetMorph();
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function easeInCubic(t: number): number {
  return t * t * t;
}

/**
 * Packed `x,y` pairs. Default `step` is 1 so every dest ink pixel can land.
 * Larger steps are for tests / previews only — they make the last frame look gray.
 */
export function collectInk(bm: BitMap, step: number = STEP): Float32Array {
  const width = bitMapWidth(bm);
  const height = bitMapHeight(bm);
  const left = bm.bounds.left;
  const top = bm.bounds.top;
  const pts: number[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      let fx = -1;
      let fy = -1;
      const yMax = Math.min(step, height - y);
      const xMax = Math.min(step, width - x);
      for (let dy = 0; dy < yMax && fx < 0; dy++) {
        for (let dx = 0; dx < xMax; dx++) {
          if (getBit(bm, left + x + dx, top + y + dy)) {
            fx = x + dx;
            fy = y + dy;
            break;
          }
        }
      }
      if (fx >= 0) {
        pts.push(left + fx, top + fy);
      }
    }
  }
  return new Float32Array(pts);
}

export function subsampleInk(xy: Float32Array, max: number = MAX_PARTICLES): Float32Array {
  const count = xy.length >> 1;
  if (count <= max) return xy;
  const stride = Math.ceil(count / max);
  const out = new Float32Array(Math.ceil(count / stride) * 2);
  let j = 0;
  for (let i = 0; i < count; i += stride) {
    out[j++] = xy[i * 2]!;
    out[j++] = xy[i * 2 + 1]!;
  }
  return out.subarray(0, j);
}

/** Sort packed points by row, then column, in place. */
export function sortInk(xy: Float32Array): Float32Array {
  const n = xy.length >> 1;
  const idx = new Uint32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  idx.sort((a, b) => {
    const ay = xy[a * 2 + 1]!;
    const by = xy[b * 2 + 1]!;
    if (ay !== by) return ay - by;
    return xy[a * 2]! - xy[b * 2]!;
  });
  const out = new Float32Array(xy.length);
  for (let i = 0; i < n; i++) {
    const s = idx[i]! * 2;
    out[i * 2] = xy[s]!;
    out[i * 2 + 1] = xy[s + 1]!;
  }
  xy.set(out);
  return xy;
}

function inkKey(x: number, y: number): number {
  return ((y + 0x8000) << 16) | ((x + 0x8000) & 0xffff);
}

/**
 * First pass: ink present at the same coordinate on both frames stays put.
 * Pairing and extras only see the leftovers.
 */
export function splitStationary(
  from: Float32Array,
  to: Float32Array,
): { stay: Float32Array; movingFrom: Float32Array; movingTo: Float32Array } {
  const fromN = from.length >> 1;
  const toN = to.length >> 1;
  const fromAt = new Set<number>();
  for (let i = 0; i < fromN; i++) fromAt.add(inkKey(from[i * 2]!, from[i * 2 + 1]!));
  const stay: number[] = [];
  const movingTo: number[] = [];
  const stayAt = new Set<number>();
  for (let i = 0; i < toN; i++) {
    const x = to[i * 2]!;
    const y = to[i * 2 + 1]!;
    const key = inkKey(x, y);
    if (fromAt.has(key)) {
      stay.push(x, y);
      stayAt.add(key);
    } else {
      movingTo.push(x, y);
    }
  }
  const movingFrom: number[] = [];
  for (let i = 0; i < fromN; i++) {
    const x = from[i * 2]!;
    const y = from[i * 2 + 1]!;
    if (!stayAt.has(inkKey(x, y))) movingFrom.push(x, y);
  }
  return {
    stay: new Float32Array(stay),
    movingFrom: new Float32Array(movingFrom),
    movingTo: new Float32Array(movingTo),
  };
}

function pushParticle(
  out: Float32Array,
  o: number,
  fx: number,
  fy: number,
  tx: number,
  ty: number,
  sag: number,
  delay: number,
): number {
  out[o] = fx;
  out[o + 1] = fy;
  out[o + 2] = tx;
  out[o + 3] = ty;
  out[o + 4] = sag;
  out[o + 5] = delay;
  return o + 6;
}

function travelSag(fx: number, fy: number, tx: number, ty: number): number {
  return Math.min(28, 5 + (Math.abs(tx - fx) + Math.abs(ty - fy)) * 0.18);
}

interface MorphSize {
  width: number;
  height: number;
}

/** Just outside the clip, on the side closest to (x, y). */
function nearestOutside(x: number, y: number, width: number, height: number): { x: number; y: number } {
  const dTop = y;
  const dBottom = height - 1 - y;
  const dLeft = x;
  const dRight = width - 1 - x;
  const nearest = Math.min(dTop, dBottom, dLeft, dRight);
  if (nearest === dTop) return { x, y: -FLOOR_PAD };
  if (nearest === dBottom) return { x, y: height + FLOOR_PAD };
  if (nearest === dLeft) return { x: -FLOOR_PAD, y };
  return { x: width + FLOOR_PAD, y };
}

function extraDestStart(tx: number, ty: number, size: MorphSize, extras: MorphExtras): { x: number; y: number } {
  if (extras === "edge") return nearestOutside(tx, ty, size.width, size.height);
  return { x: tx, y: -FLOOR_PAD };
}

function extraFromEnd(fx: number, fy: number, size: MorphSize, extras: MorphExtras): { x: number; y: number } {
  if (extras === "edge") return nearestOutside(fx, fy, size.width, size.height);
  return { x: fx, y: size.height + FLOOR_PAD };
}

function nearestIndex(xy: Float32Array, x: number, y: number): number {
  const n = xy.length >> 1;
  let best = -1;
  let bestD = 1e15;
  for (let i = 0; i < n; i++) {
    const ddx = xy[i * 2]! - x;
    const ddy = xy[i * 2 + 1]! - y;
    const d = ddx * ddx + ddy * ddy;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

function pairOrdered(
  from: Float32Array,
  to: Float32Array,
  size: MorphSize,
  extras: MorphExtras,
  sagFor: (i: number, fx: number, fy: number, tx: number, ty: number) => number,
  delayFor: (i: number, fy: number, ty: number, extra: boolean) => number,
): Float32Array {
  const fromN = from.length >> 1;
  const toN = to.length >> 1;
  if (extras === "stack" && fromN > 0 && toN > 0) {
    const n = Math.max(fromN, toN);
    const out = new Float32Array(n * 6);
    let o = 0;
    for (let i = 0; i < n; i++) {
      const fi = i % fromN;
      const ti = i % toN;
      const fx = from[fi * 2]!;
      const fy = from[fi * 2 + 1]!;
      const tx = to[ti * 2]!;
      const ty = to[ti * 2 + 1]!;
      o = pushParticle(out, o, fx, fy, tx, ty, sagFor(i, fx, fy, tx, ty), delayFor(i, fy, ty, i >= pairedCount(fromN, toN)));
    }
    return out;
  }
  const paired = Math.min(fromN, toN);
  const destStart = extras === "drop" && toN > fromN ? toN - fromN : 0;
  const out = new Float32Array(Math.max(fromN, toN) * 6);
  let o = 0;
  for (let i = 0; i < paired; i++) {
    const fx = from[i * 2]!;
    const fy = from[i * 2 + 1]!;
    const ti = destStart + i;
    const tx = to[ti * 2]!;
    const ty = to[ti * 2 + 1]!;
    o = pushParticle(out, o, fx, fy, tx, ty, sagFor(i, fx, fy, tx, ty), delayFor(i, fy, ty, false));
  }
  for (let i = paired; i < fromN; i++) {
    const fx = from[i * 2]!;
    const fy = from[i * 2 + 1]!;
    const end = extraFromEnd(fx, fy, size, extras);
    o = pushParticle(out, o, fx, fy, end.x, end.y, 0, delayFor(i, fy, end.y, true));
  }
  const destExtraEnd = destStart > 0 ? destStart : toN;
  const destExtraStart = destStart > 0 ? 0 : paired;
  for (let i = destExtraStart; i < destExtraEnd; i++) {
    const tx = to[i * 2]!;
    const ty = to[i * 2 + 1]!;
    const start = extraDestStart(tx, ty, size, extras);
    o = pushParticle(out, o, start.x, start.y, tx, ty, 0, delayFor(i, start.y, ty, true));
  }
  return out;
}

function pairedCount(fromN: number, toN: number): number {
  return Math.min(fromN, toN);
}

/**
 * Interleaved `sx,sy,dx,dy,sag,delay`.
 * Pairing follows the variant. Extra dest / leftover source follow `extras`:
 * `drop` rains in from the top and falls out the bottom; `edge` enters/exits
 * the nearest clip side; `stack` duplicates source onto extra dest and piles
 * leftover source onto dest pixels.
 */
export function pairInk(
  from: Float32Array,
  to: Float32Array,
  height: number,
  variant: MorphVariant = "throw",
  extras: MorphExtras = "drop",
  width: number = height,
): Float32Array {
  const size: MorphSize = { width, height };
  if (variant === "nearest" || variant === "snap") return pairNearest(from, to, size, extras);
  if (variant === "columns") return pairColumns(from, to, size, extras);
  if (variant === "drip") {
    return pairOrdered(
      from,
      to,
      size,
      extras,
      (_i, fx, fy, tx, ty) => travelSag(fx, fy, tx, ty) * 0.4,
      (i, fy, ty, extra) => {
        const row = extra ? Math.max(fy, ty) : Math.min(fy, ty);
        return Math.min(0.35, (row / Math.max(1, height)) * 0.35 + (i % 4) * 0.01);
      },
    );
  }
  const wind = variant === "wind";
  return pairOrdered(
    from,
    to,
    size,
    extras,
    (i, fx, fy, tx, ty) => {
      if (wind) return Math.min(36, 12 + Math.abs(tx - fx) * 0.2);
      return travelSag(fx, fy, tx, ty);
    },
    (i, _fy, _ty, extra) => (extra ? 0.1 + (i % 8) * 0.03 : (i % 6) * 0.03),
  );
}

function pairNearest(from: Float32Array, to: Float32Array, size: MorphSize, extras: MorphExtras): Float32Array {
  const fromN = from.length >> 1;
  const toN = to.length >> 1;
  const used = new Uint8Array(fromN);
  const buckets = new Map<number, number[]>();
  const key = (x: number, y: number) => ((y / NEAR_CELL) | 0) << 16 | ((x / NEAR_CELL) | 0);
  for (let i = 0; i < fromN; i++) {
    const k = key(from[i * 2]!, from[i * 2 + 1]!);
    const bucket = buckets.get(k);
    if (bucket) bucket.push(i);
    else buckets.set(k, [i]);
  }
  const destRank = new Uint32Array(toN);
  for (let i = 0; i < toN; i++) destRank[i] = i;
  destRank.sort((a, b) => {
    const ay = to[a * 2 + 1]!;
    const by = to[b * 2 + 1]!;
    if (ay !== by) return ay - by;
    return to[a * 2]! - to[b * 2]!;
  });
  const extraTo = extras === "drop" ? Math.max(0, toN - fromN) : 0;
  const reserved = new Uint8Array(toN);
  for (let i = 0; i < extraTo; i++) reserved[destRank[i]!] = 1;
  const match = new Int32Array(toN);
  match.fill(-1);
  for (let ti = 0; ti < toN; ti++) {
    if (reserved[ti]) continue;
    const tx = to[ti * 2]!;
    const ty = to[ti * 2 + 1]!;
    const cx = (tx / NEAR_CELL) | 0;
    const cy = (ty / NEAR_CELL) | 0;
    let best = -1;
    let bestD = 1e15;
    for (let rad = 0; rad <= 5 && best < 0; rad++) {
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          if (rad > 0 && Math.max(Math.abs(dx), Math.abs(dy)) !== rad) continue;
          const bucket = buckets.get(((cy + dy) << 16) | (cx + dx));
          if (!bucket) continue;
          for (const fi of bucket) {
            if (used[fi]) continue;
            const ddx = from[fi * 2]! - tx;
            const ddy = from[fi * 2 + 1]! - ty;
            const d = ddx * ddx + ddy * ddy;
            if (d < bestD) {
              bestD = d;
              best = fi;
            }
          }
        }
      }
    }
    if (best >= 0) {
      used[best] = 1;
      match[ti] = best;
    }
  }
  const out = new Float32Array((toN + fromN) * 6);
  let o = 0;
  let k = 0;
  for (let ti = 0; ti < toN; ti++) {
    const tx = to[ti * 2]!;
    const ty = to[ti * 2 + 1]!;
    let fi = match[ti]!;
    if (fi < 0 && extras === "stack") fi = nearestIndex(from, tx, ty);
    if (fi < 0) {
      const start = extraDestStart(tx, ty, size, extras);
      o = pushParticle(out, o, start.x, start.y, tx, ty, 0, 0.1 + (k++ % 8) * 0.03);
      continue;
    }
    const fx = from[fi * 2]!;
    const fy = from[fi * 2 + 1]!;
    o = pushParticle(out, o, fx, fy, tx, ty, travelSag(fx, fy, tx, ty) * 0.55, (ti % 6) * 0.02);
  }
  let fall = 0;
  for (let fi = 0; fi < fromN; fi++) {
    if (used[fi]) continue;
    const fx = from[fi * 2]!;
    const fy = from[fi * 2 + 1]!;
    if (extras === "stack") {
      const ti = nearestIndex(to, fx, fy);
      if (ti >= 0) {
        const tx = to[ti * 2]!;
        const ty = to[ti * 2 + 1]!;
        o = pushParticle(out, o, fx, fy, tx, ty, travelSag(fx, fy, tx, ty) * 0.55, 0.1 + (fall++ % 8) * 0.03);
        continue;
      }
    }
    const end = extraFromEnd(fx, fy, size, extras);
    o = pushParticle(out, o, fx, fy, end.x, end.y, 0, 0.1 + (fall++ % 8) * 0.03);
  }
  return out.subarray(0, o);
}

function pairColumns(from: Float32Array, to: Float32Array, size: MorphSize, extras: MorphExtras): Float32Array {
  const fromN = from.length >> 1;
  const toN = to.length >> 1;
  const cols = new Map<number, { from: number[]; to: number[] }>();
  const col = (x: number) => (x / COL_W) | 0;
  const bucket = (c: number) => {
    let b = cols.get(c);
    if (!b) {
      b = { from: [], to: [] };
      cols.set(c, b);
    }
    return b;
  };
  for (let i = 0; i < fromN; i++) bucket(col(from[i * 2]!)).from.push(i);
  for (let i = 0; i < toN; i++) bucket(col(to[i * 2]!)).to.push(i);
  const out = new Float32Array((fromN + toN) * 6);
  let o = 0;
  let n = 0;
  for (const b of cols.values()) {
    if (extras === "stack" && b.from.length > 0 && b.to.length > 0) {
      const count = Math.max(b.from.length, b.to.length);
      for (let i = 0; i < count; i++) {
        const fi = b.from[i % b.from.length]!;
        const ti = b.to[i % b.to.length]!;
        const fx = from[fi * 2]!;
        const fy = from[fi * 2 + 1]!;
        const tx = to[ti * 2]!;
        const ty = to[ti * 2 + 1]!;
        o = pushParticle(out, o, fx, fy, tx, ty, Math.min(18, Math.abs(ty - fy) * 0.15), (n++ % 5) * 0.02);
      }
      continue;
    }
    const paired = Math.min(b.from.length, b.to.length);
    const destStart = extras === "drop" && b.to.length > b.from.length ? b.to.length - b.from.length : 0;
    for (let i = 0; i < paired; i++) {
      const fi = b.from[i]!;
      const ti = b.to[destStart + i]!;
      const fx = from[fi * 2]!;
      const fy = from[fi * 2 + 1]!;
      const tx = to[ti * 2]!;
      const ty = to[ti * 2 + 1]!;
      o = pushParticle(out, o, fx, fy, tx, ty, Math.min(18, Math.abs(ty - fy) * 0.15), (n++ % 5) * 0.02);
    }
    for (let i = paired; i < b.from.length; i++) {
      const fi = b.from[i]!;
      const fx = from[fi * 2]!;
      const fy = from[fi * 2 + 1]!;
      const end = extraFromEnd(fx, fy, size, extras);
      o = pushParticle(out, o, fx, fy, end.x, end.y, 0, 0.08 + ((i - paired) % 6) * 0.03);
    }
    const destExtraEnd = destStart > 0 ? destStart : b.to.length;
    const destExtraStart = destStart > 0 ? 0 : paired;
    for (let i = destExtraStart; i < destExtraEnd; i++) {
      const ti = b.to[i]!;
      const tx = to[ti * 2]!;
      const ty = to[ti * 2 + 1]!;
      const start = extraDestStart(tx, ty, size, extras);
      o = pushParticle(out, o, start.x, start.y, tx, ty, 0, 0.08 + (i % 6) * 0.03);
    }
  }
  return out.subarray(0, o);
}

export function paintMorph(
  dest: BitMap,
  particles: Float32Array,
  t: number,
  variant: MorphVariant = "throw",
  stay?: Float32Array,
): void {
  clearBitMap(dest);
  if (stay) {
    for (let i = 0; i < stay.length; i += 2) setBit(dest, stay[i]!, stay[i + 1]!, 1);
  }
  const width = bitMapWidth(dest);
  const height = bitMapHeight(dest);
  const left = dest.bounds.left;
  const top = dest.bounds.top;
  const right = left + width;
  const bottom = top + height;
  const n = particles.length / 6;
  for (let i = 0; i < n; i++) {
    const o = i * 6;
    const sx = particles[o]!;
    const sy = particles[o + 1]!;
    const dx = particles[o + 2]!;
    const dy = particles[o + 3]!;
    const sag = particles[o + 4]!;
    const delay = particles[o + 5]!;
    const span = 1 - delay;
    const local = span <= 0 ? 1 : Math.min(1, Math.max(0, (t - delay) / span));
    const exiting = dx < left || dy < top || dx >= right || dy >= bottom;
    const entering = sx < left || sy < top || sx >= right || sy >= bottom;
    let x: number;
    let y: number;
    if (variant === "snap" && !exiting && !entering) {
      const h = Math.imul(i + 1, 2654435761) >>> 0;
      const mx = sx + ((h % 21) - 10);
      const my = sy + (((h >>> 8) % 17) - 8);
      if (local < 0.42) {
        const e = easeOutCubic(local / 0.42);
        x = sx + (mx - sx) * e;
        y = sy + (my - sy) * e;
      } else {
        const e = easeOutCubic((local - 0.42) / 0.58);
        x = mx + (dx - mx) * e;
        y = my + (dy - my) * e;
      }
    } else {
      const e = exiting ? easeInCubic(local) : easeOutCubic(local);
      const bulge = 4 * e * (1 - e);
      x = sx + (dx - sx) * e + (variant === "wind" && !exiting && !entering ? sag * bulge : 0);
      y = sy + (dy - sy) * e + (variant === "wind" || exiting || entering ? 0 : sag * bulge);
    }
    x = Math.round(x);
    y = Math.round(y);
    if (x < left || y < top || x >= right || y >= bottom) continue;
    setBit(dest, x, y, 1);
  }
}

/** Classic 4×4 ordered dither, values in (0, 1). */
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function bayerThreshold(x: number, y: number): number {
  return (BAYER4[((y & 3) << 2) | (x & 3)]! + 0.5) / 16;
}

/** Shared ink stays; source-only Bayer-fades out; dest-only Bayer-fades in. */
export function paintDitherDissolve(work: BitMap, from: BitMap, to: BitMap, t: number): void {
  const width = bitMapWidth(work);
  const height = bitMapHeight(work);
  const left = work.bounds.left;
  const top = work.bounds.top;
  clearBitMap(work);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = getBit(from, left + x, top + y);
      const b = getBit(to, left + x, top + y);
      if (a && b) {
        setBit(work, left + x, top + y, 1);
        continue;
      }
      const th = bayerThreshold(x, y);
      if (a && th >= t) setBit(work, left + x, top + y, 1);
      else if (b && th < t) setBit(work, left + x, top + y, 1);
    }
  }
}

let host: CanvasUIHost | null = null;
let running = false;
let overlayWork: BitMap | null = null;

export function bindMorphHost(next: CanvasUIHost): void {
  host = next;
}

function copyBitMap(src: BitMap): BitMap {
  const dest = newBitMap(bitMapWidth(src), bitMapHeight(src));
  dest.baseAddr.set(src.baseAddr);
  return dest;
}

function captureOverlay(): BitMap | null {
  return running && overlayWork ? copyBitMap(overlayWork) : null;
}

function retargetMorph(): void {
  if (!running) return;
  transitionTo(() => {});
}

function clipOf(ui: CanvasUIHost): { x: number; y: number; width: number; height: number } | null {
  const node = ui.ui.inspect().find((n) => n.name === MORPH_CLIP);
  if (!node || node.bounds.width < 2 || node.bounds.height < 2) return null;
  return node.bounds;
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sameSize(a: BitMap, b: BitMap): boolean {
  return bitMapWidth(a) === bitMapWidth(b) && bitMapHeight(a) === bitMapHeight(b);
}

function finish(): void {
  running = false;
  overlayWork = null;
  host?.setOverlay(null);
}

export function transitionTo(apply: () => void): void {
  if (!host || prefersReducedMotion() || pageTransition() === "none") {
    finish();
    apply();
    return;
  }

  const fromOverlay = captureOverlay();
  host.paint();
  const fromClip = clipOf(host);
  if (!fromClip) {
    finish();
    apply();
    return;
  }
  const from =
    fromOverlay && bitMapWidth(fromOverlay) === fromClip.width && bitMapHeight(fromOverlay) === fromClip.height
      ? fromOverlay
      : host.snapshotRect(fromClip.x, fromClip.y, fromClip.width, fromClip.height);
  apply();
  host.paint();
  const toClip = clipOf(host);
  if (!toClip || toClip.width !== fromClip.width || toClip.height !== fromClip.height) {
    finish();
    return;
  }
  const to = host.snapshotRect(toClip.x, toClip.y, toClip.width, toClip.height);
  if (!sameSize(from, to)) {
    finish();
    return;
  }

  const mode = pageTransition();
  const work = newBitMap(fromClip.width, fromClip.height);
  const started = performance.now();
  running = true;
  overlayWork = work;

  if (mode === "dither") {
    host.setOverlay({
      bitmap: work,
      x: toClip.x,
      y: toClip.y,
      tick: () => {
        const t = Math.min(1, (performance.now() - started) / TRANSITION_MS);
        paintDitherDissolve(work, from, to, t);
        if (t >= 1) finish();
      },
    });
    return;
  }

  const { stay, movingFrom, movingTo } = splitStationary(sortInk(collectInk(from)), sortInk(collectInk(to)));
  if (movingFrom.length < 2 && movingTo.length < 2) {
    finish();
    return;
  }
  const particles = pairInk(movingFrom, movingTo, fromClip.height, MORPH_VARIANT, MORPH_EXTRAS, fromClip.width);

  host.setOverlay({
    bitmap: work,
    x: toClip.x,
    y: toClip.y,
    tick: () => {
      const t = Math.min(1, (performance.now() - started) / TRANSITION_MS);
      paintMorph(work, particles, t, MORPH_VARIANT, stay);
      if (t >= 1) finish();
    },
  });
}
