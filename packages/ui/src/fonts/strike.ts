/**
 * Decker → `FontStrike` and the host `_SwapFont`.
 *
 * Family numbering, size fallback, baseline (ascent = glyph cell height),
 * and style synthesis live here — not in `@mockintosh/quickdraw`.
 * UI FontInfo alignment uses `faceMetrics` in `metrics.ts`; do not point
 * this seam at those numbers or every QuickDraw glyph shifts.
 */

import type { FMInput, FMOutput, FontStrike } from "@mockintosh/quickdraw";
import {
  bold,
  italic,
  outline,
  shadow,
  underline,
  globals,
} from "@mockintosh/quickdraw";
import { rowBytesFor, setBit } from "@mockintosh/quickdraw/bits";
import {
  getGlyphIndexForChar,
  getGlyphPixel,
  getGlyphWidth,
  hasGlyph,
  ordinalForCharCode,
  type DeckerFont,
} from "./font";
import { getFont, requireFont } from "./registry";
import { resolveFont } from "./style";

/** `txFont` ids. 0 is the system font (`body`), matching InitPort. */
export const UI_FONT_FAMILY = {
  body: 0,
  menu: 1,
  mono: 2,
} as const;

const FAMILY_NAMES = ["body", "menu", "mono"] as const;
const extraFamilies = new Map<string, number>();
let nextFamilyId = 3;

/** Extra scanlines below the baseline so `DrText` underline (descent ≥ 2) can paint. */
export const STRIKE_DESCENT = 2;

/**
 * `DrawText.a` shears `italic/16` px per row from the bottom. `ascent >> 3`
 * is 1 on Geneva 9 / Chicago 12, so a 12–15px strike never accumulates a
 * whole pixel. Bump the slope so the top of the strike moves at least
 * `minSlantPx` (Pixel still uses `ascent >> 3` when that is steeper).
 */
export function italicShearUnits(
  ascent: number,
  descent: number,
  minSlantPx: number = 2
): number {
  const rows = Math.max(1, ascent + descent - 2);
  const visible = Math.ceil((minSlantPx << 4) / rows);
  return Math.max(1, ascent >> 3, visible);
}

export interface UiFontMetrics {
  ascent: number;
  descent: number;
  leading: number;
  widMax: number;
  nativeSize: number;
}

export function fontFamilyId(name: string): number {
  if (name === "menu") return UI_FONT_FAMILY.menu;
  if (name === "mono") return UI_FONT_FAMILY.mono;
  if (name === "body" || !name) return UI_FONT_FAMILY.body;
  let id = extraFamilies.get(name);
  if (id === undefined) {
    id = nextFamilyId++;
    extraFamilies.set(name, id);
  }
  return id;
}

export function fontFamilyName(id: number): string {
  if (id >= 0 && id < FAMILY_NAMES.length) return FAMILY_NAMES[id]!;
  for (const [name, fid] of extraFamilies) if (fid === id) return name;
  return "body";
}

/** QuickDraw strike metrics. Baseline is the bottom of the Decker cell. */
export function uiFontMetrics(font: DeckerFont): UiFontMetrics {
  return {
    ascent: font.glyphHeight,
    descent: STRIKE_DESCENT,
    leading: 0,
    widMax: font.maxWidth + font.spacing,
    nativeSize: font.size ?? font.glyphHeight,
  };
}

export function fontAscent(fontName: string, size?: number): number {
  return uiFontMetrics(requireFont(fontName, size)).ascent;
}

/** Map a JS string to Decker/MacRoman ordinals for `DrawText`. */
export function encodeUiText(font: DeckerFont, text: string): number[] {
  const out: number[] = new Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const idx = getGlyphIndexForChar(font, text[i]!);
    out[i] = idx < 0 ? 0 : idx;
  }
  return out;
}

const strikeCache = new WeakMap<DeckerFont, FontStrike>();

function ordinalAdvance(font: DeckerFont, ord: number): number {
  const idx = hasGlyph(font, ord) ? ord : hasGlyph(font, 63) ? 63 : -1;
  if (idx < 0) return 0;
  return getGlyphWidth(font, idx) + font.spacing;
}

/**
 * Pack every Decker glyph into a Macintosh kerned strike.
 * Baseline is the bottom of the Decker cell (`ascent = glyphHeight`).
 */
