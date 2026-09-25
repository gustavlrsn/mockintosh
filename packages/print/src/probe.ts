/**
 * ESC/POS capability probes: questions a printer may or may not answer, for
 * finding out which command set it really speaks. Nothing here changes a
 * setting; the replies (or silence) are shown raw next to a best-effort decoding.
 *
 * - `GS I n` — printer ID: model / type / ROM bytes, and on newer firmware
 *   maker, model, firmware and serial strings.
 * - `GS ( E` — Epson "user setting" mode (see `userSettings.ts`). Reading
 *   stored values needs entering the mode; leaving it resets the printer.
 * - Masung — the vendor's own reads, plus the standard status and extended
 *   `GS I` reads, in case one of them reports a stored setting.
 */
import { MASUNG_QUERIES } from "./masung";
import type { PrinterTransport } from "./transport";
import {
  ENTER_USER_SETTINGS,
  ESCPOS_USER_SETTING,
  EXIT_USER_SETTINGS,
  readMemorySwitchBytes,
  readUserSettingBytes,
} from "./userSettings";

/** One question and what came back. `reply` is `null` when the printer stayed silent. */
export interface PrinterProbeResult {
  label: string;
  reply: Uint8Array | null;
  field?: PrinterIdField;
}

/** A query sent to the printer; `terminated` replies end in NUL, the rest are one byte. */
interface ProbeQuery {
  label: string;
  bytes: Uint8Array;
  terminated: boolean;
  field?: PrinterIdField;
}

const GS = 0x1d;
const REPLY_TIMEOUT_MS = 500;
const SETTINGS_READ_TIMEOUT_MS = 250;
const MAX_REPLY_BYTES = 80;

const gsI = (n: number) => Uint8Array.of(GS, 0x49, n);

const ESCPOS_ID_QUERIES: readonly ProbeQuery[] = [
  { label: "GS I 1 (model ID)", bytes: gsI(1), terminated: false },
  { label: "GS I 2 (type ID)", bytes: gsI(2), terminated: false },
  { label: "GS I 3 (ROM version)", bytes: gsI(3), terminated: false, field: "rom" },
  { label: "GS I 65 (firmware)", bytes: gsI(65), terminated: true, field: "firmware" },
  { label: "GS I 66 (maker)", bytes: gsI(66), terminated: true, field: "maker" },
  { label: "GS I 67 (model)", bytes: gsI(67), terminated: true, field: "model" },
  { label: "GS I 68 (serial)", bytes: gsI(68), terminated: true },
];

const DLE = 0x10;

/**
 * Only complete read commands: a guessed prefix of a `DC3 t D` write would
 * take the next query's first byte as its value and store it.
 */
const MASUNG_PROBE_QUERIES: readonly ProbeQuery[] = [
  { label: "DC3 v (name)", bytes: MASUNG_QUERIES.name, terminated: true },
  { label: "ESC CC 1 (sensors)", bytes: MASUNG_QUERIES.sensors, terminated: false },
  { label: "GS r 1 (paper)", bytes: Uint8Array.of(GS, 0x72, 1), terminated: false },
  { label: "GS r 2 (drawer)", bytes: Uint8Array.of(GS, 0x72, 2), terminated: false },
  ...[1, 2, 3, 4].map((n) => ({ label: `DLE EOT ${n}`, bytes: Uint8Array.of(DLE, 0x04, n), terminated: false })),
  { label: "GS I 69 (device type)", bytes: gsI(69), terminated: true },
  { label: "GS I 111 (info B)", bytes: gsI(111), terminated: true },
  { label: "GS I 112 (fonts)", bytes: gsI(112), terminated: true },
];

/** What a `GS I` reply is about, for {@link reportedIdentity}. */
export type PrinterIdField = "maker" | "model" | "firmware" | "rom";

/**
 * Maker, model and firmware from `GS I` replies, when they're readable text.
 * Replies are `_`-headed and NUL-ended on Epson, bare and CR LF-ended on
 * many clones; both are trimmed.
 */
export function reportedIdentity(
  results: readonly PrinterProbeResult[],
): { maker?: string; model?: string; firmware?: string } {
  const text = (field: PrinterIdField) => {
    const reply = results.find((r) => r.field === field)?.reply;
    if (!reply || reply.length < 2) return undefined;
    const value = replyText(reply).replace(/^_/, "").trim();
    return value || undefined;
  };
  const identity: { maker?: string; model?: string; firmware?: string } = {};
  const maker = text("maker");
  const model = text("model");
  const firmware = text("firmware") ?? text("rom");
  if (maker) identity.maker = maker;
  if (model) identity.model = model;
  if (firmware) identity.firmware = firmware;
  return identity;
}

