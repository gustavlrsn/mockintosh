/**
 * Printer dialect and paper profile — the OS picks an encoder from a profile
 * rather than knowing ESC/POS (or any other command set) by name.
 *
 * Two dialects ship today: ESC/POS (Phomemo, PeriPage, generic 0xFF00) and
 * the GB0x/MX0x “cat printer” framing. Two common widths: 58 mm = 384 dots,
 * 80 mm = 576 dots. The transport stays a byte sink.
 */
import type { BitMap } from "@mockintosh/quickdraw";

export interface CutOptions {
  /** `"partial"` leaves a small bridge of paper; `"full"` severs it. */
  mode?: "full" | "partial";
}

export type PrinterDialect = "escpos" | "cat";

/**
 * How an ESC/POS printer is told to cut; clones differ in which they accept.
 * - `gs-v`: `GS V m` — cut now (Epson's original form).
 * - `gs-v-feed`: `GS V 65/66 0` — feed to the cutter, then cut.
 * - `esc-i`: `ESC i` / `ESC m` — the older full / partial cut.
 */
export type EscPosCutCommand = "gs-v" | "gs-v-feed" | "esc-i";

/**
 * Print speed / heat settings. There is no single ESC/POS command for these;
 * each variant is one vendor family's, and a printer ignores (or prints as
 * junk) the ones it doesn't know.
 * - `gs-k`: Epson `GS ( K` — density −6…+8 (0 = standard), speed 1 (slowest)…13.
 * - `dc2-density`: `DC2 #` — density 0…31 (50% + 5% × n), break time 0…7 (× 250 µs).
 * - `esc-7`: `ESC 7` — dots heated at once ((n + 1) × 8), heating time and
 *   interval in 10 µs units. Fewer dots and longer times print slower and darker.
 */
export type EscPosPrintTuning =
  | { command: "gs-k"; density?: number; speed?: number }
  | { command: "dc2-density"; density: number; breakTime: number }
  | { command: "esc-7"; heatingDots: number; heatingTime: number; heatingInterval: number };

export interface EscPosTuningPreset {
  id: string;
  label: string;
  /** `null` = send nothing; the printer's own settings, for comparison. */
  tuning: EscPosPrintTuning | null;
}

export const ESCPOS_TUNING_PRESETS: readonly EscPosTuningPreset[] = [
  { id: "baseline", label: "Printer default", tuning: null },
  { id: "gs-k-slow", label: "Slowest (GS ( K)", tuning: { command: "gs-k", speed: 1 } },
  { id: "gs-k-dark", label: "Darker (GS ( K)", tuning: { command: "gs-k", density: 4 } },
  { id: "dc2-dark", label: "Darker (DC2 #)", tuning: { command: "dc2-density", density: 15, breakTime: 2 } },
  {
    id: "esc-7-slow",
    label: "Slow & hot (ESC 7)",
    tuning: { command: "esc-7", heatingDots: 3, heatingTime: 160, heatingInterval: 20 },
  },
];

export const ESCPOS_CUT_COMMANDS: readonly { command: EscPosCutCommand; label: string }[] = [
  { command: "gs-v", label: "GS V" },
  { command: "gs-v-feed", label: "GS V B" },
  { command: "esc-i", label: "ESC i" },
];

export interface PrinterProfile {
  id: string;
  /** Human name for the Chooser / settings. */
  name: string;
  dialect: PrinterDialect;
  /** Printable width in dots (58 mm ≈ 384, 80 mm ≈ 576 at 203 dpi). */
  dots: number;
  /** ESC/POS only; defaults to `gs-v`. */
  cutCommand?: EscPosCutCommand;
  /** ESC/POS only: rows per raster command; each boundary can leave a faint line. */
  rasterBandRows?: number;
  /** ESC/POS only: speed / heat setting sent at the start of every job. */
  tuning?: EscPosPrintTuning;
  /** ESC/POS only: blank rows before each raster image, so it starts at full paper speed. */
  rasterLeadInRows?: number;
}

export const PROFILE_ESCPOS_80MM: PrinterProfile = {
  id: "escpos-80",
  name: "ESC/POS 80 mm",
  dialect: "escpos",
  dots: 576,
  // 80 mm printers here are on USB, whose flow control keeps a whole page in
  // one command safe; 2048 rows is the limit many Epson-compatibles accept.
  rasterBandRows: 2048,
  rasterLeadInRows: 32,
};

export const PROFILE_ESCPOS_58MM: PrinterProfile = {
  id: "escpos-58",
  name: "ESC/POS 58 mm",
  dialect: "escpos",
  dots: 384,
};

export const PROFILE_CAT_58MM: PrinterProfile = {
  id: "cat-58",
  name: "Cat printer 58 mm",
  dialect: "cat",
  dots: 384,
};

/** Builds a printer-specific byte stream. Chain calls, then `end()`. */
export interface PrinterEncoder {
  begin(): this;
  raster(bits: BitMap): this;
  feed(dots: number): this;
  cut(options?: CutOptions): this;
  end(): Uint8Array;
}

export function profileById(id: string): PrinterProfile | undefined {
  switch (id) {
    case PROFILE_ESCPOS_80MM.id:
      return PROFILE_ESCPOS_80MM;
    case PROFILE_ESCPOS_58MM.id:
      return PROFILE_ESCPOS_58MM;
    case PROFILE_CAT_58MM.id:
      return PROFILE_CAT_58MM;
    default:
      return undefined;
  }
}
