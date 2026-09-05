/**
 * Text block layout — breaks a string into lines for a given font.
 *
 * This is the single source of truth for line breaking. `measure.ts` uses it
 * to size `<text>` nodes and `draw.ts` uses it to paint them, so measured and
 * drawn geometry can never disagree.
 */

import { measureDeckerText, type DeckerFont } from "./font";

export interface TextLine {
  text: string;
  /** Advance width of the line in pixels (includes trailing glyph spacing). */
  width: number;
}

export interface TextBlock {
  lines: TextLine[];
  /** Widest line. */
  width: number;
  /** `lines.length * lineHeight`. */
  height: number;
  /** Vertical advance per line (the font's glyph height). */
  lineHeight: number;
}

/**
 * Lay out `text` into lines.
 *
 * - Explicit `\n` always breaks a line.
 * - When `maxWidth` is given, paragraphs are greedily word-wrapped to fit.
 *   A single word wider than `maxWidth` is broken between characters so a
 *   line never exceeds the limit.
 * - Without `maxWidth`, each paragraph is one line.
 */
export function layoutText(
  font: DeckerFont,
  text: string,
  maxWidth?: number
): TextBlock {
  const lineHeight = font.glyphHeight;
  const lines: TextLine[] = [];
  const wrap = maxWidth !== undefined && maxWidth > 0;

  for (const paragraph of text.split("\n")) {
    if (!wrap) {
      lines.push(makeLine(font, paragraph));
      continue;
    }
    wrapParagraph(font, paragraph, maxWidth, lines);
  }

  if (lines.length === 0) lines.push({ text: "", width: 0 });

  let width = 0;
  for (const l of lines) width = Math.max(width, l.width);
  return { lines, width, height: lines.length * lineHeight, lineHeight };
}

function makeLine(font: DeckerFont, text: string): TextLine {
  return { text, width: text ? measureDeckerText(font, text).width : 0 };
}

function wrapParagraph(
  font: DeckerFont,
  paragraph: string,
  maxWidth: number,
  out: TextLine[]
): void {
  const words = paragraph.split(" ");
  let line = "";

  const flush = () => {
    out.push(makeLine(font, line));
    line = "";
  };

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (measureDeckerText(font, candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) flush();
    // Word alone overflows: break it between characters.
    if (measureDeckerText(font, word).width > maxWidth) {
      let chunk = "";
      for (const ch of word) {
        const next = chunk + ch;
        if (chunk && measureDeckerText(font, next).width > maxWidth) {
          out.push(makeLine(font, chunk));
          chunk = ch;
        } else {
          chunk = next;
        }
      }
      line = chunk;
    } else {
      line = word;
    }
  }
  flush();
}
