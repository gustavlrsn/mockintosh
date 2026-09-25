/**
 * Diagnostic pages. The test page prints a line of plain text, a solid raster
 * bar, then more text, so whichever parts come out tell text support apart
 * from raster (`GS v 0`) support. The cut test ends in one cut command; the
 * tuning sample shows how a speed / heat setting renders greys and solids.
 */
import { newBitMap } from "@mockintosh/quickdraw/bits";
import type { BitMap } from "@mockintosh/quickdraw";
import {
  ESCPOS_CUT_COMMANDS,
  type EscPosCutCommand,
  type EscPosTuningPreset,
  type PrinterProfile,
} from "./encoder";
import { EscPosEncoder } from "./escpos";
import { encoderForProfile, escPosOptionsForProfile } from "./factory";

const BAR_ROWS = 48;
const FEED_BEFORE_CUT = 124;

export function testPageBytes(profile: PrinterProfile, paperWidth = profile.dots): Uint8Array {
  const bar = newBitMap(paperWidth, BAR_ROWS);
  bar.baseAddr.fill(0xff);

  if (profile.dialect !== "escpos") {
    return encoderForProfile(profile).begin().raster(bar).feed(FEED_BEFORE_CUT).cut().end();
  }
  return new EscPosEncoder(escPosOptionsForProfile(profile))
    .begin()
    .text("Mockintosh test page")
    .text(`${profile.name}, ${paperWidth} dots`)
    .text("A black bar should follow:")
    .raster(bar)
    .text("If there is no bar, the printer")
    .text("ignored the raster image (GS v 0).")
    .feed(FEED_BEFORE_CUT)
    .cut()
    .end();
}

/** ESC/POS `GS ( A pL pH n m` (n = 0, m = 2): the printer prints its own test page. */
export const ESCPOS_SELF_TEST = Uint8Array.of(0x1d, 0x28, 0x41, 0x02, 0x00, 0x00, 0x02);

/** How much of each line the load test's solid blocks cover. */
export const LOAD_TEST_FRACTIONS: readonly number[] = [0.25, 0.5, 1];
const LOAD_BLOCK_ROWS = 48;

/** A solid block `fraction` of `width` wide, centred. */
export function loadBlockBitmap(width: number, fraction: number): BitMap {
  const bits = newBitMap(width, LOAD_BLOCK_ROWS);
  const blockWidth = Math.round(width * fraction);
  const left = Math.floor((width - blockWidth) / 2);
  for (let y = 0; y < LOAD_BLOCK_ROWS; y++) {
    for (let x = left; x < left + blockWidth; x++) bits.baseAddr[y * bits.rowBytes + (x >> 3)]! |= 0x80 >> (x & 7);
  }
  return bits;
}

/**
 * Solid blocks covering a quarter, half and all of each line. If the narrow
 * ones print deep black and the full one grey, the printer gives lines with
 * many black dots less heat (or runs short of current). No cut.
 */
export function loadTestBytes(profile: PrinterProfile, paperWidth = profile.dots, title = "Load test"): Uint8Array {
  if (profile.dialect !== "escpos") {
    const encoder = encoderForProfile(profile).begin();
    for (const fraction of LOAD_TEST_FRACTIONS) encoder.raster(loadBlockBitmap(paperWidth, fraction)).feed(16);
    return encoder.end();
  }
  const encoder = new EscPosEncoder(escPosOptionsForProfile(profile)).begin().text(title);
  for (const fraction of LOAD_TEST_FRACTIONS) {
    encoder.text(`${Math.round(fraction * 100)}% of the line black:`).raster(loadBlockBitmap(paperWidth, fraction)).feed(8);
  }
  return encoder.feed(24).end();
}

/** A short ESC/POS slip that ends in `command`, to find the cut command a printer obeys. */
export function cutTestBytes(command: EscPosCutCommand): Uint8Array {
  const label = ESCPOS_CUT_COMMANDS.find((c) => c.command === command)?.label ?? command;
  return new EscPosEncoder({ cutCommand: command })
    .begin()
    .text(`Cut test: ${label}`)
    .text("The paper should be cut below.")
    .feed(FEED_BEFORE_CUT)
    .cut()
    .end();
}

