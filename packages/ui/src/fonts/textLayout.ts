/**
 * Text block layout — breaks a string into lines for a given font.
 *
 * This is the single source of truth for line breaking. `measure.ts` uses it
 * to size `<text>` nodes and `draw.ts` uses it to paint them, so measured and
 * drawn geometry can never disagree. Height here is the Decker cell block;
 * single-line `verticalAlign="middle"` then substitutes the FontInfo line
 * box (`alignmentHeight` in `metrics.ts`) in both passes.
 */

import { textAdvance, type DeckerFont } from "./font";

export interface TextLine {
  text: string;
  /** Advance width of the line in pixels (includes trailing glyph spacing). */
  width: number;
  /** Index of `text[0]` in the original string (or the break position if empty). */
  start: number;
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
  let offset = 0;

  for (const paragraph of text.split("\n")) {
    if (!wrap) {
      lines.push(makeLine(font, paragraph, offset));
    } else {
      wrapParagraph(font, paragraph, maxWidth, offset, lines);
    }
    offset += paragraph.length + 1;
  }

  if (lines.length === 0) lines.push({ text: "", width: 0, start: 0 });

  let width = 0;
  for (const l of lines) width = Math.max(width, l.width);
  return { lines, width, height: lines.length * lineHeight, lineHeight };
}

function makeLine(font: DeckerFont, text: string, start: number): TextLine {
  return { text, width: text ? textAdvance(font, text) : 0, start };
}

function wrapParagraph(
  font: DeckerFont,
  paragraph: string,
  maxWidth: number,
  paragraphStart: number,
  out: TextLine[]
): void {
  const words = paragraph.split(" ");
  let line = "";
  let lineStart = paragraphStart;
  let search = 0;

  const wordStart = (word: string): number => {
    const at = paragraph.indexOf(word, search);
    search = at + word.length + 1;
    return paragraphStart + at;
  };

  const flush = () => {
    out.push(makeLine(font, line, lineStart));
    line = "";
  };

  for (const word of words) {
    const start = wordStart(word);
    const candidate = line ? `${line} ${word}` : word;
    if (textAdvance(font, candidate) <= maxWidth) {
      if (!line) lineStart = start;
      line = candidate;
      continue;
    }
    if (line) flush();
    // Word alone overflows: break it between characters.
    if (textAdvance(font, word) > maxWidth) {
      let chunk = "";
      let chunkStart = start;
      let charIndex = 0;
      for (const ch of word) {
        const next = chunk + ch;
        if (chunk && textAdvance(font, next) > maxWidth) {
          out.push(makeLine(font, chunk, chunkStart));
          chunk = ch;
          chunkStart = start + charIndex;
        } else {
          chunk = next;
        }
        charIndex += ch.length;
      }
      line = chunk;
      lineStart = chunkStart;
    } else {
      line = word;
      lineStart = start;
    }
  }
  flush();
}

/** Caret index in `text` for a click at `x` along the line (half-glyph rule). */
export function charIndexAtX(font: DeckerFont, text: string, x: number): number {
  let accumulated = 0;
  for (let i = 0; i < text.length; i++) {
    const cw = textAdvance(font, text[i]!);
    if (x < accumulated + cw / 2) return i;
    accumulated += cw;
  }
  return text.length;
}

/** Source index in the original string for a point in a laid-out block. */
export function indexAtPoint(block: TextBlock, font: DeckerFont, x: number, y: number): number {
  if (!block.lines.length) return 0;
  const row = Math.max(0, Math.min(block.lines.length - 1, Math.floor(y / block.lineHeight)));
  const line = block.lines[row]!;
  return line.start + charIndexAtX(font, line.text, x);
}
