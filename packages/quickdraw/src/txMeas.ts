/**
 * `StdTxMeas` — extracted so `text.ts` and `drawText.ts` can share it
 * without a cycle (`Text.a:434-512`, `DrawText.a:114-122`).
 */

import type { FontInfo, Point } from "./types";
import { asInt16, HiWord } from "./fixmath";
import { globals, requirePort } from "./globals";
import { currentSwapFont } from "./fontManager";
import type { FMInput } from "./fontManager";

function fillFMInput(numer: Point, denom: Point): FMInput {
  const port = requirePort();
  return {
    family: port.txFont | 0,
    size: port.txSize | 0,
    face: port.txFace,
    needBits: true,
    device: port.device | 0,
    numer: { h: numer.h, v: numer.v },
    denom: { h: denom.h, v: denom.v },
  };
}

/**
 * `FUNCTION StdTxMeas` (`Text.a:434-512`).
 * Fills `info`, writes back numer/denom, sums `WidthPtr` into `fixTxWid`,
 * stashes `fontPtr`.
 */
export function StdTxMeas(
  count: number,
  textAddr: number[],
  numer: Point,
  denom: Point,
  info: FontInfo
): number {
  requirePort();
  const out = currentSwapFont()(fillFMInput(numer, denom));
  globals.fontPtr = out;

  info.ascent = out.ascent & 0xff;
  info.descent = out.descent & 0xff;
  info.widMax = out.widMax & 0xff;
  info.leading = asInt16((out.leading << 24) >> 24);

  numer.h = out.numer.h;
  numer.v = out.numer.v;
  denom.h = out.denom.h;
  denom.v = out.denom.v;

  const widths = out.widthTable;
  let sum = 0;
  const n = count | 0;
  for (let i = 0; i < n; i++) {
    const ch = (textAddr[i] ?? 0) & 0xff;
    sum = (sum + (widths[ch] ?? 0)) | 0;
  }
  globals.fixTxWid = sum;
  return HiWord(sum);
}
