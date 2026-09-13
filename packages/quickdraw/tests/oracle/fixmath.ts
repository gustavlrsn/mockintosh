/**
 * BigInt oracles for the numerically-checked items in the fidelity plan.
 * These transcribe Pictures.a SCALE1/MAP1 and Util.a Random so the port
 * can be compared against the assembly, not against itself.
 */

/** SCALE1 (Pictures.a:1694-1718). */
export function scale1Oracle(coord: number, fromSize: number, toSize: number): number {
  if (fromSize === toSize) return coord;
  if (coord <= 0) return 0;
  if (fromSize === 0) throw new Error("SCALE1 divide by zero");
  const numer = (coord & 0xffff) * (toSize & 0xffff) + ((fromSize >> 1) & 0xffff);
  const result = Math.floor(numer / (fromSize & 0xffff));
  return result === 0 ? 1 : result;
}

/** MAP1 (Pictures.a:1759-1785). Half-away-from-zero on the magnitude. */
export function map1Oracle(
  coord: number,
  fromOrigin: number,
  fromSize: number,
  toOrigin: number,
  toSize: number
): number {
  let rel = coord - fromOrigin;
  if (fromSize !== toSize) {
    if (fromSize === 0) throw new Error("MAP1 divide by zero");
    const denom2 = fromSize >> 1;
    const neg = rel < 0;
    if (neg) rel = -rel;
    rel = Math.floor(((rel & 0xffff) * (toSize & 0xffff) + (denom2 & 0xffff)) / (fromSize & 0xffff));
    if (neg) rel = -rel;
  }
  return rel + toOrigin;
}

/** Util.a:119-178 16-bit-word Random, including −32768 → 0. */
export function randomStepOracle(seed: number): { seed: number; value: number } {
  const A = 16807;
  const P = 0x7fffffff;
  const lo = seed & 0xffff;
  const hi = (seed >>> 16) & 0xffff;
  const xalo = Math.imul(A, lo) >>> 0;
  const fhi = (Math.imul(A, hi) + (xalo >>> 16)) >>> 0;
  const k = ((fhi << 1) >>> 16) & 0xffff;
  let next = (xalo & 0xffff) - P + ((fhi & 0x7fff) << 16) + k;
  if (next < 0) next += P;
  next = next | 0;
  let value = (next << 16) >> 16;
  if (value === -32768) value = 0;
  return { seed: next, value };
}
