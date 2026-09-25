/**
 * Printer driver files: a {@link PrinterDriver} as JSON, so users can add
 * printers the OS doesn't ship a driver for. Parsing is strict — a file
 * either yields a complete driver or a {@link PrinterDriverFileError} naming
 * the first bad field.
 *
 * ```json
 * {
 *   "format": "mockintosh-printer-driver",
 *   "version": 1,
 *   "id": "my-58mm",
 *   "name": "My 58 mm printer",
 *   "dialect": "escpos",
 *   "dots": 384,
 *   "paperWidthMm": 58,
 *   "dpi": 203,
 *   "links": ["bluetooth"],
 *   "hasCutter": false,
 *   "bluetooth": { "service": "ff00", "write": "ff02" },
 *   "match": { "bluetoothName": ["MPT-II"] }
 * }
 * ```
 *
 * Bluetooth ids are written as hex strings: 4 digits for 16-bit ids, or a
 * full UUID.
 */
import type { EscPosCutCommand, EscPosPrintTuning, PrinterDialect } from "./encoder";
import type {
  BluetoothGattProfile,
  PrinterDensityCommand,
  PrinterDriver,
  PrinterDriverMatch,
  PrinterLinkKind,
  PrinterSpeedCommand,
  PrinterSpeedControl,
} from "./driver";
import { PRINTER_SPEEDS } from "./printSpeed";

export const PRINTER_DRIVER_FORMAT = "mockintosh-printer-driver";
export const PRINTER_DRIVER_VERSION = 1;

export class PrinterDriverFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrinterDriverFileError";
  }
}

type Json = Record<string, unknown>;

const DIALECTS: readonly PrinterDialect[] = ["escpos", "cat"];
const LINKS: readonly PrinterLinkKind[] = ["usb", "bluetooth"];
const CUTS: readonly EscPosCutCommand[] = ["gs-v", "gs-v-feed", "esc-i"];
const DENSITY_COMMANDS: readonly PrinterDensityCommand[] = ["escpos-gs-e", "masung-dc3"];
const SPEED_COMMANDS: readonly PrinterSpeedCommand[] = ["masung-dc3"];
function fail(field: string, expected: string): never {
  throw new PrinterDriverFileError(`"${field}" should be ${expected}`);
}

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(o: Json, field: string): string {
  const v = o[field];
  if (typeof v !== "string" || v.trim() === "") fail(field, "a non-empty string");
  return v;
}

function optStr(o: Json, field: string): string | undefined {
  return o[field] === undefined ? undefined : str(o, field);
}

function int(o: Json, field: string, min: number, max: number): number {
  const v = o[field];
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) fail(field, `a whole number from ${min} to ${max}`);
  return v;
}

function optInt(o: Json, field: string, min: number, max: number): number | undefined {
  return o[field] === undefined ? undefined : int(o, field, min, max);
}

function oneOf<T extends string>(o: Json, field: string, allowed: readonly T[]): T {
  const v = o[field];
  if (typeof v !== "string" || !allowed.includes(v as T)) fail(field, `one of ${allowed.join(", ")}`);
  return v as T;
}

function bool(o: Json, field: string): boolean {
  const v = o[field];
  if (typeof v !== "boolean") fail(field, "true or false");
  return v;
}

function stringList(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((s) => typeof s !== "string")) fail(field, "a list of strings");
  return value as string[];
}

/** `"ff00"` → `0xff00`; a full UUID stays a string. */
function parseGattId(value: unknown, field: string): number | string {
  if (typeof value === "string") {
    if (/^[0-9a-f]{4}$/i.test(value)) return parseInt(value, 16);
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return value.toLowerCase();
  }
  return fail(field, 'a 4-digit hex id like "ff00" or a full UUID');
}

function formatGattId(id: number | string): string {
  return typeof id === "number" ? id.toString(16).padStart(4, "0") : id;
}

