import {
  DECKER_ELLIPSIS,
  DeckerFont,
  FontName,
  getGlyphIndexForChar,
  getGlyphWidth,
} from "./DeckerFont";

export type TextAlign = "left" | "center" | "right";

export interface DeckerTextLayoutLine {
  text: string;
  width: number;
}

export interface DeckerTextLayoutResult {
  lines: DeckerTextLayoutLine[];
  width: number;
  height: number;
}

function charWidth(font: DeckerFont, ch: string): number {
  return getGlyphWidth(font, getGlyphIndexForChar(font, ch)) + font.spacing;
}

function trimSoftWrapLeadingSpace(
  line: string,
  width: number,
  font: DeckerFont
): DeckerTextLayoutLine {
  if (!line.startsWith(" ")) return { text: line, width };
  const adjustedWidth = Math.max(0, width - charWidth(font, " "));
  return { text: line.slice(1), width: adjustedWidth };
}

function truncateLineToWidth(
  line: string,
  font: DeckerFont,
  maxWidth: number
): DeckerTextLayoutLine {
  const ellipsisWidth = charWidth(font, DECKER_ELLIPSIS);
  if (maxWidth <= ellipsisWidth) {
    return { text: DECKER_ELLIPSIS, width: ellipsisWidth };
  }

  let width = 0;
  let text = "";
  for (let i = 0; i < line.length; i++) {
    const nextWidth = charWidth(font, line[i]);
    if (width + nextWidth + ellipsisWidth > maxWidth) break;
    text += line[i];
    width += nextWidth;
  }
  return { text: `${text}${DECKER_ELLIPSIS}`, width: width + ellipsisWidth };
}

export function layoutPlainText(
  text: string,
  font: DeckerFont,
  align: TextAlign,
  maxWidth: number,
  maxHeight: number = Number.POSITIVE_INFINITY
): DeckerTextLayoutResult {
  const maxLines = Math.max(1, Math.floor(maxHeight / font.glyphHeight) || 1);
  const lines: DeckerTextLayoutLine[] = [];
  const paragraphs = text.split("\n");

  const pushLine = (lineText: string, lineWidth: number) => {
    if (lines.length >= maxLines) return;
    lines.push({ text: lineText, width: lineWidth });
  };

  for (let p = 0; p < paragraphs.length; p++) {
    const paragraph = paragraphs[p];
    if (paragraph.length === 0) {
      pushLine("", 0);
      if (lines.length >= maxLines) break;
      continue;
    }

    let line = "";
    let lineWidth = 0;
    let word = "";
    let wordWidth = 0;

    const flushWord = () => {
      if (!word) return;

      if (lineWidth + wordWidth >= maxWidth && lineWidth > 0) {
        pushLine(line, lineWidth);
        if (lines.length >= maxLines) return;
        const trimmed = trimSoftWrapLeadingSpace(word, wordWidth, font);
        line = trimmed.text;
        lineWidth = trimmed.width;
      } else {
        line += word;
        lineWidth += wordWidth;
      }

      while (lineWidth >= maxWidth && line.length > 0) {
        let chunk = "";
        let chunkWidth = 0;
        let index = 0;
        while (index < line.length) {
          const nextWidth = charWidth(font, line[index]);
          if (chunkWidth + nextWidth >= maxWidth && chunk.length > 0) break;
          chunk += line[index];
          chunkWidth += nextWidth;
          index += 1;
        }
        pushLine(chunk, chunkWidth);
        if (lines.length >= maxLines) return;
        line = line.slice(index);
        lineWidth -= chunkWidth;
      }

      word = "";
      wordWidth = 0;
    };

    for (let i = 0; i < paragraph.length; i++) {
      const ch = paragraph[i];
      word += ch;
      wordWidth += charWidth(font, ch);
      if (ch === " ") flushWord();
      if (lines.length >= maxLines) break;
    }
    if (lines.length >= maxLines) break;
    flushWord();
    if (lines.length >= maxLines) break;
    pushLine(line, lineWidth);
    if (lines.length >= maxLines) break;
  }

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }

  if (lines.length === maxLines && paragraphs.length > 0) {
    const remainingSource = text.split("\n").join("\n");
    const reconstructed = lines.map((line) => line.text).join("\n");
    if (remainingSource.length > reconstructed.length && lines.length > 0) {
      lines[lines.length - 1] = truncateLineToWidth(
        lines[lines.length - 1].text,
        font,
        maxWidth
      );
    }
  }

  const width = lines.reduce((max, line) => Math.max(max, line.width), 0);
  return {
    lines:
      align === "left"
        ? lines
        : lines.map((line) => ({
            text: line.text,
            width: line.width,
          })),
    width,
    height: Math.max(font.glyphHeight, lines.length * font.glyphHeight),
  };
}

export function alignTextX(
  align: TextAlign,
  boxX: number,
  boxWidth: number,
  lineWidth: number
): number {
  if (align === "center") return boxX + Math.floor((boxWidth - lineWidth) / 2);
  if (align === "right") return boxX + boxWidth - lineWidth;
  return boxX;
}

export type { FontName };
