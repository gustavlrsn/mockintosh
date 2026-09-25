/**
 * Printer status: what a printer can tell us about itself, and how to ask.
 *
 * Two independent sources:
 * - the USB printer class (`GET_PORT_STATUS`, `GET_DEVICE_ID`), answered by
 *   the USB interface itself — works even when the command set is unknown;
 * - ESC/POS real-time status (`DLE EOT n`), answered over the bulk IN pipe.
 */
import type { PrinterProfile } from "./encoder";
import type { PrinterTransport } from "./transport";

/** USB printer class `GET_PORT_STATUS` (the old Centronics status lines). */
export interface PrinterPortStatus {
  paperEmpty: boolean;
  /** "Selected" / online. */
  selected: boolean;
  error: boolean;
}

export function parsePortStatus(byte: number): PrinterPortStatus {
  return {
    paperEmpty: (byte & 0x20) !== 0,
    selected: (byte & 0x10) !== 0,
    // Bit 3 is "not error".
    error: (byte & 0x08) === 0,
  };
}

/** IEEE 1284 device ID, e.g. `MFG:Masung;MDL:MS-EP8300;CMD:ESC/POS;`. */
export type PrinterDeviceId = Record<string, string>;

export function parseDeviceId(text: string): PrinterDeviceId {
  const id: PrinterDeviceId = {};
  for (const field of text.split(";")) {
    const colon = field.indexOf(":");
    if (colon > 0) id[field.slice(0, colon).trim()] = field.slice(colon + 1).trim();
  }
  return id;
}

/** ESC/POS `DLE EOT n` — the four real-time status queries. */
export const ESCPOS_STATUS = {
  printer: 1,
  offlineCause: 2,
  errorCause: 3,
  paperSensor: 4,
} as const;

export type EscPosStatusQuery = (typeof ESCPOS_STATUS)[keyof typeof ESCPOS_STATUS];

export function escPosStatusQuery(n: EscPosStatusQuery): Uint8Array {
  return Uint8Array.of(0x10, 0x04, n);
}

/**
 * ESC/POS `DLE ENQ 2` — real-time "recover from a recoverable error and clear
 * the receive and print buffers" (e.g. after a cutter jam has been cleared).
 */
export const ESCPOS_RECOVER_AND_CLEAR = Uint8Array.of(0x10, 0x05, 0x02);

/** Decoded `DLE EOT 1–4` replies; each field is `undefined` when that query went unanswered. */
export interface EscPosStatus {
  online?: boolean;
  coverOpen?: boolean;
  feedButtonPressed?: boolean;
  /** Printing stopped because the paper ran out. */
  stoppedByPaperEnd?: boolean;
  errorOccurred?: boolean;
  cutterError?: boolean;
  unrecoverableError?: boolean;
  /** E.g. print head too hot; clears by itself. */
  autoRecoverableError?: boolean;
  paperNearEnd?: boolean;
  paperEnd?: boolean;
}

/** Every `DLE EOT` reply has bits 1 and 4 set and bits 0 and 7 clear. */
export function isEscPosStatusByte(byte: number): boolean {
  return (byte & 0x93) === 0x12;
}

export function parseEscPosStatus(n: EscPosStatusQuery, byte: number): EscPosStatus {
  switch (n) {
    case ESCPOS_STATUS.printer:
      return { online: (byte & 0x08) === 0 };
    case ESCPOS_STATUS.offlineCause:
      return {
        coverOpen: (byte & 0x04) !== 0,
        feedButtonPressed: (byte & 0x08) !== 0,
        stoppedByPaperEnd: (byte & 0x20) !== 0,
        errorOccurred: (byte & 0x40) !== 0,
      };
    case ESCPOS_STATUS.errorCause:
      return {
        cutterError: (byte & 0x08) !== 0,
        unrecoverableError: (byte & 0x20) !== 0,
        autoRecoverableError: (byte & 0x40) !== 0,
      };
    case ESCPOS_STATUS.paperSensor:
      return {
        paperNearEnd: (byte & 0x0c) !== 0,
        paperEnd: (byte & 0x60) !== 0,
      };
  }
}

export interface PrinterStatusReport {
  deviceName: string | null;
  /** How the transport is attached (interface, endpoints), when it can say. */
  link?: string;
  deviceId?: PrinterDeviceId;
  port?: PrinterPortStatus;
  /** Absent when the dialect has no status queries or the transport can't read. */
  escpos?: EscPosStatus;
  /** The reply byte to each answered `DLE EOT n`, keyed by `n` — for reading a printer's own manual. */
  escposRaw?: Partial<Record<EscPosStatusQuery, number>>;
  /** Queries that got no reply, or a reply that wasn't a status byte. */
  unanswered: string[];
  /** Queries that failed outright; the rest of the report is still filled in. */
  failures: string[];
}

