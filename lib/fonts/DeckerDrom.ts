/**
 * Decker maps text to font glyph indices ("ordinals") the same way as `lil.js`:
 * - newline (10) and ASCII printable (32–126) use their byte value;
 * - other Unicode code units are looked up in `drom_chars`; if present, ordinal is 127 + index;
 * - otherwise ordinal 255 (replacement / missing).
 *
 * This is *not* Unicode code points for Latin-1: e.g. `å` (U+00E5) maps to 164, not 229.
 *
 * @see reference/Decker/js/lil.js — `drom_chars`, `drom_idx`, `drom_to_ord`
 */
const DROM_CHARS =
  "…ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĒēĘęĪīıŁłŃńŌōŐőŒœŚśŠšŪūŰűŸŹźŻżŽžȘșȚțẞ¡¿«»€°";

const codeUnitToOrdinal = new Map<number, number>();
for (let i = 0; i < DROM_CHARS.length; i++) {
  const cu = DROM_CHARS.charCodeAt(i);
  codeUnitToOrdinal.set(cu, 127 + i);
}

/**
 * Matches `drom_to_ord` in Decker for a single UTF-16 code unit (first of `ch`).
 */
export function deckerOrdinalForCharCode(codeUnit: number): number {
  if (codeUnit === 10 || (codeUnit >= 32 && codeUnit <= 126)) {
    return codeUnit;
  }
  return codeUnitToOrdinal.get(codeUnit) ?? 255;
}
