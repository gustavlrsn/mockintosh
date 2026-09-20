import { BUILTIN_FONT_BODY, BUILTIN_FONT_MENU, BUILTIN_FONT_MONO } from "../data";
import { BUILTIN_FONT_BODY_BOLD } from "./bodyBold";
import { BUILTIN_FONT_GENEVA_12 } from "./geneva12";
import { BUILTIN_FONT_GENEVA_12_BOLD } from "./genevaTwelveBold";
import { BUILTIN_FONT_LISA } from "./lisa";
import { BUILTIN_FONT_PIXEL } from "./pixel";

/**
 * Single-file faces and baked bold aliases.
 *
 * City families and their native sizes live in `families.ts` / `city/`.
 * `registry.ts` loads those strikes; this list is only the leftover
 * name→data table for tests and the old extract scripts.
 */
export interface BuiltinFace {
  name: string;
  data: string;
}

export const BUILTIN_FACES: readonly BuiltinFace[] = [
  { name: "body", data: BUILTIN_FONT_BODY },
  { name: "menu", data: BUILTIN_FONT_MENU },
  { name: "mono", data: BUILTIN_FONT_MONO },
  { name: "pixel", data: BUILTIN_FONT_PIXEL },
  { name: "lisa", data: BUILTIN_FONT_LISA },
  { name: "bodyBold", data: BUILTIN_FONT_BODY_BOLD },
  { name: "geneva12", data: BUILTIN_FONT_GENEVA_12 },
  { name: "geneva12Bold", data: BUILTIN_FONT_GENEVA_12_BOLD },
];