const ESCPOS_REPLY_TIMEOUT_MS = 500;

/**
 * Ask a connected printer everything it can report. Each source is optional:
 * a transport that can't read, or a dialect without status queries, just
 * leaves that part of the report empty.
 */
export async function queryPrinterStatus(
  transport: PrinterTransport,
  profile: PrinterProfile
): Promise<PrinterStatusReport> {
  const report: PrinterStatusReport = { deviceName: transport.deviceName, unanswered: [], failures: [] };
  report.link = transport.linkDetails?.();

  /** One failing query must not hide what the others found. */
  async function attempt<T>(label: string, query: () => Promise<T>): Promise<T | undefined> {
    try {
      return await query();
    } catch (error) {
      report.failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
      return undefined;
    }
  }

  if (transport.deviceId) {
    const deviceId = await attempt("USB device ID", () => transport.deviceId!());
    if (deviceId) report.deviceId = parseDeviceId(deviceId);
    else if (deviceId === null) report.unanswered.push("USB device ID");
  }

  if (transport.portStatus) {
    const port = await attempt("USB port status", () => transport.portStatus!());
    if (typeof port === "number") report.port = parsePortStatus(port);
    else if (port === null) report.unanswered.push("USB port status");
  }

  if (profile.dialect === "escpos" && transport.read) {
    const read = transport.read.bind(transport);
    const escpos: EscPosStatus = {};
    const raw: Partial<Record<EscPosStatusQuery, number>> = {};
    for (const [name, n] of Object.entries(ESCPOS_STATUS)) {
      const label = `DLE EOT ${n} (${name})`;
      const reply = await attempt(label, async () => {
        await transport.write(escPosStatusQuery(n));
        return read(1, ESCPOS_REPLY_TIMEOUT_MS);
      });
      if (reply === undefined) continue;
      const byte = reply?.[0];
      if (byte === undefined || !isEscPosStatusByte(byte)) {
        report.unanswered.push(label);
        continue;
      }
      raw[n] = byte;
      Object.assign(escpos, parseEscPosStatus(n, byte));
    }
    report.escpos = escpos;
    report.escposRaw = raw;
  }
  return report;
}

/** The report as plain lines, for the Chooser or a log. */
export function describePrinterStatus(report: PrinterStatusReport): string[] {
  const lines: string[] = [];
  const yes = (flag: boolean | undefined, text: string) => {
    if (flag) lines.push(text);
  };
  if (report.link) lines.push(report.link);
  if (report.deviceId) {
    const { MFG, MANUFACTURER, MDL, MODEL, CMD, "COMMAND SET": commandSet } = report.deviceId;
    const maker = MFG ?? MANUFACTURER;
    const model = MDL ?? MODEL;
    if (maker || model) lines.push(`Reports itself as: ${[maker, model].filter(Boolean).join(" ")}`);
    const commands = CMD ?? commandSet;
    if (commands) lines.push(`Command sets: ${commands}`);
  }
  if (report.port) {
    lines.push(`USB port: ${report.port.selected ? "online" : "OFFLINE"}${report.port.error ? ", ERROR" : ""}${report.port.paperEmpty ? ", PAPER EMPTY" : ""}`);
  }
  const s = report.escpos;
  if (s) {
    if (s.online !== undefined) lines.push(`ESC/POS: ${s.online ? "online" : "OFFLINE"}`);
    // Kiosk printers often share this sensor with the cutter: a blade that
    // didn't return home reads as an open cover.
    yes(s.coverOpen, "Cover open, or cutter blade not home");
    yes(s.feedButtonPressed, "Feed button is held");
    yes(s.stoppedByPaperEnd || s.paperEnd, "Out of paper");
    yes(s.paperNearEnd && !s.paperEnd, "Paper is running low");
    yes(s.cutterError, "Cutter error");
    yes(s.unrecoverableError, "Unrecoverable error");
    yes(s.autoRecoverableError, "Temporary error (e.g. head too hot)");
  }
  const raw = Object.entries(report.escposRaw ?? {});
  if (raw.length > 0) {
    const hex = (b: number) => `0x${b.toString(16).padStart(2, "0")}`;
    lines.push(`Raw DLE EOT: ${raw.map(([n, b]) => `${n}=${hex(b)}`).join(" ")}`);
  }
  if (report.unanswered.length > 0) lines.push(`No reply to: ${report.unanswered.join(", ")}`);
  for (const failure of report.failures) lines.push(`Failed: ${failure}`);
  if (lines.length === 0) lines.push("The printer reported nothing.");
  return lines;
}
