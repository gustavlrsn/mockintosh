import type { DeckerFont } from "./font";
import { decodeDeckerFont } from "./codec";
import { BUILTIN_FONT_BODY, BUILTIN_FONT_MENU, BUILTIN_FONT_MONO } from "./data";
import { applyExtraGlyphs } from "./extraGlyphs";

const fontsByName = new Map<string, DeckerFont>();
let builtInsInitialized = false;

/** Decode a Decker font record and patch in Mockintosh's extra symbol glyphs for that name. */
function loadFont(name: string, data: string): DeckerFont {
  return applyExtraGlyphs(decodeDeckerFont(data, name));
}

export function initBuiltinFonts(): void {
  if (builtInsInitialized) return;
  fontsByName.set("body", loadFont("body", BUILTIN_FONT_BODY));
  fontsByName.set("menu", loadFont("menu", BUILTIN_FONT_MENU));
  fontsByName.set("mono", loadFont("mono", BUILTIN_FONT_MONO));
  builtInsInitialized = true;
}

/**
 * Register a custom font from a %%FNT0 / %%FNT1 data block string.
 * Custom fonts can override built-in names. Extra symbol glyphs (see `extraGlyphs.ts`) are
 * applied when a drawing exists for `name`, so overriding `menu` keeps ⌘ / ✓ / • working.
 */
export function registerFont(name: string, data: string): DeckerFont {
  initBuiltinFonts();
  const font = loadFont(name, data);
  fontsByName.set(name, font);
  return font;
}

export function getFont(name: string = "body"): DeckerFont | null {
  initBuiltinFonts();
  return fontsByName.get(name) ?? null;
}

export function requireFont(name: string = "body"): DeckerFont {
  const font = getFont(name);
  if (!font) throw new Error(`Unknown font: "${name}"`);
  return font;
}

export function listFonts(): string[] {
  initBuiltinFonts();
  return Array.from(fontsByName.keys());
}
