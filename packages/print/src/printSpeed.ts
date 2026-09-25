/**
 * Changing a printer's print speed, for the commands drivers can name in
 * {@link PrinterSpeedControl}. Printing slower gives the head more time per
 * line, so heavy black areas can come out darker.
 */
import type { PrinterSpeed, PrinterSpeedCommand } from "./driver";
import { MASUNG_RESTART_MS, masungSpeedBytes } from "./masung";
import type { PrinterTransport } from "./transport";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const PRINTER_SPEEDS: readonly PrinterSpeed[] = ["low", "normal", "high"];

/** Set `speed` with `command`. Resolves once the printer should be ready to print again. */
export async function writePrinterSpeed(
  transport: PrinterTransport,
  command: PrinterSpeedCommand,
  speed: PrinterSpeed,
): Promise<void> {
  switch (command) {
    case "masung-dc3":
      await transport.write(masungSpeedBytes(speed));
      await sleep(MASUNG_RESTART_MS);
      return;
  }
}
