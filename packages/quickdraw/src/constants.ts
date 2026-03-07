/**
 * QuickDraw transfer mode constants — control how source pixels are combined
 * with destination pixels during drawing.
 *
 * Modes `0–7` operate on **source** data (e.g. `CopyBits`).
 * Modes `8–15` operate on a **pattern** (pen, background, or fill pattern).
 *
 * For each pair `srcFoo` / `notSrcFoo` (and `patFoo` / `notPatFoo`), the
 * `not` variant inverts the source/pattern pixel before applying the
 * boolean operation.
 *
 * From `reference/QuickDraw/QuickDraw.p` lines 8–23.
 */

/** Copy source pixel verbatim to destination. */
export const srcCopy = 0;
/** Destination = source OR destination. */
export const srcOr = 1;
/** Destination = source XOR destination. */
export const srcXor = 2;
/** Destination = source AND NOT destination (bit clear). */
export const srcBic = 3;
/** Destination = NOT source. */
export const notSrcCopy = 4;
/** Destination = NOT source OR destination. */
export const notSrcOr = 5;
/** Destination = NOT source XOR destination. */
export const notSrcXor = 6;
/** Destination = NOT source AND NOT destination. */
export const notSrcBic = 7;
/** Copy pattern pixel verbatim to destination. */
export const patCopy = 8;
/** Destination = pattern OR destination. */
export const patOr = 9;
/** Destination = pattern XOR destination. */
export const patXor = 10;
/** Destination = pattern AND NOT destination. */
export const patBic = 11;
/** Destination = NOT pattern. */
export const notPatCopy = 12;
/** Destination = NOT pattern OR destination. */
export const notPatOr = 13;
/** Destination = NOT pattern XOR destination. */
export const notPatXor = 14;
/** Destination = NOT pattern AND NOT destination. */
export const notPatBic = 15;

/**
 * QuickDraw colour-separation bit-plane constants.
 * Used with {@link GrafPort.colrBit} to select which colour channel to render.
 * From `reference/QuickDraw/QuickDraw.p` lines 27–44.
 */
export const normalBit = 0;
export const inverseBit = 1;
export const redBit = 4;
export const greenBit = 3;
export const blueBit = 2;
export const cyanBit = 8;
export const magentaBit = 7;
export const yellowBit = 6;
export const blackBit = 5;

/**
 * Predefined colour values for {@link ForeColor} / {@link BackColor}.
 * These are the classic QuickDraw logical colours.
 */
export const blackColor = 33;
export const whiteColor = 30;
export const redColor = 205;
export const greenColor = 341;
export const blueColor = 409;
export const cyanColor = 273;
export const magentaColor = 137;
export const yellowColor = 69;

/** Standard picture comment opcode: open grouping `(`. */
export const picLParen = 0;
/** Standard picture comment opcode: close grouping `)`. */
export const picRParen = 1;

/**
 * GrafVerb numeric values — passed to all shape-drawing bottleneck procedures.
 * From `reference/QuickDraw/GrafTypes.a`.
 */
/** Draw the outline of a shape using the current pen. */
export const FRAME = 0;
/** Fill the interior of a shape with the current pen pattern. */
export const PAINT = 1;
/** Fill the interior of a shape with the background pattern. */
export const ERASE = 2;
/** Invert every pixel inside a shape (XOR). */
export const INVERT = 3;
/** Fill the interior of a shape with an explicit pattern argument. */
export const FILL = 4;
