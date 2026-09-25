/**
 * Printer drivers — what the OS knows about a kind of printer that the
 * printer can't tell it: paper width, dots per line, command-set quirks,
 * how it's reached. Plus the rules for recognising one from what it does
 * report (its {@link PrinterIdentity}).
 *
 * A driver is data. Built-ins ship in {@link BUILTIN_PRINTER_DRIVERS}; the OS
 * adds user drivers from JSON files (see `driverFile.ts`).
 */
import {
  PROFILE_CAT_58MM,
  PROFILE_ESCPOS_58MM,
  PROFILE_ESCPOS_80MM,
  type PrinterProfile,
} from "./encoder";
import type { PrinterDeviceId } from "./status";

/** How a printer is reached. */
export type PrinterLinkKind = "usb" | "bluetooth";

/**
 * A Bluetooth LE GATT service and its write characteristic. 16-bit ids are
 * numbers (`0xff00`); full 128-bit UUIDs are strings.
 */
export interface BluetoothGattProfile {
  service: number | string;
  write: number | string;
}

/** Ways to recognise a driver's printers. Strings match case-insensitively as substrings / prefixes. */
export interface PrinterDriverMatch {
  /** USB vendor (and optionally product) ids. */
  usb?: readonly { vendorId: number; productId?: number }[];
  /** Fields of the USB printer-class device ID (`MFG`, `MDL`). */
  deviceId?: readonly { maker?: string; model?: string }[];
  /** Model names the printer reports about itself (device ID `MDL`, ESC/POS `GS I`). */
  reportedModel?: readonly string[];
  /** Bluetooth advertised-name prefixes. */
  bluetoothName?: readonly string[];
  /** Bluetooth GATT services the printer offers. */
  bluetoothService?: readonly (number | string)[];
}

/**
 * How a printer stores its print density (heat) in its own memory. Both
 * kinds persist across power cycles.
 * - `escpos-gs-e`: Epson `GS ( E` user setting 5, −6…+6, standard 0.
 * - `masung-dc3`: Masung `DC3 t D f n`, 70…200, standard 100 (from Masung's setup tools).
 */
export type PrinterDensityCommand = "escpos-gs-e" | "masung-dc3";

export interface PrinterDensityControl {
  command: PrinterDensityCommand;
}

/**
 * How a printer's print speed is set.
 * - `masung-dc3`: Masung `DC3 t D " n`, low / normal / high (from Masung's Editor app).
 */
export type PrinterSpeedCommand = "masung-dc3";

export type PrinterSpeed = "low" | "normal" | "high";

export interface PrinterSpeedControl {
  command: PrinterSpeedCommand;
  /**
   * The speeds this printer really has, slowest first, named as its
   * self-test names them (e.g. "200 mm/s"). Absent offers every speed the
   * command can send, as Low / Normal / High.
   */
  levels?: readonly PrinterSpeedLevel[];
}

export interface PrinterSpeedLevel {
  speed: PrinterSpeed;
  label: string;
}

export interface PrinterDriver extends PrinterProfile {
  maker?: string;
  /** Roll width. The printable width is {@link PrinterProfile.dots}. */
  paperWidthMm: number;
  /** Dots per inch across the head (203 for nearly all receipt printers). */
  dpi: number;
  links: readonly PrinterLinkKind[];
  /** Whether the printer has an auto-cutter; without one, jobs end with a tear-off feed. */
  hasCutter: boolean;
  /** How to write to it over Bluetooth LE, when `links` includes `"bluetooth"`. */
  bluetooth?: BluetoothGattProfile;
  /** How to change its stored print density, if it can. */
  density?: PrinterDensityControl;
  /** How to change its print speed, if it can. */
  speed?: PrinterSpeedControl;
  match?: PrinterDriverMatch;
}

/**
 * What a connected printer reports: link-level facts first (free, from the
 * USB descriptors or the Bluetooth advertisement), then answers to queries.
 */
export interface PrinterIdentity {
  link: PrinterLinkKind;
  /** The name the device goes by (USB product name, Bluetooth name). */
  name: string | null;
  usb?: {
    vendorId: number;
    productId: number;
    manufacturerName?: string;
    productName?: string;
    serialNumber?: string;
  };
  bluetooth?: {
    /** The browser's / stack's stable id for the device, for reconnecting. */
    id?: string;
    /** GATT services found on it (normalised UUID strings). */
    services: string[];
  };
  /** USB printer-class IEEE 1284 device ID. */
  deviceId?: PrinterDeviceId;
  /** What the printer says about itself over its command set (ESC/POS `GS I`). */
  reported?: { maker?: string; model?: string; firmware?: string };
}

/**
 * Enough to find the same physical printer again later — what a configured
 * printer stores.
 */
export type PrinterDeviceRef =
  | { kind: "usb"; vendorId: number; productId: number; serialNumber?: string }
  | { kind: "bluetooth"; id?: string; name?: string };

