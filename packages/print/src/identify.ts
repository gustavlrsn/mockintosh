/**
 * Put together everything a connected printer can tell about itself: the
 * link's facts, the USB printer-class device ID, and — for printers that
 * speak ESC/POS — the `GS I` answers.
 */
import type { PrinterIdentity } from "./driver";
import { probePrinterId, reportedIdentity } from "./probe";
import { parseDeviceId } from "./status";
import type { PrinterTransport } from "./transport";

export interface IdentifyPrinterOptions {
  /**
   * Ask ESC/POS `GS I` questions. Leave off for printers that may not speak
   * ESC/POS (cat printers would print the bytes as garbage).
   */
  escpos: boolean;
}

export async function identifyPrinter(
  transport: PrinterTransport,
  options: IdentifyPrinterOptions,
): Promise<PrinterIdentity | null> {
  const base = transport.identity?.();
  if (!base) return null;
  const identity: PrinterIdentity = { ...base };
  if (transport.deviceId) {
    const text = await transport.deviceId().catch(() => null);
    if (text) identity.deviceId = parseDeviceId(text);
  }
  if (options.escpos && transport.read) {
    const reported = reportedIdentity(await probePrinterId(transport).catch(() => []));
    if (Object.keys(reported).length > 0) identity.reported = reported;
  }
  return identity;
}
