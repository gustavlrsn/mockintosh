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

let strikes: Map<string, Map<number, DeckerFont>> | undefined;
let pendingStrikes: Map<string, Map<number, string>> | undefined;
let pendingBaked: Map<string, { family: string; size: number; data: string }> | undefined;
let aliases: Map<string, { family: string; size: number }> | undefined;
let defaults: Map<string, number> | undefined;
let infoByKey: Map<string, RegisteredFontInfo> | undefined;
let bakedByName: Map<string, DeckerFont> | undefined;

function strikeMap(): Map<string, Map<number, DeckerFont>> {
  return (strikes ??= new Map());
}
function pendingStrikeMap(): Map<string, Map<number, string>> {
  return (pendingStrikes ??= new Map());
}
function pendingBakedMap(): Map<string, { family: string; size: number; data: string }> {
  return (pendingBaked ??= new Map());
}
function aliasMap(): Map<string, { family: string; size: number }> {
  return (aliases ??= new Map(Object.entries(ROLE_ALIASES)));
}
function defaultMap(): Map<string, number> {
  return (defaults ??= new Map(Object.entries(FAMILY_DEFAULTS)));
}
function infoMap(): Map<string, RegisteredFontInfo> {
  return (infoByKey ??= new Map());
}
function bakedMap(): Map<string, DeckerFont> {
  return (bakedByName ??= new Map());
}

export interface RegisteredFontInfo {
  ascent: number;
  descent: number;
  leading: number;
}

let builtInsInitialized = false;

export function fontInfoKey(family: string, size: number): string {
  return `${family}/${size}`;
}

export function lookupFontInfo(font: DeckerFont): RegisteredFontInfo | undefined {
  if (font.size != null) {
    const sized = infoMap().get(fontInfoKey(font.name, font.size));
    if (sized) return sized;
  }
  return infoMap().get(font.name);
}

function rememberInfo(family: string, size: number, info: RegisteredFontInfo | undefined): void {
  if (!info) return;
  infoMap().set(fontInfoKey(family, size), info);
}

function loadStrike(family: string, size: number, data: string): DeckerFont {
  const font = decodeDeckerFont(data, family);
  font.size = size;
  return applyExtraGlyphs(font);
}

function putStrike(family: string, size: number, font: DeckerFont): void {
  let bySize = strikeMap().get(family);
  if (!bySize) {
    bySize = new Map();
    strikeMap().set(family, bySize);
  }
  bySize.set(size, font);
  if (!defaultMap().has(family)) defaultMap().set(family, size);
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

function knownSizes(family: string): number[] {
  const decoded = strikeMap().get(family);
  const pending = pendingStrikeMap().get(family);
  const sizes = new Set<number>();
  if (decoded) for (const size of decoded.keys()) sizes.add(size);
  if (pending) for (const size of pending.keys()) sizes.add(size);
  return [...sizes];
}

function ensureStrike(family: string, size: number): DeckerFont | null {
  const have = strikeMap().get(family)?.get(size);
  if (have) return have;
  const data = pendingStrikeMap().get(family)?.get(size);
  if (!data) return null;
  const font = loadStrike(family, size, data);
  putStrike(family, size, font);
  pendingStrikeMap().get(family)?.delete(size);
  return font;
}

function ensureBaked(name: string): DeckerFont | null {
  const have = bakedMap().get(name);
  if (have) return have;
  const pending = pendingBakedMap().get(name);
  if (!pending) return null;
  const font = loadFont(name, pending.data);
  font.size = pending.size;
  bakedMap().set(name, font);
  pendingBakedMap().delete(name);
  return font;
}

export function resolveFaceRef(name: string = "body", size?: number): { family: string; size: number } {
  initBuiltinFonts();
  if (bakedMap().has(name) || pendingBakedMap().has(name)) {
    const baked = ensureBaked(name);
    return { family: name, size: baked?.size ?? size ?? 0 };
  }
  const alias = aliasMap().get(name);
  const family = alias?.family ?? name;
  const sizes = knownSizes(family);
  if (sizes.length === 0) {
    return { family, size: size ?? alias?.size ?? defaultMap().get(family) ?? 12 };
  }
  const requested = size ?? alias?.size ?? defaultMap().get(family) ?? sizes[0]!;
  return { family, size: nearestSize(sizes, requested) };
}

/** Decode a Decker font record and patch in Mockintosh's extra symbol glyphs for that name. */
function loadFont(name: string, data: string): DeckerFont {
  return applyExtraGlyphs(decodeDeckerFont(data, name));
}

export function initBuiltinFonts(): void {
  if (builtInsInitialized) return;
  for (const strike of BUILTIN_STRIKES) {
    let bySize = pendingStrikeMap().get(strike.family);
    if (!bySize) {
      bySize = new Map();
      pendingStrikeMap().set(strike.family, bySize);
    }
    bySize.set(strike.size, strike.data);
    rememberInfo(strike.family, strike.size, strike.info);
  }
  for (const [name, alias] of Object.entries(BAKED_STYLE_ALIASES)) {
    pendingBakedMap().set(name, alias);
    rememberInfo(name, alias.size, infoMap().get(fontInfoKey(alias.family, alias.size)));
    infoMap().set(name, infoMap().get(fontInfoKey(alias.family, alias.size)) ?? { ascent: 10, descent: 2, leading: 0 });
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
  const alias = aliasMap().get(name);
  const family = alias?.family ?? name;
  const point = size ?? alias?.size ?? defaultMap().get(family) ?? 12;
  const font = loadStrike(family, point, data);
  putStrike(family, point, font);
  defaultMap().set(family, point);
  return font;
}

export function getFont(name: string = "body", size?: number): DeckerFont | null {
  initBuiltinFonts();
  if (size === undefined && (bakedMap().has(name) || pendingBakedMap().has(name))) {
    return ensureBaked(name);
  }
  const ref = resolveFaceRef(name, size);
  if (bakedMap().has(ref.family) || pendingBakedMap().has(ref.family)) {
    return ensureBaked(ref.family);
  }
  return ensureStrike(ref.family, ref.size);
}

export function requireFont(name: string = "body", size?: number): DeckerFont {
  const font = getFont(name, size);
  if (!font) throw new Error(`Unknown font: "${name}"${size != null ? ` ${size}` : ""}`);
  return font;
}

export function listFonts(): string[] {
  initBuiltinFonts();
  const extra = new Set<string>();
  for (const name of strikeMap().keys()) extra.add(name);
  for (const name of pendingStrikeMap().keys()) extra.add(name);
  const listed = LISTED_FONT_NAMES as readonly string[];
  const extras = [...extra].filter((name) => !listed.includes(name));
  extras.sort();
  return [...listed, ...extras];
}

export function listFontSizes(name: string): number[] {
  initBuiltinFonts();
  const { family } = resolveFaceRef(name);
  return knownSizes(family).sort((a, b) => a - b);
}

export function listFontFamilies(): FontFamilyInfo[] {
  initBuiltinFonts();
  return listFonts()
    .filter((name) => !ROLE_ALIASES[name])
    .map((name) => {
      const sizes = listFontSizes(name);
      return {
        name,
        defaultSize: defaultMap().get(name) ?? sizes[0] ?? 12,
        sizes,
      };
    });
}

export function defaultFontSize(name: string = "body"): number {
  return resolveFaceRef(name).size;
}

export type { FontFamilyInfo };