export function deviceRefOf(identity: PrinterIdentity): PrinterDeviceRef | null {
  if (identity.link === "usb") {
    if (!identity.usb) return null;
    const { vendorId, productId, serialNumber } = identity.usb;
    return { kind: "usb", vendorId, productId, ...(serialNumber ? { serialNumber } : {}) };
  }
  return { kind: "bluetooth", id: identity.bluetooth?.id, name: identity.name ?? undefined };
}

/** Bluetooth SIG base UUID form of a 16-bit id; 128-bit strings are lower-cased. */
export function bluetoothUuid(id: number | string): string {
  if (typeof id === "string") return id.toLowerCase();
  return `0000${id.toString(16).padStart(4, "0")}-0000-1000-8000-00805f9b34fb`;
}

// ---------------------------------------------------------------------------
// Built-in drivers
// ---------------------------------------------------------------------------

/** Phomemo, PeriPage and many generic ESC/POS Bluetooth printers. */
export const GATT_ESCPOS_FF00: BluetoothGattProfile = { service: 0xff00, write: 0xff02 };
/** Common "MTP-II" / "PT-210" style ESC/POS Bluetooth modules. */
export const GATT_ESCPOS_18F0: BluetoothGattProfile = { service: 0x18f0, write: 0x2af1 };
/** GB0x / MX0x "cat printers". */
export const GATT_CAT_AE30: BluetoothGattProfile = { service: 0xae30, write: 0xae01 };

export const DRIVER_ESCPOS_80MM: PrinterDriver = {
  ...PROFILE_ESCPOS_80MM,
  name: "Generic ESC/POS 80 mm",
  paperWidthMm: 80,
  dpi: 203,
  links: ["usb", "bluetooth"],
  hasCutter: true,
  bluetooth: GATT_ESCPOS_FF00,
  density: { command: "escpos-gs-e" },
};

export const DRIVER_ESCPOS_58MM: PrinterDriver = {
  ...PROFILE_ESCPOS_58MM,
  name: "Generic ESC/POS 58 mm",
  paperWidthMm: 58,
  dpi: 203,
  links: ["usb", "bluetooth"],
  hasCutter: false,
  bluetooth: GATT_ESCPOS_FF00,
  density: { command: "escpos-gs-e" },
  match: { bluetoothService: [GATT_ESCPOS_FF00.service] },
};

export const DRIVER_ESCPOS_58MM_18F0: PrinterDriver = {
  ...PROFILE_ESCPOS_58MM,
  id: "escpos-58-18f0",
  name: "ESC/POS 58 mm (Bluetooth 18F0)",
  paperWidthMm: 58,
  dpi: 203,
  links: ["bluetooth"],
  hasCutter: false,
  bluetooth: GATT_ESCPOS_18F0,
  match: { bluetoothService: [GATT_ESCPOS_18F0.service] },
};

export const DRIVER_MASUNG_MS_EP8300: PrinterDriver = {
  ...PROFILE_ESCPOS_80MM,
  id: "masung-ms-ep8300",
  name: "Masung MS-EP8300",
  maker: "Masung",
  paperWidthMm: 80,
  dpi: 203,
  links: ["usb"],
  hasCutter: true,
  // It ignores GS ( E density and GS ( B low speed; Masung's Editor app uses
  // DC3 t D f and DC3 t D " instead. Self-test on APP22-08-25-D1: low 200 mm/s
  // (full-width black prints darker), normal 300 mm/s; it has no faster one.
  density: { command: "masung-dc3" },
  speed: {
    command: "masung-dc3",
    levels: [
      { speed: "low", label: "200 mm/s" },
      { speed: "normal", label: "300 mm/s" },
    ],
  },
  match: { deviceId: [{ maker: "MASUNG" }], reportedModel: ["EP8300"] },
};

export const DRIVER_CAT_58MM: PrinterDriver = {
  ...PROFILE_CAT_58MM,
  name: "Cat printer 58 mm (GB0x / MX0x)",
  paperWidthMm: 58,
  dpi: 203,
  links: ["bluetooth"],
  hasCutter: false,
  bluetooth: GATT_CAT_AE30,
  match: { bluetoothName: ["GB0", "MX0"], bluetoothService: [GATT_CAT_AE30.service] },
};

export const BUILTIN_PRINTER_DRIVERS: readonly PrinterDriver[] = [
  DRIVER_ESCPOS_80MM,
  DRIVER_ESCPOS_58MM,
  DRIVER_ESCPOS_58MM_18F0,
  DRIVER_MASUNG_MS_EP8300,
  DRIVER_CAT_58MM,
];

