import { FontName, measureText, getLineHeight } from "../fontAdapter";

export interface TextBlockOptions {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  font?: FontName;
  color?: number;
  lineSpacing?: number;
}

interface CachedLayout {
  lines: string[];
}

const _cache = new Map<string, CachedLayout>();
const MAX_CACHE_SIZE = 64;

export function getWrappedLines(
  text: string,
  maxWidth: number,
  font: FontName
): string[] {
  const key = `${font}:${maxWidth}:${text}`;
  const cached = _cache.get(key);
  if (cached) return cached.lines;

  const lines = wrapText(text, maxWidth, font);
  _cache.set(key, { lines });

  if (_cache.size > MAX_CACHE_SIZE) {
    const first = _cache.keys().next().value;
    if (first !== undefined) _cache.delete(first);
  }

  return lines;
}

function wrapText(text: string, maxWidth: number, font: FontName): string[] {
  const result: string[] = [];
  const paragraphs = text.split("\n");
  for (const para of paragraphs) {
    if (!para.trim()) {
      result.push("");
      continue;
    }
    const words = para.split(" ");
    let current = "";
    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (measureText(test, font) > maxWidth && current) {
        result.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) result.push(current);
  }
  return result;
}

/**
 * Compute the total height of a text block without drawing it.
 */
export function measureTextBlock(
  text: string,
  maxWidth: number,
  font: FontName = "Geneva9",
  lineSpacing: number = 0
): number {
  const lineH = getLineHeight(font) + lineSpacing;
  const lines = getWrappedLines(text, maxWidth, font);
  return lines.length * lineH;
}