function parseBluetooth(value: unknown): BluetoothGattProfile {
  if (!isObject(value)) fail("bluetooth", "an object with service and write");
  return { service: parseGattId(value.service, "bluetooth.service"), write: parseGattId(value.write, "bluetooth.write") };
}

function parseMatch(value: unknown): PrinterDriverMatch {
  if (!isObject(value)) fail("match", "an object");
  const match: {
    usb?: { vendorId: number; productId?: number }[];
    deviceId?: { maker?: string; model?: string }[];
    reportedModel?: string[];
    bluetoothName?: string[];
    bluetoothService?: (number | string)[];
  } = {};
  if (value.usb !== undefined) {
    if (!Array.isArray(value.usb)) fail("match.usb", "a list");
    match.usb = value.usb.map((rule, i) => {
      if (!isObject(rule)) fail(`match.usb[${i}]`, "an object");
      return {
        vendorId: int(rule, "vendorId", 0, 0xffff),
        ...(rule.productId !== undefined ? { productId: int(rule, "productId", 0, 0xffff) } : {}),
      };
    });
  }
  if (value.deviceId !== undefined) {
    if (!Array.isArray(value.deviceId)) fail("match.deviceId", "a list");
    match.deviceId = value.deviceId.map((rule, i) => {
      if (!isObject(rule)) fail(`match.deviceId[${i}]`, "an object");
      return { maker: optStr(rule, "maker"), model: optStr(rule, "model") };
    });
  }
  if (value.reportedModel !== undefined) match.reportedModel = stringList(value.reportedModel, "match.reportedModel");
  if (value.bluetoothName !== undefined) match.bluetoothName = stringList(value.bluetoothName, "match.bluetoothName");
  if (value.bluetoothService !== undefined) {
    if (!Array.isArray(value.bluetoothService)) fail("match.bluetoothService", "a list");
    match.bluetoothService = value.bluetoothService.map((id, i) => parseGattId(id, `match.bluetoothService[${i}]`));
  }
  return match;
}

function parseSpeed(value: unknown): PrinterSpeedControl {
  if (!isObject(value)) fail("speed", 'an object like { "command": "masung-dc3" }');
  const command = oneOf(value, "command", SPEED_COMMANDS);
  if (value.levels === undefined) return { command };
  if (!Array.isArray(value.levels) || value.levels.length === 0) fail("speed.levels", "a non-empty list");
  const levels = value.levels.map((level, i) => {
    if (!isObject(level)) fail(`speed.levels[${i}]`, 'an object like { "speed": "low", "label": "200 mm/s" }');
    return { speed: oneOf(level, "speed", PRINTER_SPEEDS), label: str(level, "label") };
  });
  return { command, levels };
}

function parseTuning(value: unknown): EscPosPrintTuning {
  if (!isObject(value)) fail("tuning", "an object");
  switch (value.command) {
    case "gs-k":
      return { command: "gs-k", density: optInt(value, "density", -6, 8), speed: optInt(value, "speed", 1, 13) };
    case "dc2-density":
      return { command: "dc2-density", density: int(value, "density", 0, 31), breakTime: int(value, "breakTime", 0, 7) };
    case "esc-7":
      return {
        command: "esc-7",
        heatingDots: int(value, "heatingDots", 0, 255),
        heatingTime: int(value, "heatingTime", 0, 255),
        heatingInterval: int(value, "heatingInterval", 0, 255),
      };
    default:
      return fail("tuning.command", "gs-k, dc2-density or esc-7");
  }
}