/** A driver standing in for a bare profile (e.g. a board's fixed printer). */
export function driverForProfile(profile: PrinterProfile, links: readonly PrinterLinkKind[]): PrinterDriver {
  const builtIn = BUILTIN_PRINTER_DRIVERS.find((d) => d.id === profile.id);
  if (builtIn) return { ...builtIn, ...profile, links };
  return {
    ...profile,
    paperWidthMm: profile.dots >= 500 ? 80 : 58,
    dpi: 203,
    links,
    hasCutter: false,
  };
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

export interface PrinterDriverCandidate {
  driver: PrinterDriver;
  /** Higher is a better fit; 0 means only that the link kind fits. */
  score: number;
  /** Why it matched, for the Chooser. */
  reasons: string[];
}

const includesCI = (haystack: string | undefined, needle: string) =>
  !!haystack && haystack.toLowerCase().includes(needle.toLowerCase());
const startsWithCI = (haystack: string | null | undefined, prefix: string) =>
  !!haystack && haystack.toLowerCase().startsWith(prefix.toLowerCase());

function scoreDriver(driver: PrinterDriver, identity: PrinterIdentity): PrinterDriverCandidate {
  const reasons: string[] = [];
  let score = 0;
  const m = driver.match ?? {};
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(reason);
  };

  const usb = identity.usb;
  if (usb) {
    for (const rule of m.usb ?? []) {
      if (rule.vendorId !== usb.vendorId) continue;
      if (rule.productId === undefined) add(40, "USB vendor");
      else if (rule.productId === usb.productId) add(100, "USB vendor and product");
    }
  }

  const deviceId = identity.deviceId;
  if (deviceId) {
    const maker = deviceId.MFG ?? deviceId.MANUFACTURER;
    const model = deviceId.MDL ?? deviceId.MODEL;
    for (const rule of m.deviceId ?? []) {
      const makerOk = rule.maker === undefined || includesCI(maker, rule.maker);
      const modelOk = rule.model === undefined || includesCI(model, rule.model);
      if (makerOk && modelOk) add(rule.model ? 80 : 30, rule.model ? "USB device ID model" : "USB device ID maker");
    }
  }

  const models = [identity.reported?.model, deviceId?.MDL, deviceId?.MODEL, identity.usb?.productName];
  for (const name of m.reportedModel ?? []) {
    if (models.some((model) => includesCI(model, name))) add(80, `reports model ${name}`);
  }

  if (identity.link === "bluetooth") {
    for (const prefix of m.bluetoothName ?? []) {
      if (startsWithCI(identity.name, prefix)) add(60, `Bluetooth name ${prefix}…`);
    }
    const services = identity.bluetooth?.services ?? [];
    for (const service of m.bluetoothService ?? []) {
      if (services.includes(bluetoothUuid(service))) add(30, "Bluetooth service");
    }
    // Writing needs the driver's own GATT service to be there.
    if (driver.bluetooth && services.length > 0 && !services.includes(bluetoothUuid(driver.bluetooth.service))) {
      score = -1;
    }
  }
  return { driver, score, reasons };
}

/**
 * Drivers that can talk to `identity`'s link, best first. Drivers that don't
 * support the link (or, over Bluetooth, whose service the device lacks) are left out.
 */
export function matchPrinterDrivers(
  identity: PrinterIdentity,
  drivers: readonly PrinterDriver[],
): PrinterDriverCandidate[] {
  return drivers
    .filter((driver) => driver.links.includes(identity.link))
    .map((driver) => scoreDriver(driver, identity))
    .filter((candidate) => candidate.score >= 0)
    .sort((a, b) => b.score - a.score);
}

/** The identity as plain lines, for the Chooser. */
export function describePrinterIdentity(identity: PrinterIdentity): string[] {
  const lines: string[] = [];
  const hex4 = (n: number) => n.toString(16).padStart(4, "0");
  lines.push(`Connection: ${identity.link === "usb" ? "USB" : "Bluetooth"}${identity.name ? `, "${identity.name}"` : ""}`);
  const usb = identity.usb;
  if (usb) {
    lines.push(`USB ID: ${hex4(usb.vendorId)}:${hex4(usb.productId)}`);
    const names = [usb.manufacturerName, usb.productName].filter(Boolean).join(" / ");
    if (names) lines.push(`USB names: ${names}`);
    if (usb.serialNumber) lines.push(`USB serial: ${usb.serialNumber}`);
  }
  if (identity.bluetooth?.services.length) {
    lines.push(`Bluetooth services: ${identity.bluetooth.services.map(shortUuid).join(", ")}`);
  }
  const d = identity.deviceId;
  if (d) {
    const maker = d.MFG ?? d.MANUFACTURER;
    const model = d.MDL ?? d.MODEL;
    const cmd = d.CMD ?? d["COMMAND SET"];
    if (maker || model) lines.push(`Device ID: ${[maker, model].filter(Boolean).join(" ")}`);
    if (cmd) lines.push(`Command sets: ${cmd}`);
  }
  const r = identity.reported;
  if (r && (r.maker || r.model || r.firmware)) {
    lines.push(`Reports: ${[r.maker, r.model].filter(Boolean).join(" ")}${r.firmware ? `, firmware ${r.firmware}` : ""}`);
  }
  return lines;
}

/** `0000ff00-0000-1000-8000-00805f9b34fb` → `ff00`. */
function shortUuid(uuid: string): string {
  const m = /^0000([0-9a-f]{4})-0000-1000-8000-00805f9b34fb$/.exec(uuid);
  return m ? m[1]! : uuid;
}
