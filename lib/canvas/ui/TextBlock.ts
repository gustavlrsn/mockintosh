import { FontName, getWrappedLines, resolveLineBox } from "../fontAdapter";
export { getWrappedLines } from "../fontAdapter";

export interface TextBlockOptions {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  font?: FontName;
  spacing?: number;
  color?: number;
  lineHeight?: number;
  lineSpacing?: number;
}

/**
 * Compute the total height of a text block without drawing it.
 */
export function measureTextBlock(
  text: string,
  maxWidth: number,
  font: FontName = "body",
  lineSpacing: number = 0,
  spacing: number = 0,
  lineHeight?: number
): number {
  const lineH = resolveLineBox(font, { lineHeight, lineSpacing }).lineHeight;
  const lines = getWrappedLines(text, maxWidth, font, spacing);
  return lines.length * lineH;
}