/**
 * Settings-mode reads: the Epson codes for density and speed, then a scan of
 * the other stored-value codes and the memory switches, since clone firmware
 * may keep density somewhere else.
 */
const USER_SETTING_QUERIES: readonly ProbeQuery[] = [
  ...Array.from({ length: 12 }, (_, i) => i + 1).map((a) => ({
    label: `GS ( E 6 a=${a}${a === ESCPOS_USER_SETTING.density ? " (density)" : a === ESCPOS_USER_SETTING.speed ? " (speed)" : ""}`,
    bytes: readUserSettingBytes(a),
    terminated: true,
  })),
  ...Array.from({ length: 8 }, (_, i) => i + 1).map((a) => ({
    label: `GS ( E 4 a=${a} (memory switch)`,
    bytes: readMemorySwitchBytes(a),
    terminated: true,
  })),
];

/**
 * Read one reply: a single reply, or bytes up to NUL or line feed (this
 * firmware ends strings in CR LF). Replies can arrive split over several
 * USB transfers.
 */
async function readReply(
  read: NonNullable<PrinterTransport["read"]>,
  terminated: boolean,
  timeoutMs: number,
): Promise<Uint8Array | null> {
  const bytes: number[] = [];
  while (bytes.length < MAX_REPLY_BYTES) {
    const chunk = await read(64, timeoutMs);
    if (!chunk || chunk.length === 0) break;
    bytes.push(...chunk);
    if (!terminated || chunk.includes(0x00) || chunk.includes(0x0a)) break;
  }
  return bytes.length > 0 ? Uint8Array.from(bytes) : null;
}

async function ask(
  transport: PrinterTransport,
  query: ProbeQuery,
  timeoutMs = REPLY_TIMEOUT_MS,
): Promise<PrinterProbeResult> {
  const read = transport.read!.bind(transport);
  await transport.write(query.bytes);
  const reply = await readReply(read, query.terminated, timeoutMs);
  return { label: query.label, reply, ...(query.field ? { field: query.field } : {}) };
}

function requireReadable(transport: PrinterTransport): void {
  if (!transport.read) throw new Error("This connection can't read replies from the printer.");
}

/** Ask every `GS I` question. Harmless: none of them print or change anything. */
export async function probePrinterId(transport: PrinterTransport): Promise<PrinterProbeResult[]> {
  requireReadable(transport);
  const results: PrinterProbeResult[] = [];
  for (const query of ESCPOS_ID_QUERIES) results.push(await ask(transport, query));
  return results;
}

/** Ask Masung's reads and the status reads; harmless like {@link probePrinterId}. */
export async function probeMasung(transport: PrinterTransport): Promise<PrinterProbeResult[]> {
  requireReadable(transport);
  const results: PrinterProbeResult[] = [];
  for (const query of MASUNG_PROBE_QUERIES) results.push(await ask(transport, query));
  return results;
}

/**
 * Enter Epson user-setting mode, read every stored value and memory switch
 * it will report, then leave — which resets the printer. Only answered
 * reads are returned, plus a count of the silent ones. A printer without
 * `GS ( E` may print stray characters.
 */
export async function probeUserSettings(transport: PrinterTransport): Promise<PrinterProbeResult[]> {
  requireReadable(transport);
  const results = [
    await ask(transport, { label: "GS ( E 1 (enter settings mode)", bytes: ENTER_USER_SETTINGS, terminated: true }),
  ];
  try {
    for (const query of USER_SETTING_QUERIES) results.push(await ask(transport, query, SETTINGS_READ_TIMEOUT_MS));
  } finally {
    await transport.write(EXIT_USER_SETTINGS);
  }
  return results;
}

/** Printable ASCII from a reply, skipping the header byte and NUL. */
function replyText(reply: Uint8Array): string {
  return Array.from(reply, (b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : b === 0x1f ? "|" : ""))
    .join("")
    .trim();
}

export interface DescribeProbeOptions {
  /** List unanswered queries as one count line instead of a line each. */
  collapseSilent?: boolean;
}

/** One line per result: raw hex, plus any readable text. */
export function describeProbeResults(
  results: readonly PrinterProbeResult[],
  options: DescribeProbeOptions = {},
): string[] {
  const lines: string[] = [];
  let silent = 0;
  for (const { label, reply } of results) {
    if (!reply) {
      if (options.collapseSilent) silent++;
      else lines.push(`${label}: no reply`);
      continue;
    }
    const hex = Array.from(reply, (b) => b.toString(16).padStart(2, "0")).join(" ");
    const text = reply.length > 1 ? replyText(reply) : "";
    lines.push(`${label}: ${hex}${text ? ` "${text}"` : ""}`);
  }
  if (silent > 0) lines.push(`No reply to ${silent} of ${results.length} queries.`);
  return lines;
}
