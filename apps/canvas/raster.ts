/**
 * Flatten a Canvas document to the 1-bit page `printPicture` expects.
 * Selection chrome is not part of the picture.
 */
import {
  fontLineHeight,
  getGlyphIndexForChar,
  getGlyphPixel,
  getGlyphWidth,
  measureText,
  requireFont,
  type RasterSurface,
} from "@mockintosh/ui";
import type { PrintableImage } from "@mockintosh/sdk";
import { cornerRadius, type CanvasDocument, type CanvasElement, type ShapeElement, type TextElement } from "./document";
import { fillInk, paintLine, paintOval } from "./draw";

export function rasterizeCanvas(doc: CanvasDocument, width: number, height: number): PrintableImage {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  const data = new Uint8Array(w * h);
  const page: RasterSurface = {
    port: {} as RasterSurface["port"],
    rect: { x: 0, y: 0, width: w, height: h },
    setPixel(x, y, ink) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      data[y * w + x] = ink ? 1 : 0;
    },
    blitPixels() {},
    fill(ink) {
      data.fill(ink ? 1 : 0);
    },
  };
  for (const el of doc.elements) paintElement(page, data, w, h, el);
  return { width: w, height: h, data };
}

function paintElement(
  page: RasterSurface,
  data: Uint8Array,
  pageW: number,
  pageH: number,
  el: CanvasElement,
): void {
  if (el.type === "oval") {
    paintOval(clipped(page, el), el);
    return;
  }
  if (el.type === "line") {
    paintLine(clipped(page, el), el);
    return;
  }
  if (el.type === "text") {
    paintText(data, pageW, pageH, el);
    return;
  }
  paintBox(data, pageW, pageH, el);
}

/** `setPixel` on this surface is in the element's box, and it clips to the page. */
function clipped(page: RasterSurface, el: ShapeElement): RasterSurface {
  return {
    port: page.port,
    rect: { x: el.x, y: el.y, width: el.width, height: el.height },
    setPixel(x, y, ink) {
      page.setPixel(el.x + x, el.y + y, ink);
    },
    blitPixels() {},
    fill() {},
  };
}

function insideBox(x: number, y: number, el: ShapeElement): boolean {
  if (x < 0 || y < 0 || x >= el.width || y >= el.height) return false;
  if (el.type !== "roundrect") return true;
  const r = cornerRadius(el);
  const inCornerX = x < r || x >= el.width - r;
  const inCornerY = y < r || y >= el.height - r;
  if (!inCornerX || !inCornerY) return true;
  const cx = x < r ? r : el.width - 1 - r;
  const cy = y < r ? r : el.height - 1 - r;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function paintBox(data: Uint8Array, pageW: number, pageH: number, el: ShapeElement): void {
  for (let y = 0; y < el.height; y++) {
    for (let x = 0; x < el.width; x++) {
      if (!insideBox(x, y, el)) continue;
      const px = el.x + x;
      const py = el.y + y;
      if (px < 0 || py < 0 || px >= pageW || py >= pageH) continue;
      const ink = fillInk(el.fill, px, py);
      if (ink !== null) data[py * pageW + px] = ink;
      if (!el.stroke) continue;
      let edge = false;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        if (!insideBox(x + dx, y + dy, el)) {
          edge = true;
          break;
        }
      }
      if (edge) data[py * pageW + px] = 1;
    }
  }
}

function paintText(data: Uint8Array, pageW: number, pageH: number, el: TextElement): void {
  const font = requireFont(el.font);
  const lineH = Math.max(font.glyphHeight, fontLineHeight(el.font));
  let y = el.y;
  for (const line of wrapLines(el.text, el.font, el.width)) {
    if (y >= el.y + el.height || y >= pageH) break;
    const lineW = measureText(line, el.font);
    let x = el.x;
    if (el.align === "center") x += Math.floor((el.width - lineW) / 2);
    if (el.align === "right") x += el.width - lineW;
    for (const ch of line) {
      const glyph = getGlyphIndexForChar(font, ch);
      const gw = getGlyphWidth(font, glyph);
      for (let gy = 0; gy < font.glyphHeight; gy++) {
        const py = y + gy;
        if (py < el.y || py >= el.y + el.height || py < 0 || py >= pageH) continue;
        for (let gx = 0; gx < gw; gx++) {
          const px = x + gx;
          if (px < el.x || px >= el.x + el.width || px < 0 || px >= pageW) continue;
          if (getGlyphPixel(font, glyph, gx, gy)) data[py * pageW + px] = 1;
        }
      }
      x += gw + font.spacing;
    }
    y += lineH;
  }
}

function wrapLines(text: string, font: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (line && measureText(next, font) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}
