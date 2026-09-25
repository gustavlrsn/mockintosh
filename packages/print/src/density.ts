/**
 * Changing a printer's stored print density, for the commands drivers can
 * name in {@link PrinterDensityControl}.
 */
import type { PrinterDensityCommand } from "./driver";
import type { PrinterTransport } from "./transport";
import { MASUNG_DENSITY_RANGE, MASUNG_RESTART_MS, masungDensityBytes } from "./masung";
import { ESCPOS_DENSITY_RANGE, ESCPOS_USER_SETTING, writeUserSetting } from "./userSettings";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface PrinterDensityScale {
  min: number;
  max: number;
  /** The factory value. */
  standard: number;
  /** Levels worth printing a sample at: one lighter than standard, standard, and darker. */
  testLevels: readonly number[];
  /**
   * The steps the printer rounds levels to, lightest first, when it has
   * fewer settings than levels: each covers levels up to `upTo` and is
   * named as the printer's self-test names it.
   */
  steps?: readonly PrinterDensityStep[];
  /** The command as the Chooser names it. */
  label: string;
}

export interface PrinterDensityStep {
  upTo: number;
  name: string;
}

/** How the Chooser names `level`: the printer's own step name, else the number (signed on a ± scale). */
export function densityLevelName(scale: PrinterDensityScale, level: number): string {
  const step = scale.steps?.find((s) => level <= s.upTo);
  if (step) return step.name;
  return scale.min < 0 && level > 0 ? `+${level}` : String(level);
}

export const PRINTER_DENSITY_SCALES: Record<PrinterDensityCommand, PrinterDensityScale> = {
  "escpos-gs-e": {
    ...ESCPOS_DENSITY_RANGE,
    standard: 0,
    testLevels: [-3, 0, 3, 6],
    label: "GS ( E",
  },
  // The MS-EP8300 (APP22-08-25-D1) rounds the level to four steps; its
  // self-test reports 70–101 as 85%, 102–134 as 100%, 135–168 as 115% and
  // about 170–200 as 130%. The test levels sit well inside each step.
  "masung-dc3": {
    ...MASUNG_DENSITY_RANGE,
    standard: 118,
    testLevels: [85, 118, 150, 190],
    steps: [
      { upTo: 101, name: "85%" },
      { upTo: 134, name: "100%" },
      { upTo: 168, name: "115%" },
      { upTo: MASUNG_DENSITY_RANGE.max, name: "130%" },
    ],
    label: "DC3 t D f",
  },
};

/** Store `level` with `command`. Resolves once the printer should be ready to print again. */
export async function writePrinterDensity(
  transport: PrinterTransport,
  command: PrinterDensityCommand,
  level: number,
): Promise<void> {
  const { min, max } = PRINTER_DENSITY_SCALES[command];
  if (level < min || level > max) throw new RangeError(`Density should be from ${min} to ${max}`);
  switch (command) {
    case "escpos-gs-e":
      await writeUserSetting(transport, ESCPOS_USER_SETTING.density, level);
      return;
    case "masung-dc3":
      await transport.write(masungDensityBytes(level));
      await sleep(MASUNG_RESTART_MS);
      return;
  }
}
