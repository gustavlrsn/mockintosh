/**
 * The configured printers, saved as the "Printers" file in the Preferences
 * folder: which physical device each one is, which driver it uses, and
 * which one is the default.
 *
 * ```json
 * {
 *   "version": 1,
 *   "defaultId": "p-lx2k9",
 *   "printers": [
 *     { "id": "p-lx2k9", "name": "POS-80", "driverId": "masung-ms-ep8300", "speed": "low", "density": 150,
 *       "device": { "kind": "usb", "vendorId": 1155, "productId": 1803 } },
 *     { "id": "p-m03a1", "name": "MPT-II", "driverId": "escpos-58", "dots": 384,
 *       "device": { "kind": "bluetooth", "id": "Xk2…", "name": "MPT-II" } }
 *   ]
 * }
 * ```
 */
import { PRINTER_SPEEDS, type PrinterDeviceRef, type PrinterSpeed } from "@mockintosh/print";

export const PRINTER_LIST_FILE = "Printers";
export const PRINTER_LIST_VERSION = 1;

export interface ConfiguredPrinter {
  id: string;
  /** What the Chooser calls it. */
  name: string;
  driverId: string;
  /** How to find the device again. */
  device: PrinterDeviceRef;
  /** Dots per line, when a width test showed the driver's default is wrong. */
  dots?: number;
  /**
   * The speed and density last stored in the printer from here. Only a
   * record: the printer keeps these itself and can't be asked for them.
   */
  speed?: PrinterSpeed;
  density?: number;
}

export interface PrinterList {
  defaultId: string | null;
  printers: ConfiguredPrinter[];
}

export const EMPTY_PRINTER_LIST: PrinterList = { defaultId: null, printers: [] };

export class PrinterListError extends Error {
  constructor(message: string) {
    super(`The Printers preferences file can't be read: ${message}`);
    this.name = "PrinterListError";
  }
}

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function text(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new PrinterListError(`"${field}" should be text`);
  return value;
}

function optionalText(value: unknown, field: string): string | undefined {
  return value === undefined ? undefined : text(value, field);
}

function uint16(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 0xffff) {
    throw new PrinterListError(`"${field}" should be a USB id from 0 to 65535`);
  }
  return value;
}

function parseDeviceRef(value: unknown, field: string): PrinterDeviceRef {
  if (!isObject(value)) throw new PrinterListError(`"${field}" should be an object`);
  if (value.kind === "usb") {
    const serialNumber = optionalText(value.serialNumber, `${field}.serialNumber`);
    return {
      kind: "usb",
      vendorId: uint16(value.vendorId, `${field}.vendorId`),
      productId: uint16(value.productId, `${field}.productId`),
      ...(serialNumber ? { serialNumber } : {}),
    };
  }
  if (value.kind === "bluetooth") {
    const id = optionalText(value.id, `${field}.id`);
    const name = optionalText(value.name, `${field}.name`);
    return { kind: "bluetooth", ...(id ? { id } : {}), ...(name ? { name } : {}) };
  }
  throw new PrinterListError(`"${field}.kind" should be usb or bluetooth`);
}

function parsePrinter(value: unknown, field: string): ConfiguredPrinter {
  if (!isObject(value)) throw new PrinterListError(`"${field}" should be an object`);
  const printer: ConfiguredPrinter = {
    id: text(value.id, `${field}.id`),
    name: text(value.name, `${field}.name`),
    driverId: text(value.driverId, `${field}.driverId`),
    device: parseDeviceRef(value.device, `${field}.device`),
  };
  if (value.dots !== undefined) {
    const dots = value.dots;
    if (typeof dots !== "number" || !Number.isInteger(dots) || dots < 8 || dots > 4096) {
      throw new PrinterListError(`"${field}.dots" should be a whole number from 8 to 4096`);
    }
    printer.dots = dots;
  }
  if (value.speed !== undefined) {
    const speed = PRINTER_SPEEDS.find((s) => s === value.speed);
    if (!speed) throw new PrinterListError(`"${field}.speed" should be one of ${PRINTER_SPEEDS.join(", ")}`);
    printer.speed = speed;
  }
  if (value.density !== undefined) {
    if (typeof value.density !== "number" || !Number.isInteger(value.density)) {
      throw new PrinterListError(`"${field}.density" should be a whole number`);
    }
    printer.density = value.density;
  }
  return printer;
}

export function parsePrinterList(source: string): PrinterList {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    throw new PrinterListError(error instanceof Error ? error.message : String(error));
  }
  if (!isObject(value)) throw new PrinterListError("expected an object");
  if (value.version !== PRINTER_LIST_VERSION) {
    throw new PrinterListError(`"version" should be ${PRINTER_LIST_VERSION}`);
  }
  if (!Array.isArray(value.printers)) throw new PrinterListError(`"printers" should be a list`);
  const printers = value.printers.map((p, i) => parsePrinter(p, `printers[${i}]`));
  const ids = new Set<string>();
  for (const p of printers) {
    if (ids.has(p.id)) throw new PrinterListError(`two printers have the id "${p.id}"`);
    ids.add(p.id);
  }
  const defaultId = value.defaultId === null || value.defaultId === undefined ? null : text(value.defaultId, "defaultId");
  return { defaultId: defaultId && ids.has(defaultId) ? defaultId : (printers[0]?.id ?? null), printers };
}

export function serializePrinterList(list: PrinterList): string {
  return JSON.stringify({ version: PRINTER_LIST_VERSION, ...list }, null, 2) + "\n";
}

export function sameDeviceRef(a: PrinterDeviceRef, b: PrinterDeviceRef): boolean {
  if (a.kind === "usb" && b.kind === "usb") {
    return a.vendorId === b.vendorId && a.productId === b.productId && (a.serialNumber ?? "") === (b.serialNumber ?? "");
  }
  if (a.kind === "bluetooth" && b.kind === "bluetooth") {
    return a.id !== undefined ? a.id === b.id : a.name !== undefined && a.name === b.name;
  }
  return false;
}
