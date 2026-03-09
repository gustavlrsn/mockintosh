import lilSource from "../../reference/Decker/js/lil.js?raw";
import type { BuiltInFontName } from "./DeckerFont";

function readQuotedString(
  source: string,
  startIndex: number
): [string, number] {
  let i = startIndex;
  if (source[i] !== '"') {
    throw new Error(`Expected string literal at ${startIndex}`);
  }

  i += 1;
  let value = "";
  while (i < source.length) {
    const ch = source[i];
    if (ch === "\\") {
      value += source[i + 1] ?? "";
      i += 2;
      continue;
    }
    if (ch === '"') {
      return [value, i + 1];
    }
    value += ch;
    i += 1;
  }

  throw new Error("Unterminated string literal while reading Decker built-ins");
}

function extractFontData(name: BuiltInFontName): string {
  const anchor = `${name}:`;
  const start = lilSource.indexOf(anchor);
  if (start < 0) {
    throw new Error(`Could not find built-in Decker font "${name}"`);
  }

  let i = start + anchor.length;
  while (i < lilSource.length && /\s/.test(lilSource[i])) i += 1;

  let combined = "";
  while (i < lilSource.length) {
    const [segment, nextIndex] = readQuotedString(lilSource, i);
    combined += segment;
    i = nextIndex;
    while (i < lilSource.length && /\s/.test(lilSource[i])) i += 1;
    if (lilSource[i] !== "+") break;
    i += 1;
    while (i < lilSource.length && /\s/.test(lilSource[i])) i += 1;
  }

  return combined;
}

export const DECKER_BUILTIN_FONT_DATA: Record<BuiltInFontName, string> = {
  body: extractFontData("body"),
  menu: extractFontData("menu"),
  mono: extractFontData("mono"),
};
