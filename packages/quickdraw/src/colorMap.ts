/**
 * ColorMap — adjust transfer mode and pattern for colour separation.
 * `Util.a:406-475`.
 */
import type { Pattern } from "./types";
import { globals } from "./globals";

export interface ColorMapResult {
  mode: number;
  pat: Pattern;
}

/** BTST Dn, Dm on a long: bit number modulo 32. `Util.a:439`. */
function colorBitSet(color: number, colrBit: number): boolean {
  return ((color >>> (colrBit & 31)) & 1) !== 0;
}

/**
 * `PROCEDURE ColorMap(mode: INTEGER, pat: Pattern)`.
 *
 * `colrBit == 0` (or no port) leaves mode and pat unchanged. XOR modes never
 * change. OR depends on `fgColor`; BIC on inverted `bkColor`; COPY on both
 * and may replace `pat` with `globals.black` and mode 8 or 12.
 */
export function ColorMap(mode: number, pat: Pattern): ColorMapResult {
  const port = globals.thePort;
  // NIL or odd thePort → leave colour alone. Util.a:418-423
  if (!port) return { mode, pat };
  const colrBit = port.colrBit | 0;
  if (colrBit === 0) return { mode, pat }; // Util.a:423-424

  let d3 = mode | 0;
  const low = d3 & 3; // Util.a:425-427
  if (low === 0) {
    // COPY depends on both FG and BK. Util.a:454-472
    const fg = colorBitSet(port.fgColor | 0, colrBit);
    const bk = colorBitSet(port.bkColor | 0, colrBit);
    if (fg) {
      if (!bk) return { mode: d3, pat }; // FORE1, BK false. Util.a:459-460
      return { mode: 8, pat: globals.black }; // patCopy + black. Util.a:461-465
    }
    if (bk) return { mode: d3 ^ 4, pat }; // INVMODE. Util.a:467-472
    return { mode: 12, pat: globals.black }; // notPatCopy + black. Util.a:469-470
  }

  if (low === 2) return { mode: d3, pat }; // XOR: no change. Util.a:431-432

  // OR (low===1) tests FG; BIC (low===3) tests NOT BK. Util.a:438-449
  const color = low > 2 ? ~(port.bkColor | 0) : port.fgColor | 0;
  if (colorBitSet(color, colrBit)) return { mode: d3, pat }; // Util.a:439-440
  return { mode: d3 ^ 2, pat }; // invert mode bit 1. Util.a:441
}