/** Validate a parsed JSON value as a driver file. */
export function parsePrinterDriver(value: unknown): PrinterDriver {
  if (!isObject(value)) throw new PrinterDriverFileError("A driver file should hold a JSON object");
  if (value.format !== PRINTER_DRIVER_FORMAT) fail("format", `"${PRINTER_DRIVER_FORMAT}"`);
  if (value.version !== PRINTER_DRIVER_VERSION) fail("version", String(PRINTER_DRIVER_VERSION));
  if (!Array.isArray(value.links) || value.links.length === 0) fail("links", 'a list like ["usb"]');
  const links = value.links.map((link, i): PrinterLinkKind =>
    LINKS.includes(link as PrinterLinkKind) ? (link as PrinterLinkKind) : fail(`links[${i}]`, "usb or bluetooth"),
  );
  const driver: PrinterDriver = {
    id: str(value, "id"),
    name: str(value, "name"),
    maker: optStr(value, "maker"),
    dialect: oneOf(value, "dialect", DIALECTS),
    dots: int(value, "dots", 8, 4096),
    paperWidthMm: int(value, "paperWidthMm", 10, 300),
    dpi: int(value, "dpi", 50, 1200),
    links,
    hasCutter: bool(value, "hasCutter"),
  };
  if (value.cutCommand !== undefined) driver.cutCommand = oneOf(value, "cutCommand", CUTS);
  if (value.rasterBandRows !== undefined) driver.rasterBandRows = int(value, "rasterBandRows", 1, 65535);
  if (value.rasterLeadInRows !== undefined) driver.rasterLeadInRows = int(value, "rasterLeadInRows", 0, 1024);
  if (value.tuning !== undefined) driver.tuning = parseTuning(value.tuning);
  if (value.bluetooth !== undefined) driver.bluetooth = parseBluetooth(value.bluetooth);
  if (value.density !== undefined) {
    if (!isObject(value.density)) fail("density", 'an object like { "command": "escpos-gs-e" }');
    driver.density = { command: oneOf(value.density, "command", DENSITY_COMMANDS) };
  }
  if (value.speed !== undefined) driver.speed = parseSpeed(value.speed);
  if (value.match !== undefined) driver.match = parseMatch(value.match);
  if (links.includes("bluetooth") && !driver.bluetooth) fail("bluetooth", "set when links includes bluetooth");
  return driver;
}

/** Parse driver file text. */
export function parsePrinterDriverText(text: string): PrinterDriver {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new PrinterDriverFileError(`Not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  return parsePrinterDriver(value);
}

/** The driver as a JSON-ready object in the file format. */
export function printerDriverToJSON(driver: PrinterDriver): Json {
  const json: Json = {
    format: PRINTER_DRIVER_FORMAT,
    version: PRINTER_DRIVER_VERSION,
    id: driver.id,
    name: driver.name,
    ...(driver.maker ? { maker: driver.maker } : {}),
    dialect: driver.dialect,
    dots: driver.dots,
    paperWidthMm: driver.paperWidthMm,
    dpi: driver.dpi,
    links: [...driver.links],
    hasCutter: driver.hasCutter,
  };
  if (driver.cutCommand) json.cutCommand = driver.cutCommand;
  if (driver.rasterBandRows !== undefined) json.rasterBandRows = driver.rasterBandRows;
  if (driver.rasterLeadInRows !== undefined) json.rasterLeadInRows = driver.rasterLeadInRows;
  if (driver.tuning) json.tuning = { ...driver.tuning };
  if (driver.density) json.density = { command: driver.density.command };
  if (driver.speed) {
    json.speed = {
      command: driver.speed.command,
      ...(driver.speed.levels ? { levels: driver.speed.levels.map((l) => ({ ...l })) } : {}),
    };
  }
  if (driver.bluetooth) {
    json.bluetooth = { service: formatGattId(driver.bluetooth.service), write: formatGattId(driver.bluetooth.write) };
  }
  const m = driver.match;
  if (m) {
    const match: Json = {};
    if (m.usb) match.usb = m.usb.map((rule) => ({ ...rule }));
    if (m.deviceId) match.deviceId = m.deviceId.map((rule) => ({ ...rule }));
    if (m.reportedModel) match.reportedModel = [...m.reportedModel];
    if (m.bluetoothName) match.bluetoothName = [...m.bluetoothName];
    if (m.bluetoothService) match.bluetoothService = m.bluetoothService.map(formatGattId);
    json.match = match;
  }
  return json;
}
