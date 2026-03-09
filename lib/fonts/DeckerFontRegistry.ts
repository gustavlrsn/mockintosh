import { DECKER_BUILTIN_FONT_DATA } from "./DeckerBuiltins";
import type { BuiltInFontName, DeckerFont, FontName } from "./DeckerFont";
import { decodeDeckerFont } from "./DeckerFontCodec";

const fontsByName = new Map<string, DeckerFont>();
let builtInsInitialized = false;

function registerBuiltInFont(name: BuiltInFontName): void {
  fontsByName.set(name, decodeDeckerFont(DECKER_BUILTIN_FONT_DATA[name], name));
}

export function initDeckerFonts(): void {
  if (builtInsInitialized) return;
  registerBuiltInFont("body");
  registerBuiltInFont("menu");
  registerBuiltInFont("mono");
  builtInsInitialized = true;
}

export function registerDeckerFont(
  name: string,
  font: DeckerFont | string
): DeckerFont {
  initDeckerFonts();
  const normalized =
    typeof font === "string" ? decodeDeckerFont(font, name) : { ...font, name };
  fontsByName.set(name, normalized);
  return normalized;
}

export function getDeckerFont(name: FontName = "body"): DeckerFont | null {
  initDeckerFonts();
  return fontsByName.get(String(name)) ?? null;
}

export function requireDeckerFont(name: FontName = "body"): DeckerFont {
  const font = getDeckerFont(name);
  if (!font) {
    throw new Error(`Unknown font: ${String(name)}`);
  }
  return font;
}

export function hasDeckerFont(name: string): boolean {
  initDeckerFonts();
  return fontsByName.has(name);
}

export function listDeckerFonts(): string[] {
  initDeckerFonts();
  return Array.from(fontsByName.keys());
}
