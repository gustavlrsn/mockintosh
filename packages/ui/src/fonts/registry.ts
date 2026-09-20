import type { DeckerFont } from "./font";
import { decodeDeckerFont } from "./codec";
import { applyExtraGlyphs } from "./extraGlyphs";
import {
  BAKED_STYLE_ALIASES,
  BUILTIN_STRIKES,
  FAMILY_DEFAULTS,
  LISTED_FONT_NAMES,
  ROLE_ALIASES,
  type FontFamilyInfo,
} from "./families";

const strikes = new Map<string, Map<number, DeckerFont>>();
const aliases = new Map<string, { family: string; size: number }>(Object.entries(ROLE_ALIASES));
const defaults = new Map<string, number>(Object.entries(FAMILY_DEFAULTS));
export interface RegisteredFontInfo {
  ascent: number;
  descent: number;
  leading: number;
}

const infoByKey = new Map<string, RegisteredFontInfo>();
const bakedByName = new Map<string, DeckerFont>();
let builtInsInitialized = false;

export function fontInfoKey(family: string, size: number): string {
  return `${family}/${size}`;
}

export function lookupFontInfo(font: DeckerFont): RegisteredFontInfo | undefined {
  if (font.size != null) {
    const sized = infoByKey.get(fontInfoKey(font.name, font.size));
    if (sized) return sized;
  }
  return infoByKey.get(font.name);
}

function rememberInfo(family: string, size: number, info: RegisteredFontInfo | undefined): void {
  if (!info) return;
  infoByKey.set(fontInfoKey(family, size), info);
}

function loadStrike(family: string, size: number, data: string): DeckerFont {
  const font = decodeDeckerFont(data, family);
  font.size = size;
  return applyExtraGlyphs(font);
}

function putStrike(family: string, size: number, font: DeckerFont): void {
  let bySize = strikes.get(family);
  if (!bySize) {
    bySize = new Map();
    strikes.set(family, bySize);
  }
  bySize.set(size, font);
  if (!defaults.has(family)) defaults.set(family, size);
}

function nearestSize(sizes: Iterable<number>, requested: number): number {
  let best: number | undefined;
  let bestDist = Infinity;
  for (const size of sizes) {
    const dist = Math.abs(size - requested);
    if (dist < bestDist || (dist === bestDist && best !== undefined && size > best)) {
      best = size;
      bestDist = dist;
    }
  }
  if (best === undefined) throw new Error("nearestSize called with no sizes");
  return best;
}

export function resolveFaceRef(name: string = "body", size?: number): { family: string; size: number } {
  initBuiltinFonts();
  if (bakedByName.has(name)) {
    const baked = bakedByName.get(name)!;
    return { family: name, size: baked.size ?? size ?? 0 };
  }
  const alias = aliases.get(name);
  const family = alias?.family ?? name;
  const bySize = strikes.get(family);
  if (!bySize || bySize.size === 0) {
    return { family, size: size ?? alias?.size ?? defaults.get(family) ?? 12 };
  }
  const requested = size ?? alias?.size ?? defaults.get(family) ?? [...bySize.keys()][0]!;
  return { family, size: nearestSize(bySize.keys(), requested) };
}

/** Decode a Decker font record and patch in Mockintosh's extra symbol glyphs for that name. */
function loadFont(name: string, data: string): DeckerFont {
  return applyExtraGlyphs(decodeDeckerFont(data, name));
}

export function initBuiltinFonts(): void {
  if (builtInsInitialized) return;
  for (const strike of BUILTIN_STRIKES) {
    const font = loadStrike(strike.family, strike.size, strike.data);
    putStrike(strike.family, strike.size, font);
    rememberInfo(strike.family, strike.size, strike.info);
  }
  for (const [name, alias] of Object.entries(BAKED_STYLE_ALIASES)) {
    const font = loadFont(name, alias.data);
    font.size = alias.size;
    bakedByName.set(name, font);
    rememberInfo(name, alias.size, infoByKey.get(fontInfoKey(alias.family, alias.size)));
    infoByKey.set(name, infoByKey.get(fontInfoKey(alias.family, alias.size)) ?? { ascent: 10, descent: 2, leading: 0 });
  }
  builtInsInitialized = true;
}

/**
 * Register a custom font from a %%FNT0 / %%FNT1 data block string.
 * Custom fonts can override built-in names. Extra symbol glyphs (see `extraGlyphs.ts`)
 * are applied when a drawing exists for `name`, so overriding `menu` keeps ⌘ / ✓ / • working.
 */
export function registerFont(name: string, data: string, size?: number): DeckerFont {
  initBuiltinFonts();
  const alias = aliases.get(name);
  const family = alias?.family ?? name;
  const point = size ?? alias?.size ?? defaults.get(family) ?? 12;
  const font = loadStrike(family, point, data);
  putStrike(family, point, font);
  defaults.set(family, point);
  return font;
}

export function getFont(name: string = "body", size?: number): DeckerFont | null {
  initBuiltinFonts();
  const baked = bakedByName.get(name);
  if (baked && size === undefined) return baked;
  const ref = resolveFaceRef(name, size);
  if (bakedByName.has(ref.family)) return bakedByName.get(ref.family) ?? null;
  return strikes.get(ref.family)?.get(ref.size) ?? null;
}

export function requireFont(name: string = "body", size?: number): DeckerFont {
  const font = getFont(name, size);
  if (!font) throw new Error(`Unknown font: "${name}"${size != null ? ` ${size}` : ""}`);
  return font;
}

export function listFonts(): string[] {
  initBuiltinFonts();
  const extra = [...strikes.keys()].filter((name) => !LISTED_FONT_NAMES.includes(name));
  extra.sort();
  return [...LISTED_FONT_NAMES, ...extra];
}

export function listFontSizes(name: string): number[] {
  initBuiltinFonts();
  const { family } = resolveFaceRef(name);
  const bySize = strikes.get(family);
  if (!bySize) return [];
  return [...bySize.keys()].sort((a, b) => a - b);
}

export function listFontFamilies(): FontFamilyInfo[] {
  initBuiltinFonts();
  return listFonts()
    .filter((name) => !ROLE_ALIASES[name])
    .map((name) => {
      const sizes = listFontSizes(name);
      return {
        name,
        defaultSize: defaults.get(name) ?? sizes[0] ?? 12,
        sizes,
      };
    });
}

export function defaultFontSize(name: string = "body"): number {
  return resolveFaceRef(name).size;
}

export type { FontFamilyInfo };
