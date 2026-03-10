import type { BuiltInFontName } from "./DeckerFont";
import {
  DECKER_BUILTIN_FONT_DATA_BODY,
  DECKER_BUILTIN_FONT_DATA_MENU,
  DECKER_BUILTIN_FONT_DATA_MONO,
} from "./deckerBuiltinFontData";

export const DECKER_BUILTIN_FONT_DATA: Record<BuiltInFontName, string> = {
  body: DECKER_BUILTIN_FONT_DATA_BODY,
  menu: DECKER_BUILTIN_FONT_DATA_MENU,
  mono: DECKER_BUILTIN_FONT_DATA_MONO,
};
