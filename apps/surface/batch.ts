import { ExprError, compileSurface } from "./expr";

/** A batch this long is almost certainly a typo, and a lot of paper. */
export const MAX_BATCH_PRINTS = 100;

/** The `t` of every print in a batch, or why there is no batch. */
export type BatchPlan = { ok: true; times: number[] } | { ok: false; reason: string };

/** Floating-point slack so an end that is a whole number of steps away is included. */
const EPSILON = 1e-9;

/**
 * Read a constant such as `0.5`, `pi/4` or `2pi`. `null` when the text isn't
 * one — including expressions in `x`, `y` or `t`, which have no single value.
 */
export function parseConstant(text: string): number | null {
  if (!text.trim()) return null;
  try {
    const { fn } = compileSurface(text);
    const value = fn(0, 0, 0);
    if (!Number.isFinite(value) || fn(1.7, -2.3, 3.1) !== value) return null;
    return value;
  } catch (err) {
    if (err instanceof ExprError) return null;
    throw err;
  }
}

/**
 * Times from `start` to `end`, `step` apart, both ends included. `end` only
 * counts when a whole number of steps reaches it; a step pointing away from
 * `end` is an error rather than an empty batch.
 */
export function planBatch(start: number, stepText: string, endText: string): BatchPlan {
  const step = parseConstant(stepText);
  if (step === null) return { ok: false, reason: "Step must be a number" };
  const end = parseConstant(endText);
  if (end === null) return { ok: false, reason: "End t must be a number" };
  const span = end - start;
  if (Math.abs(span) < EPSILON) return { ok: true, times: [start] };
  if (step === 0 || Math.sign(step) !== Math.sign(span)) {
    return { ok: false, reason: span > 0 ? "Step must be above 0" : "Step must be below 0 to go back" };
  }
  const count = Math.floor(span / step + EPSILON) + 1;
  if (count > MAX_BATCH_PRINTS) return { ok: false, reason: `${count} prints; at most ${MAX_BATCH_PRINTS}` };
  return { ok: true, times: Array.from({ length: count }, (_, i) => start + i * step) };
}