const GREY_STEPS = 8;
const GREY_STEP_ROWS = 16;
const SOLID_ROWS = 32;

/** 4×4 Bayer thresholds, 0–15. */
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/**
 * A strip for judging print quality: eight ordered-dither steps from white to
 * black (banding and heat evenness), then a solid block (darkness, and whether
 * a heavy load slows or streaks the print).
 */
export function tuningSampleBitmap(width: number): BitMap {
  const rows = GREY_STEPS * GREY_STEP_ROWS + SOLID_ROWS;
  const bits = newBitMap(width, rows);
  for (let y = 0; y < rows; y++) {
    const step = Math.floor(y / GREY_STEP_ROWS);
    // Coverage in sixteenths: step 0 is white, the last grey step 14/16, then solid.
    const coverage = step >= GREY_STEPS ? 16 : Math.round((step * 16) / GREY_STEPS);
    const row = y * bits.rowBytes;
    for (let x = 0; x < width; x++) {
      if (BAYER_4[(y % 4) * 4 + (x % 4)]! < coverage) bits.baseAddr[row + (x >> 3)]! |= 0x80 >> (x & 7);
    }
  }
  return bits;
}

/** Common head widths in dots at 203 dpi: 58 mm rolls print 384, 80 mm rolls 512–640. */
export const WIDTH_TEST_DOTS: readonly number[] = [384, 432, 512, 576, 640];

const WIDTH_STRIP_ROWS = 24;
const WIDTH_END_DOTS = 16;

/** A strip `width` dots wide: a solid block at each end joined by a line. */
export function widthStripBitmap(width: number): BitMap {
  const bits = newBitMap(width, WIDTH_STRIP_ROWS);
  const set = (x: number, y: number) => {
    bits.baseAddr[y * bits.rowBytes + (x >> 3)]! |= 0x80 >> (x & 7);
  };
  for (let y = 0; y < WIDTH_STRIP_ROWS; y++) {
    const onLine = y >= WIDTH_STRIP_ROWS / 2 - 1 && y <= WIDTH_STRIP_ROWS / 2;
    for (let x = 0; x < width; x++) {
      if (onLine || x < WIDTH_END_DOTS || x >= width - WIDTH_END_DOTS) set(x, y);
    }
  }
  return bits;
}

/**
 * The paper-width test: one strip per candidate width, narrowest first. The
 * widest strip whose right-hand block prints whole is the printer's dots per
 * line. ESC/POS printers label each strip; cat printers can't print text, so
 * count strips instead.
 */
export function widthTestBytes(profile: PrinterProfile, candidates: readonly number[] = WIDTH_TEST_DOTS): Uint8Array {
  if (profile.dialect !== "escpos") {
    const encoder = encoderForProfile(profile).begin();
    for (const width of candidates) encoder.raster(widthStripBitmap(width)).feed(16);
    return encoder.feed(64).end();
  }
  const encoder = new EscPosEncoder({ ...escPosOptionsForProfile(profile), rasterLeadInRows: 0 })
    .begin()
    .text("Paper width test")
    .text("Pick the widest strip with both end blocks whole.");
  for (const width of candidates) {
    encoder.text(`${width} dots (${Math.round((width / 203) * 25.4)} mm)`).raster(widthStripBitmap(width)).feed(8);
  }
  return encoder.feed(FEED_BEFORE_CUT).end();
}

/**
 * The quality sample under one tuning preset. No cut, so successive samples
 * stay on one strip for side-by-side comparison.
 */
export function tuningSampleBytes(preset: EscPosTuningPreset, profile: PrinterProfile, paperWidth = profile.dots): Uint8Array {
  const encoder = new EscPosEncoder({ ...escPosOptionsForProfile(profile), tuning: preset.tuning ?? undefined });
  return encoder
    .begin()
    .text(preset.label)
    .raster(tuningSampleBitmap(paperWidth))
    .feed(24)
    .end();
}
