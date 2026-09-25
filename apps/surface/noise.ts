/**
 * Seeded gradient noise (Perlin's improved noise) and the fractal sums built
 * on it. Everything is deterministic for a seed, so a plot, its print and a
 * saved picture all show the same landscape.
 */

/** A noise field for one seed. Values are roughly in [-1, 1]. */
export interface NoiseField {
  readonly seed: number;
  noise(x: number, y: number, z: number): number;
  /** Fractal Brownian motion: `octaves` layers of noise, each twice as fine and half as strong. */
  fbm(x: number, y: number, z: number, octaves: number): number;
  /** Sharp crests where the noise crosses zero, like mountain ridges or canyons. */
  ridged(x: number, y: number, z: number, octaves: number): number;
  /** Summed absolute noise: billowy, cloud-like bumps, all ≥ 0. */
  turb(x: number, y: number, z: number, octaves: number): number;
}

export const DEFAULT_OCTAVES = 5;
export const MAX_OCTAVES = 10;

const LACUNARITY = 2;
const GAIN = 0.5;

/** mulberry32: a tiny, good-enough PRNG for shuffling the permutation table. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function permutation(seed: number): Uint8Array {
  const next = random(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const swap = p[i]!;
    p[i] = p[j]!;
    p[j] = swap;
  }
  const doubled = new Uint8Array(512);
  for (let i = 0; i < 512; i++) doubled[i] = p[i & 255]!;
  return doubled;
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + t * (b - a);

/** Dot product with one of the 12 cube-edge gradients. */
function grad(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function clampOctaves(octaves: number): number {
  if (!Number.isFinite(octaves)) return DEFAULT_OCTAVES;
  return Math.max(1, Math.min(MAX_OCTAVES, Math.round(octaves)));
}

export function createNoiseField(seed: number): NoiseField {
  const p = permutation(seed);
  // Gradient noise is exactly 0 on the integer lattice, which the plot grid
  // samples; shifting by a fraction keeps those zeros from lining up.
  const next = random(seed ^ 0x9e3779b9);
  const ox = 0.2 + next() * 0.6;
  const oy = 0.2 + next() * 0.6;
  const oz = 0.2 + next() * 0.6;

  function lattice(x: number, y: number, z: number): number {
    const fx = Math.floor(x);
    const fy = Math.floor(y);
    const fz = Math.floor(z);
    const X = fx & 255;
    const Y = fy & 255;
    const Z = fz & 255;
    x -= fx;
    y -= fy;
    z -= fz;
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = p[X]! + Y;
    const AA = p[A]! + Z;
    const AB = p[A + 1]! + Z;
    const B = p[X + 1]! + Y;
    const BA = p[B]! + Z;
    const BB = p[B + 1]! + Z;
    return lerp(
      lerp(
        lerp(grad(p[AA]!, x, y, z), grad(p[BA]!, x - 1, y, z), u),
        lerp(grad(p[AB]!, x, y - 1, z), grad(p[BB]!, x - 1, y - 1, z), u),
        v,
      ),
      lerp(
        lerp(grad(p[AA + 1]!, x, y, z - 1), grad(p[BA + 1]!, x - 1, y, z - 1), u),
        lerp(grad(p[AB + 1]!, x, y - 1, z - 1), grad(p[BB + 1]!, x - 1, y - 1, z - 1), u),
        v,
      ),
      w,
    );
  }

  /** Sum `octaves` layers of `layer`, normalized by the total amplitude. */
  function fractal(
    x: number,
    y: number,
    z: number,
    octaves: number,
    layer: (x: number, y: number, z: number) => number,
  ): number {
    let sum = 0;
    let amplitude = 1;
    let frequency = 1;
    let total = 0;
    for (let k = clampOctaves(octaves); k > 0; k--) {
      sum += amplitude * layer(x * frequency, y * frequency, z * frequency);
      total += amplitude;
      amplitude *= GAIN;
      frequency *= LACUNARITY;
    }
    return sum / total;
  }

  const ridge = (x: number, y: number, z: number) => {
    const crest = 1 - Math.abs(lattice(x, y, z));
    return crest * crest * 2 - 1;
  };
  const billow = (x: number, y: number, z: number) => Math.abs(lattice(x, y, z));

  return {
    seed,
    noise: (x, y, z) => lattice(x + ox, y + oy, z + oz),
    fbm: (x, y, z, octaves) => fractal(x + ox, y + oy, z + oz, octaves, lattice),
    ridged: (x, y, z, octaves) => fractal(x + ox, y + oy, z + oz, octaves, ridge),
    turb: (x, y, z, octaves) => fractal(x + ox, y + oy, z + oz, octaves, billow),
  };
}
