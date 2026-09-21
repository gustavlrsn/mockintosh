/**
 * Decker maps text to font glyph indices ("ordinals") the same way as `lil.js`:
 * - newline (10) and ASCII printable (32–126) use their byte value;
 * - other Unicode code units are looked up in `drom_chars`; if present, ordinal is 127 + index;
 * - otherwise ordinal 255 (replacement / missing).
 */
export const DROM_CHARS =
  "…ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĒēĘęĪīıŁłŃńŌōŐőŒœŚśŠšŪūŰűŸŹźŻżŽžȘșȚțẞ¡¿«»€°";

const codeUnitToOrdinal = new Map<number, number>();
for (let i = 0; i < DROM_CHARS.length; i++) {
  const cu = DROM_CHARS.charCodeAt(i);
  codeUnitToOrdinal.set(cu, 127 + i);
}

export function deckerOrdinalForCharCode(codeUnit: number): number {
  if (codeUnit === 10 || (codeUnit >= 32 && codeUnit <= 126)) {
    return codeUnit;
  }
  return codeUnitToOrdinal.get(codeUnit) ?? 255;
}

/** ASCII printables plus Decker extras — the charset a strike importer walks. */
export function defaultRasterCharset(): string {
  let chars = "";
  for (let code = 32; code < 127; code++) chars += String.fromCharCode(code);
  return chars + DROM_CHARS;
}