export function deckerToStrike(font: DeckerFont): FontStrike {
  const cached = strikeCache.get(font);
  if (cached) return cached;

  const metrics = uiFontMetrics(font);
  const firstChar = 0;
  const lastChar = 255;
  const slots = lastChar - firstChar + 3;
  const locTable = new Int16Array(slots);
  const owTable = new Int16Array(slots);
  const columns: number[] = new Array(256);
  let col = 0;
  for (let ch = 0; ch < 256; ch++) {
    const gw = hasGlyph(font, ch) ? getGlyphWidth(font, ch) : 0;
    locTable[ch] = col;
    columns[ch] = col;
    if (gw > 0) {
      owTable[ch] = gw & 0xff;
      col += gw;
    } else {
      owTable[ch] = 0x8000;
    }
  }
  const qCol = hasGlyph(font, 63) ? columns[63]! : col;
  const qW = hasGlyph(font, 63) ? getGlyphWidth(font, 63) : 0;
  locTable[256] = qCol;
  locTable[257] = qCol + qW;
  owTable[256] = qW > 0 ? qW & 0xff : 0x8000;
  owTable[257] = 0x8000;

  const fRectWidth = Math.max(1, col);
  const fRectHeight = metrics.ascent + metrics.descent;
  const rowBytes = rowBytesFor(fRectWidth);
  const rowWords = rowBytes >> 1;
  const bitImage = new Uint8Array(rowBytes * fRectHeight);
  const scratch = {
    baseAddr: bitImage,
    rowBytes,
    bounds: { top: 0, left: 0, bottom: fRectHeight, right: rowWords * 16 },
  };

  for (let ch = 0; ch < 256; ch++) {
    const gw = hasGlyph(font, ch) ? getGlyphWidth(font, ch) : 0;
    if (gw <= 0) continue;
    const x0 = columns[ch]!;
    for (let y = 0; y < font.glyphHeight; y++) {
      for (let x = 0; x < gw; x++) {
        if (getGlyphPixel(font, ch, x, y)) setBit(scratch, x0 + x, y, 1);
      }
    }
  }

  const strike: FontStrike = {
    fontType: 0,
    firstChar,
    lastChar,
    widMax: metrics.widMax,
    kernMax: 0,
    nDescent: -metrics.descent,
    fRectWidth,
    fRectHeight,
    ascent: metrics.ascent,
    descent: metrics.descent,
    leading: metrics.leading,
    rowWords,
    bitImage,
    locTable,
    owTable,
  };
  strikeCache.set(font, strike);
  return strike;
}

function synthesis(face: number, ascent: number): {
  bold: number;
  italic: number;
  ulOffset: number;
  ulShadow: number;
  ulThick: number;
  shadow: number;
  extra: number;
} {
  let boldPx = 0;
  let extra = 0;
  let italicPx = 0;
  let ulOffset = 0;
  let ulShadow = 0;
  let ulThick = 0;
  let shadowPx = 0;
  if (face & outline) {
    // Strike is already a hollow ring (`outlineDeckerFont`), including any
    // bold smear. Do not also run DrawText's outline/bold extras.
    italicPx = face & italic ? italicShearUnits(ascent, STRIKE_DESCENT) : 0;
  } else {
    if (face & bold) {
      boldPx += 1;
      extra += 1;
    }
    if (face & italic) {
      italicPx = italicShearUnits(ascent, STRIKE_DESCENT);
      extra += 1;
    }
    if (face & shadow) {
      boldPx += 1;
      extra += 1;
      shadowPx = 1;
    }
  }
  if (face & underline) {
    ulOffset = 1;
    ulShadow = 1;
    ulThick = 1;
  }
  return {
    bold: boldPx,
    italic: italicPx,
    ulOffset,
    ulShadow,
    ulThick,
    shadow: shadowPx,
    extra,
  };
}

/**
 * Host `_SwapFont`: map family/size/face onto a cached Decker strike.
 * `spExtra` is folded into `widthTable[32]` as the original Font Manager did.
 */
export function hostSwapFont(inRec: FMInput): FMOutput {
  const name = fontFamilyName(inRec.family);
  const requested = inRec.size | 0;
  const size = requested > 0 ? requested : undefined;
  const font =
    inRec.face & outline
      ? resolveFont(name, {
          bold: Boolean(inRec.face & bold),
          italic: Boolean(inRec.face & italic),
          outline: true,
        }, size)
      : getFont(name, size) ?? requireFont("body");
  const metrics = uiFontMetrics(font);
  const strike = deckerToStrike(font);
  const syn = synthesis(inRec.face, metrics.ascent);

  let numer = { h: inRec.numer.h, v: inRec.numer.v };
  let denom = { h: inRec.denom.h, v: inRec.denom.v };
  const native = font.size ?? metrics.nativeSize;
  if (requested > 0 && requested !== native) {
    numer = { h: (inRec.numer.h * requested) | 0, v: (inRec.numer.v * requested) | 0 };
    denom = { h: (inRec.denom.h * native) | 0, v: (inRec.denom.v * native) | 0 };
  }

  const widthTable = new Int32Array(256);
  const extraFixed = (syn.extra | 0) << 16;
  for (let ch = 0; ch < 256; ch++) {
    widthTable[ch] = ((ordinalAdvance(font, ch) << 16) + extraFixed) | 0;
  }
  // Font Manager folds `thePort^.spExtra` into the space slot (`Text.a` / plan §3.7).
  if (globals.thePort) {
    widthTable[32] = (widthTable[32]! + (globals.thePort.spExtra | 0)) | 0;
  }

  return {
    errNum: 0,
    fontHandle: strike,
    bold: syn.bold,
    italic: syn.italic,
    ulOffset: syn.ulOffset,
    ulShadow: syn.ulShadow,
    ulThick: syn.ulThick,
    shadow: syn.shadow,
    extra: syn.extra,
    ascent: metrics.ascent & 0xff,
    descent: metrics.descent & 0xff,
    widMax: metrics.widMax & 0xff,
    leading: metrics.leading,
    unused: 0,
    numer,
    denom,
    widthTable,
  };
}
