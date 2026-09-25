import { describe, expect, it } from "vitest";
import { PaintRect } from "@mockintosh/quickdraw";
import { makeRect } from "@mockintosh/quickdraw/bits";
import { PROFILE_ESCPOS_80MM, PrinterCancelledError, type PrinterTransport } from "@mockintosh/print";
import { createPrinterDevice, type PrinterDeviceOptions, type PrinterSetup } from "./device";

const SETUP: PrinterSetup = { profile: PROFILE_ESCPOS_80MM, hasCutter: true };
const createPrintService = (transport: PrinterTransport, options?: PrinterDeviceOptions) =>
  createPrinterDevice(transport, () => SETUP, options);

/** ESC/POS `GS V` — every cut command starts with it. */
const endsWithCut = (bytes: Uint8Array) =>
  Array.from(bytes).some((b, i) => b === 0x1d && bytes[i + 1] === 0x56);

interface FakeTransport extends PrinterTransport {
  writes: Uint8Array[];
}

/** `pick` stands in for the browser's device picker: it names the chosen device or rejects. */
function fakeTransport(pick: () => Promise<string>): FakeTransport {
  let device: string | null = null;
  const writes: Uint8Array[] = [];
  return {
    writes,
    get connected() {
      return device !== null;
    },
    get deviceName() {
      return device;
    },
    async connect() {
      device ??= await pick();
    },
    async choose() {
      device = await pick();
    },
    async write(bytes) {
      writes.push(bytes);
    },
    async disconnect() {
      device = null;
    },
    async forget() {
      device = null;
    },
  };
}

const IMAGE = { width: 8, height: 8, data: new Uint8Array(64).fill(1) };

/** Unpack ESC/POS `GS v 0` bands into row-major 0/1 pixels, `1` = black. */
function rasterPixels(bytes: Uint8Array, width: number): Uint8Array {
  const bytesPerRow = Math.ceil(width / 8);
  const rows: Uint8Array[] = [];
  for (let i = 0; i + 8 <= bytes.length; i++) {
    if (bytes[i] !== 0x1d || bytes[i + 1] !== 0x76 || bytes[i + 2] !== 0x30) continue;
    const rowBytes = bytes[i + 4]! | (bytes[i + 5]! << 8);
    const bandRows = bytes[i + 6]! | (bytes[i + 7]! << 8);
    const start = i + 8;
    if (rowBytes !== bytesPerRow || start + rowBytes * bandRows > bytes.length) continue;
    for (let row = 0; row < bandRows; row++) {
      const packed = bytes.subarray(start + row * rowBytes, start + (row + 1) * rowBytes);
      const pixels = new Uint8Array(width);
      for (let x = 0; x < width; x++) pixels[x] = (packed[x >> 3]! >> (7 - (x & 7))) & 1;
      rows.push(pixels);
    }
    i = start + rowBytes * bandRows - 1;
  }
  const out = new Uint8Array(width * rows.length);
  rows.forEach((row, y) => out.set(row, y * width));
  return out;
}
const cancel = () => Promise.reject(new PrinterCancelledError());

