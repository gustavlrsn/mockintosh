import type { GrafPort } from "@mockintosh/quickdraw";
import {
  DrawText,
  ForeColor,
  GetPort,
  MoveTo,
  SetPort,
  TextFace,
  TextFont,
  TextMode,
  TextSize,
  blackColor,
  installFontManager,
  srcBic,
  srcOr,
  whiteColor,
} from "@mockintosh/quickdraw";
import { requireFont } from "./registry";
import { initBuiltinFonts } from "./registry";
import { encodeUiText, fontAscent, fontFamilyId, hostSwapFont, uiFontMetrics } from "./strike";
import { textAdvance } from "./font";

let bridgeInstalled = false;

/**
 * Install the Font Manager seam. Call once during createUI().
 */
export function installFontBridge(): void {
  if (bridgeInstalled) return;
  initBuiltinFonts();
  installFontManager(hostSwapFont);
  bridgeInstalled = true;
}

/**
 * Measure text width for a given font name. Same advances as `TextWidth`
 * when that font is selected and no style/scale is applied.
 */
export function measureText(text: string, fontName: string = "body"): number {
  return textAdvance(requireFont(fontName), text);
}

/**
 * Line height of a named font, in pixels — the Decker cell, used for
 * wrapping and `drawString`. Chrome that centers a label should use
 * `faceMetricsByName(name).lineHeight` / `cdefBaseline` instead.
 */
export function fontLineHeight(fontName: string = "body"): number {
  return requireFont(fontName).glyphHeight;
}

/**
 * Draw one line on `port`. `(x, y)` is the **top-left** of the line — the
 * helper adds ascent so QuickDraw's baseline `pnLoc.v` sits at the cell bottom.
 */
export function drawString(
  port: GrafPort,
  text: string,
  x: number,
  y: number,
  fontName: string = "body",
  color: number = 1
): void {
  const previous = GetPort();
  SetPort(port);
  const font = requireFont(fontName);
  TextFont(fontFamilyId(fontName));
  TextSize(0);
  TextFace(0);
  if (color) {
    ForeColor(blackColor);
    TextMode(srcOr);
  } else {
    ForeColor(whiteColor);
    TextMode(srcBic);
  }
  const bytes = encodeUiText(font, text);
  MoveTo(x, y + uiFontMetrics(font).ascent);
  DrawText(bytes, 0, bytes.length);
  if (previous) SetPort(previous);
}

export { fontAscent, fontFamilyId, encodeUiText };
