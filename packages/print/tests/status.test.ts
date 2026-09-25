import { describe, expect, it } from "vitest";
import {
  PROFILE_ESCPOS_80MM,
  describePrinterStatus,
  isEscPosStatusByte,
  parseDeviceId,
  parseEscPosStatus,
  parsePortStatus,
  queryPrinterStatus,
  testPageBytes,
  tuningSampleBitmap,
  type PrinterTransport,
} from "../src/index";

describe("parsePortStatus", () => {
  it("reads the Centronics lines; bit 3 is 'not error'", () => {
    expect(parsePortStatus(0x18)).toEqual({ paperEmpty: false, selected: true, error: false });
    expect(parsePortStatus(0x30)).toEqual({ paperEmpty: true, selected: true, error: true });
  });
});

describe("parseDeviceId", () => {
  it("splits IEEE 1284 key:value pairs", () => {
    expect(parseDeviceId("MFG:Masung;MDL:MS-EP8300;CMD:ESC/POS;")).toEqual({
      MFG: "Masung",
      MDL: "MS-EP8300",
      CMD: "ESC/POS",
    });
  });
});

describe("ESC/POS real-time status", () => {
  it("recognises status bytes by their fixed bits", () => {
    expect(isEscPosStatusByte(0x12)).toBe(true);
    expect(isEscPosStatusByte(0x1a)).toBe(true);
    expect(isEscPosStatusByte(0x00)).toBe(false);
    expect(isEscPosStatusByte(0xff)).toBe(false);
  });

  it("decodes each query", () => {
    expect(parseEscPosStatus(1, 0x1a)).toEqual({ online: false });
    expect(parseEscPosStatus(2, 0x16)).toMatchObject({ coverOpen: true, stoppedByPaperEnd: false });
    expect(parseEscPosStatus(3, 0x32)).toMatchObject({ unrecoverableError: true, cutterError: false });
    expect(parseEscPosStatus(4, 0x72)).toEqual({ paperNearEnd: false, paperEnd: true });
  });
});

function statusTransport(replies: Record<number, number | undefined>, extras: Partial<PrinterTransport> = {}): PrinterTransport {
  let lastQuery = 0;
  return {
    connected: true,
    deviceName: "Masung Printer",
    async connect() {},
    async choose() {},
    async forget() {},
    async disconnect() {},
    async write(bytes) {
      if (bytes[0] === 0x10 && bytes[1] === 0x04) lastQuery = bytes[2]!;
    },
    async read() {
      const byte = replies[lastQuery];
      return byte === undefined ? null : Uint8Array.of(byte);
    },
    ...extras,
  };
}

describe("queryPrinterStatus", () => {
  it("combines USB class status, device ID and ESC/POS replies", async () => {
    const transport = statusTransport(
      { 1: 0x12, 2: 0x32, 3: 0x12, 4: 0x72 },
      {
        linkDetails: () => "USB interface 0 (printer class), OUT ep 2, IN ep 1",
        portStatus: async () => 0x38,
        deviceId: async () => "MFG:Masung;MDL:MS-EP8300;CMD:ESC/POS;",
      },
    );
    const report = await queryPrinterStatus(transport, PROFILE_ESCPOS_80MM);

    expect(report.port).toEqual({ paperEmpty: true, selected: true, error: false });
    expect(report.escpos).toMatchObject({ online: true, stoppedByPaperEnd: true, paperEnd: true });
    expect(report.unanswered).toEqual([]);
    expect(describePrinterStatus(report)).toEqual([
      "USB interface 0 (printer class), OUT ep 2, IN ep 1",
      "Reports itself as: Masung MS-EP8300",
      "Command sets: ESC/POS",
      "USB port: online, PAPER EMPTY",
      "ESC/POS: online",
      "Out of paper",
      "Raw DLE EOT: 1=0x12 2=0x32 3=0x12 4=0x72",
    ]);
  });

  it("keeps going when one query fails", async () => {
    const transport = statusTransport(
      { 1: 0x12, 2: 0x12, 3: 0x12, 4: 0x12 },
      {
        deviceId: async () => {
          throw new RangeError("Offset is outside the bounds of the DataView");
        },
        portStatus: async () => null,
      },
    );
    const report = await queryPrinterStatus(transport, PROFILE_ESCPOS_80MM);

    expect(report.failures).toEqual(["USB device ID: Offset is outside the bounds of the DataView"]);
    expect(report.unanswered).toEqual(["USB port status"]);
    expect(report.escpos).toMatchObject({ online: true, paperEnd: false });
  });

  it("lists the queries a silent printer didn't answer", async () => {
    const report = await queryPrinterStatus(statusTransport({ 1: 0x12 }), PROFILE_ESCPOS_80MM);
    expect(report.unanswered).toEqual([
      "DLE EOT 2 (offlineCause)",
      "DLE EOT 3 (errorCause)",
      "DLE EOT 4 (paperSensor)",
    ]);
  });
});

describe("tuningSampleBitmap", () => {
  it("runs from white to solid black", () => {
    const bits = tuningSampleBitmap(16);
    const rowBytes = (y: number) => [...bits.baseAddr.subarray(y * bits.rowBytes, y * bits.rowBytes + 2)];
    expect(rowBytes(0)).toEqual([0, 0]);
    expect(rowBytes(bits.bounds.bottom - 1)).toEqual([0xff, 0xff]);
  });
});

describe("testPageBytes", () => {
  it("starts with ESC @ and contains text, a full-width raster bar and a cut", () => {
    const bytes = testPageBytes(PROFILE_ESCPOS_80MM);
    expect(Array.from(bytes.subarray(0, 2))).toEqual([0x1b, 0x40]);
    expect(new TextDecoder().decode(bytes)).toContain("Mockintosh test page\n");

    const raster = bytes.findIndex((b, i) => b === 0x1d && bytes[i + 1] === 0x76 && bytes[i + 2] === 0x30);
    expect(raster).toBeGreaterThan(0);
    // 576 dots = 72 bytes per row; 48 bar rows after the profile's 32-row lead-in.
    expect(Array.from(bytes.subarray(raster + 4, raster + 8))).toEqual([72, 0, 80, 0]);
    expect(Array.from(bytes.subarray(-3))).toEqual([0x1d, 0x56, 0x00]);
  });
});
