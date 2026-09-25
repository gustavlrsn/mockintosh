import { describe, it, expect } from "vitest";
import {
  BUILTIN_PRINTER_DRIVERS,
  DRIVER_CAT_58MM,
  bluetoothUuid,
  deviceRefOf,
  describePrinterIdentity,
  matchPrinterDrivers,
  type PrinterIdentity,
} from "../src/driver";
import {
  PrinterDriverFileError,
  parsePrinterDriver,
  parsePrinterDriverText,
  printerDriverToJSON,
} from "../src/driverFile";
import { identifyPrinter } from "../src/identify";
import { reportedIdentity } from "../src/probe";
import { widthTestBytes, widthStripBitmap } from "../src/testPage";
import type { PrinterTransport } from "../src/transport";

const MASUNG: PrinterIdentity = {
  link: "usb",
  name: "Masung Printer",
  usb: { vendorId: 0x0483, productId: 0x5720, productName: "Masung Printer" },
  deviceId: { MFG: "MASUNG", MDL: "M_ONE_TYPE", CMD: "ESC/POS" },
  reported: { maker: "MASUNG", model: "EP8300" },
};

describe("matchPrinterDrivers", () => {
  it("picks the Masung driver from its device ID and reported model", () => {
    const [best] = matchPrinterDrivers(MASUNG, BUILTIN_PRINTER_DRIVERS);
    expect(best!.driver.id).toBe("masung-ms-ep8300");
    expect(best!.reasons).toContain("reports model EP8300");
  });

  it("falls back to the generic 80 mm driver for an unknown USB printer", () => {
    const candidates = matchPrinterDrivers({ link: "usb", name: "POS-80", usb: { vendorId: 1, productId: 2 } }, BUILTIN_PRINTER_DRIVERS);
    expect(candidates[0]!.driver.id).toBe("escpos-80");
    expect(candidates.every((c) => c.driver.links.includes("usb"))).toBe(true);
  });

  it("recognises a cat printer and leaves out drivers whose Bluetooth service it lacks", () => {
    const candidates = matchPrinterDrivers(
      { link: "bluetooth", name: "GB02", bluetooth: { services: [bluetoothUuid(0xae30)] } },
      BUILTIN_PRINTER_DRIVERS,
    );
    expect(candidates.map((c) => c.driver.id)).toEqual([DRIVER_CAT_58MM.id]);
  });

  it("prefers the 58 mm ESC/POS driver on an ff00 Bluetooth printer", () => {
    const candidates = matchPrinterDrivers(
      { link: "bluetooth", name: "MPT-II", bluetooth: { services: [bluetoothUuid(0xff00)] } },
      BUILTIN_PRINTER_DRIVERS,
    );
    expect(candidates[0]!.driver.id).toBe("escpos-58");
  });
});

describe("identity", () => {
  it("keeps what's needed to find the same device again", () => {
    expect(deviceRefOf({ ...MASUNG, usb: { ...MASUNG.usb!, serialNumber: "A1" } })).toEqual({
      kind: "usb",
      vendorId: 0x0483,
      productId: 0x5720,
      serialNumber: "A1",
    });
    expect(deviceRefOf({ link: "bluetooth", name: "GB02", bluetooth: { id: "abc", services: [] } })).toEqual({
      kind: "bluetooth",
      id: "abc",
      name: "GB02",
    });
  });

  it("describes everything that was learned", () => {
    expect(describePrinterIdentity(MASUNG)).toEqual([
      'Connection: USB, "Masung Printer"',
      "USB ID: 0483:5720",
      "USB names: Masung Printer",
      "Device ID: MASUNG M_ONE_TYPE",
      "Command sets: ESC/POS",
      "Reports: MASUNG EP8300",
    ]);
  });

  it("reads maker, model and firmware from clone-style and Epson-style GS I replies", () => {
    const bytes = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));
    expect(
      reportedIdentity([
        { label: "", field: "rom", reply: bytes("APP22-08-25-D1\r\n") },
        { label: "", field: "maker", reply: bytes("MASUNG\0") },
        { label: "", field: "model", reply: bytes("_EP8300 \0") },
      ]),
    ).toEqual({ maker: "MASUNG", model: "EP8300", firmware: "APP22-08-25-D1" });
  });

  it("identifies over the transport, asking GS I only when told to", async () => {
    const writes: number[][] = [];
    const transport: PrinterTransport = {
      connected: true,
      deviceName: "Masung Printer",
      connect: async () => {},
      choose: async () => {},
      forget: async () => {},
      disconnect: async () => {},
      write: async (bytes) => void writes.push(Array.from(bytes)),
      read: async () => null,
      identity: () => ({ link: "usb", name: "Masung Printer", usb: { vendorId: 1, productId: 2 } }),
      deviceId: async () => "MFG:MASUNG;MDL:M_ONE_TYPE;CMD:ESC/POS;",
    };
    const quiet = await identifyPrinter(transport, { escpos: false });
    expect(quiet?.deviceId?.MFG).toBe("MASUNG");
    expect(writes).toHaveLength(0);
    await identifyPrinter(transport, { escpos: true });
    expect(writes.length).toBeGreaterThan(0);
  });
});

describe("driver files", () => {
  it("round-trips every built-in driver", () => {
    for (const driver of BUILTIN_PRINTER_DRIVERS) {
      const json = JSON.parse(JSON.stringify(printerDriverToJSON(driver)));
      expect(parsePrinterDriver(json)).toEqual(JSON.parse(JSON.stringify(driver)));
    }
  });

  it("writes Bluetooth ids as hex strings", () => {
    const json = printerDriverToJSON(DRIVER_CAT_58MM);
    expect(json.bluetooth).toEqual({ service: "ae30", write: "ae01" });
  });

  it("names the first bad field", () => {
    const base = printerDriverToJSON(DRIVER_CAT_58MM);
    expect(() => parsePrinterDriver({ ...base, dots: "wide" })).toThrow('"dots" should be a whole number');
    expect(() => parsePrinterDriver({ ...base, links: ["serial"] })).toThrow('"links[0]" should be usb or bluetooth');
    const { bluetooth: _drop, ...noGatt } = base;
    expect(() => parsePrinterDriver(noGatt)).toThrow('"bluetooth" should be set');
    expect(() => parsePrinterDriverText("{nope")).toThrow(PrinterDriverFileError);
  });
});

describe("width test", () => {
  it("draws both end blocks at the strip's full width", () => {
    const bits = widthStripBitmap(384);
    const at = (x: number, y: number) => (bits.baseAddr[y * bits.rowBytes + (x >> 3)]! >> (7 - (x & 7))) & 1;
    expect(at(0, 0)).toBe(1);
    expect(at(383, 0)).toBe(1);
    expect(at(200, 0)).toBe(0);
    expect(at(200, 12)).toBe(1);
  });

  it("prints one strip per candidate width", () => {
    const bytes = Array.from(widthTestBytes(BUILTIN_PRINTER_DRIVERS[0]!, [384, 576]));
    const rasterWidths: number[] = [];
    for (let i = 0; i + 5 < bytes.length; i++) {
      if (bytes[i] === 0x1d && bytes[i + 1] === 0x76 && bytes[i + 2] === 0x30) rasterWidths.push((bytes[i + 4]! | (bytes[i + 5]! << 8)) * 8);
    }
    expect(rasterWidths).toEqual([384, 576]);
  });
});
