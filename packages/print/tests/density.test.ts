import { describe, expect, it, vi } from "vitest";
import { DRIVER_MASUNG_MS_EP8300 } from "../src/driver";
import { PRINTER_DENSITY_SCALES, densityLevelName, writePrinterDensity } from "../src/density";
import { masungDensityBytes } from "../src/masung";
import { writePrinterSpeed } from "../src/printSpeed";
import { parsePrinterDriver, printerDriverToJSON } from "../src/driverFile";
import { loadBlockBitmap } from "../src/testPage";
import type { PrinterTransport } from "../src/transport";

function recorder(): PrinterTransport & { writes: number[][] } {
  const writes: number[][] = [];
  return {
    writes,
    connected: true,
    deviceName: "POS-80",
    connect: async () => {},
    choose: async () => {},
    forget: async () => {},
    disconnect: async () => {},
    write: async (bytes) => {
      writes.push([...bytes]);
    },
  };
}

describe("Masung print speed", () => {
  it.each([
    ["low", 0],
    ["normal", 1],
    ["high", 2],
  ] as const)("sends DC3 t D \" for %s", async (speed, code) => {
    vi.useFakeTimers();
    try {
      const transport = recorder();
      const done = writePrinterSpeed(transport, "masung-dc3", speed);
      await vi.runAllTimersAsync();
      await done;
      expect(transport.writes).toEqual([[0x13, 0x74, 0x44, 0x22, code]]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the speed command and its named levels in driver files", () => {
    const json = printerDriverToJSON(DRIVER_MASUNG_MS_EP8300);
    expect(parsePrinterDriver(json).speed).toEqual({
      command: "masung-dc3",
      levels: [
        { speed: "low", label: "200 mm/s" },
        { speed: "normal", label: "300 mm/s" },
      ],
    });
  });

  it("rejects a speed level the command can't send", () => {
    const json = {
      ...printerDriverToJSON(DRIVER_MASUNG_MS_EP8300),
      speed: { command: "masung-dc3", levels: [{ speed: "turbo", label: "400 mm/s" }] },
    };
    expect(() => parsePrinterDriver(json)).toThrow(/speed/);
  });
});

describe("heat tests", () => {
  it("centres load blocks of a quarter, half and whole line", () => {
    const blackDots = (fraction: number) => {
      const bits = loadBlockBitmap(576, fraction);
      let count = 0;
      for (let x = 0; x < 576; x++) if (bits.baseAddr[x >> 3]! & (0x80 >> (x & 7))) count++;
      const first = [...Array(576).keys()].find((x) => bits.baseAddr[x >> 3]! & (0x80 >> (x & 7)));
      return { count, first };
    };
    expect(blackDots(0.25)).toEqual({ count: 144, first: 216 });
    expect(blackDots(0.5)).toEqual({ count: 288, first: 144 });
    expect(blackDots(1)).toEqual({ count: 576, first: 0 });
  });
});

describe("densityLevelName", () => {
  it.each([
    [70, "85%"],
    [101, "85%"],
    [102, "100%"],
    [134, "100%"],
    [135, "115%"],
    [168, "115%"],
    [175, "130%"],
    [200, "130%"],
  ])("names Masung level %i as the self-test's %s", (level, name) => {
    expect(densityLevelName(PRINTER_DENSITY_SCALES["masung-dc3"], level)).toBe(name);
  });

  it("signs positive levels on a ± scale without steps", () => {
    expect(densityLevelName(PRINTER_DENSITY_SCALES["escpos-gs-e"], 3)).toBe("+3");
    expect(densityLevelName(PRINTER_DENSITY_SCALES["escpos-gs-e"], -3)).toBe("-3");
  });
});

describe("printer density", () => {
  it("encodes Masung DC3 t D f n", () => {
    expect([...masungDensityBytes(100)]).toEqual([0x13, 0x74, 0x44, 0x66, 0x64]);
    expect([...masungDensityBytes(200)]).toEqual([0x13, 0x74, 0x44, 0x66, 0xc8]);
    expect(() => masungDensityBytes(69)).toThrow("70 to 200");
    expect(() => masungDensityBytes(201)).toThrow("70 to 200");
  });

  it("writes the Masung command, and refuses levels outside its scale", async () => {
    const transport = recorder();
    vi.useFakeTimers();
    try {
      const done = writePrinterDensity(transport, "masung-dc3", 150);
      await vi.runAllTimersAsync();
      await done;
    } finally {
      vi.useRealTimers();
    }
    expect(transport.writes).toEqual([[0x13, 0x74, 0x44, 0x66, 150]]);
    await expect(writePrinterDensity(transport, "masung-dc3", 3)).rejects.toThrow("70 to 200");
    expect(transport.writes).toHaveLength(1);
  });

  it("keeps the density command in driver files", () => {
    const json = printerDriverToJSON(DRIVER_MASUNG_MS_EP8300);
    expect(json.density).toEqual({ command: "masung-dc3" });
    expect(parsePrinterDriver(json).density).toEqual({ command: "masung-dc3" });
    expect(() => parsePrinterDriver({ ...json, density: { command: "dc2" } })).toThrow('"command" should be one of');
  });
});