describe("createPrinterDevice", () => {
  it("resolves without printing when the user cancels the device picker", async () => {
    const transport = fakeTransport(cancel);
    const print = createPrintService(transport);

    await expect(print.printPicture(IMAGE)).resolves.toBeUndefined();
    expect(transport.writes).toHaveLength(0);
    expect(print.connected()).toBe(false);
  });

  it("still rejects on real connection failures", async () => {
    const transport = fakeTransport(() => Promise.reject(new Error("claimInterface failed")));
    const print = createPrintService(transport);

    await expect(print.printPicture(IMAGE)).rejects.toThrow("claimInterface failed");
  });

  it("connects on demand and sends the page", async () => {
    const transport = fakeTransport(() => Promise.resolve("POS-80"));
    const print = createPrintService(transport);

    await print.printPicture(IMAGE);
    expect(transport.writes).toHaveLength(1);
    expect(print.connected()).toBe(true);
    expect(print.deviceName()).toBe("POS-80");
  });

  it("switches printers through choose, and keeps the current one when cancelled", async () => {
    const names = ["POS-80", "TM-T20"];
    let next: () => Promise<string> = () => Promise.resolve(names.shift()!);
    const transport = fakeTransport(() => next());
    const print = createPrintService(transport);

    await print.connect();
    await print.choose();
    expect(print.deviceName()).toBe("TM-T20");

    next = cancel;
    await print.choose();
    expect(print.deviceName()).toBe("TM-T20");
  });

  it("follows the transport when the printer is unplugged", async () => {
    let unplug = () => {};
    const transport = fakeTransport(() => Promise.resolve("POS-80"));
    transport.onStateChange = (listener) => {
      unplug = () => {
        void transport.disconnect().then(listener);
      };
      return () => {};
    };
    const print = createPrintService(transport);
    await print.connect();
    expect(print.deviceName()).toBe("POS-80");

    unplug();
    await Promise.resolve();
    await Promise.resolve();
    expect(print.connected()).toBe(false);
    expect(print.deviceName()).toBeNull();
  });

  it("reconnects a previously chosen printer at startup, without prompting", async () => {
    const transport = fakeTransport(() => Promise.reject(new Error("must not prompt")));
    let restored = false;
    transport.restore = async () => {
      restored = true;
    };
    createPrintService(transport);
    expect(restored).toBe(true);
  });

  it("doesn't restore a device that is being added", () => {
    const transport = fakeTransport(() => Promise.resolve("POS-80"));
    let restored = false;
    transport.restore = async () => {
      restored = true;
    };
    createPrintService(transport, { restore: false });
    expect(restored).toBe(false);
  });

  it("cuts only on printers with a cutter, and reads the setup at each job", async () => {
    const transport = fakeTransport(() => Promise.resolve("POS-58"));
    let setup: PrinterSetup = SETUP;
    const print = createPrinterDevice(transport, () => setup);
    await print.printPicture(IMAGE);
    expect(endsWithCut(transport.writes[0]!)).toBe(true);

    setup = { profile: { ...PROFILE_ESCPOS_80MM, dots: 384 }, hasCutter: false };
    expect(print.paperWidth).toBe(384);
    await print.printPicture(IMAGE);
    expect(endsWithCut(transport.writes[1]!)).toBe(false);
  });

  it("prints a picture wider than half the paper at 1×", async () => {
    const paper = PROFILE_ESCPOS_80MM.dots;
    const transport = fakeTransport(() => Promise.resolve("POS-80"));
    const print = createPrintService(transport);
    const wide = paper / 2 + 1;
    const image = { width: wide, height: wide, data: new Uint8Array(wide * wide).fill(1) };

    await print.printPicture(image);

    const pixels = rasterPixels(transport.writes[0]!, paper);
    let ink = 0;
    for (let y = 0; y < pixels.length / paper; y++) {
      let row = 0;
      for (let x = 0; x < paper; x++) row += pixels[y * paper + x]!;
      ink = Math.max(ink, row);
    }
    expect(ink).toBe(wide);
  });

  it("prints a scaled page at scale × scale dots per pixel", async () => {
    const paper = PROFILE_ESCPOS_80MM.dots;
    const transport = fakeTransport(() => Promise.resolve("POS-80"));
    const print = createPrintService(transport);
    let drawn = { width: 0, height: 0 };

    await print.printPage(
      4,
      (_port, size) => {
        drawn = size;
        PaintRect(makeRect(0, 0, 4, 1));
      },
      { scale: 2 },
    );

    expect(drawn).toEqual({ width: paper / 2, height: 4 });
    const pixels = rasterPixels(transport.writes[0]!, paper);
    const rowInk = Array.from({ length: pixels.length / paper }, (_, y) =>
      pixels.subarray(y * paper, (y + 1) * paper).join(""),
    ).filter((row) => row.includes("1"));
    expect(rowInk).toHaveLength(8);
    expect(rowInk.every((row) => row.startsWith("110") && !row.slice(2).includes("1"))).toBe(true);
  });

  it("forgets the printer", async () => {
    const print = createPrintService(fakeTransport(() => Promise.resolve("POS-80")));
    await print.connect();
    await print.forget();
    expect(print.connected()).toBe(false);
    expect(print.deviceName()).toBeNull();
  });
});
