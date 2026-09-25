/**
 * Masung `DC3 t D` setting commands, as Masung's Editor app (MS_ESC_POS_Printer)
 * sends them at the start of a job, 100 ms apart.
 */
const DC3 = 0x13;

/**
 * The MS-EP8300 stores `DC3 t D` density and speed in its own memory and
 * restarts after each, dropping off USB: writes in the next moment fail.
 * PrinterTools waits this long and reopens the port. Never send them on
 * (re)connecting, or each restart triggers the next.
 */
export const MASUNG_RESTART_MS = 3000;

export const MASUNG_DENSITY_RANGE = { min: 70, max: 200, standard: 100 } as const;

/** `DC3 t D f n`: print density `n` (70–200; the app's default is 100). */
export function masungDensityBytes(level: number): Uint8Array {
  const { min, max } = MASUNG_DENSITY_RANGE;
  if (!Number.isInteger(level) || level < min || level > max) {
    throw new RangeError(`Masung density should be a whole number from ${min} to ${max}`);
  }
  return Uint8Array.of(DC3, 0x74, 0x44, 0x66, level);
}

export type MasungSpeed = "low" | "normal" | "high";

const MASUNG_SPEED_CODES: Record<MasungSpeed, number> = { low: 0, normal: 1, high: 2 };

/** `DC3 t D " n`: print speed (`n` 0 low, 1 normal, 2 high). */
export function masungSpeedBytes(speed: MasungSpeed): Uint8Array {
  return Uint8Array.of(DC3, 0x74, 0x44, 0x22, MASUNG_SPEED_CODES[speed]);
}

/**
 * Every question Masung's own software asks. None reads density or speed
 * back: the Editor app, PrinterTools and the Linux SDK only ever write them.
 * The MS-EP8300 (APP22-08-25-D1) answers `DC3 v` with a factory ID
 * ("20177102001 ") and ignores `ESC 0xCC 1`; it keeps its density across
 * power cycles.
 */
export const MASUNG_QUERIES = {
  /** `DC3 v`: the printer's stored ID or name (SDK `GetPrintIDorName`; `DC3 u` sets it). */
  name: Uint8Array.of(DC3, 0x76),
  /** `ESC 0xCC 1`: PrinterTools' sensor check, shown as normal / abnormal / paper jam. */
  sensors: Uint8Array.of(0x1b, 0xcc, 0x01),
} as const;
