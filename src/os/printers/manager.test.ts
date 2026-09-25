import { describe, expect, it, vi } from "vitest";
import { FileSystem, InMemoryBackend } from "@mockintosh/fs";
import {
  DRIVER_CAT_58MM,
  DRIVER_MASUNG_MS_EP8300,
  PROFILE_ESCPOS_58MM,
  PrinterCancelledError,
  printerDriverToJSON,
  type PrinterIdentity,
  type PrinterLinkRequest,
  type PrinterLinks,
  type PrinterTransport,
} from "@mockintosh/print";
import { bootstrapFileSystem } from "../fsBootstrap";
import { NoPrinterError, createSystemPrinters, FIXED_PRINTER_ID } from "./manager";
import { PRINTER_LIST_FILE, parsePrinterList } from "./printerList";

const IMAGE = { width: 8, height: 8, data: new Uint8Array(64).fill(1) };

const MASUNG: PrinterIdentity = {
  link: "usb",
  name: "POS-80",
  usb: { vendorId: 0x0483, productId: 0x070b, productName: "POS-80" },
};
const CAT: PrinterIdentity = {
  link: "bluetooth",
  name: "GB03",
  bluetooth: { id: "bt-1", services: ["0000ae30-0000-1000-8000-00805f9b34fb"] },
};

interface FakeLinks extends PrinterLinks {
  /** What the next picker returns, per kind; `null` = the user cancels. */
  next: Partial<Record<"usb" | "bluetooth", PrinterIdentity | null>>;
  /** Devices that are granted and switched on, for `restore()`. */
  present: PrinterIdentity[];
  requests: PrinterLinkRequest[];
  writes: Uint8Array[];
}

function fakeLinks(kinds: FakeLinks["kinds"] = ["usb", "bluetooth"]): FakeLinks {
  const links: FakeLinks = {
    kinds,
    next: {},
    present: [],
    requests: [],
    writes: [],
    open(request) {
      links.requests.push(request);
      let current: PrinterIdentity | null = null;
      const find = () =>
        links.present.find((p) =>
          request.device?.kind === "usb"
            ? p.usb?.vendorId === request.device.vendorId && p.usb.productId === request.device.productId
            : request.device?.kind === "bluetooth" && p.bluetooth?.id === request.device.id,
        ) ?? null;
      const pick = async () => {
        const chosen = links.next[request.kind];
        if (!chosen) throw new PrinterCancelledError();
        current = chosen;
      };
      const transport: PrinterTransport = {
        get connected() {
          return current !== null;
        },
        get deviceName() {
          return current?.name ?? null;
        },
        async connect() {
          current ??= find();
          if (!current) await pick();
        },
        async restore() {
          current ??= find();
        },
        choose: pick,
        async forget() {
          current = null;
        },
        async disconnect() {
          current = null;
        },
        identity: () => current,
        async write(bytes) {
          links.writes.push(bytes);
        },
      };
      return transport;
    },
  };
  return links;
}

async function setup(links: PrinterLinks | undefined = fakeLinks(), fixed?: PrinterTransport) {
  const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
  await bootstrapFileSystem(fs);
  let n = 0;
  const printers = await createSystemPrinters({
    fs,
    links,
    ...(fixed ? { fixed: { transport: fixed, profile: PROFILE_ESCPOS_58MM } } : {}),
    newId: () => `p${++n}`,
  });
  return { fs, printers };
}

async function savedList(fs: FileSystem) {
  const node = fs.child(fs.locate("preferences")!.id, PRINTER_LIST_FILE);
  return parsePrinterList((await fs.readText(node!.id)) ?? "");
}

describe("createSystemPrinters", () => {
  it("adds a USB printer, recognises its driver and makes it the default", async () => {
    const links = fakeLinks();
    links.next.usb = { ...MASUNG, reported: { maker: "MASUNG", model: "EP8300" } };
    const { fs, printers } = await setup(links);

    const added = await printers.add("usb");
    expect(added?.driver.id).toBe(DRIVER_MASUNG_MS_EP8300.id);
    expect(added?.isDefault).toBe(true);
    expect(printers.paperWidth).toBe(576);

    await printers.settled();
    expect(await savedList(fs)).toEqual({
      defaultId: "p1",
      printers: [
        {
          id: "p1",
          name: "POS-80",
          driverId: DRIVER_MASUNG_MS_EP8300.id,
          device: { kind: "usb", vendorId: 0x0483, productId: 0x070b },
        },
      ],
    });
  });

  it("offers every known Bluetooth service and name prefix in the picker", async () => {
    const links = fakeLinks();
    links.next.bluetooth = CAT;
    const { printers } = await setup(links);

    const added = await printers.add("bluetooth");
    expect(added?.driver.id).toBe(DRIVER_CAT_58MM.id);
    expect(added?.dots).toBe(384);
    const request = links.requests[0]!;
    expect(request.kind).toBe("bluetooth");
    if (request.kind !== "bluetooth") return;
    expect(request.gatt.map((g) => g.service)).toEqual(expect.arrayContaining([0xff00, 0x18f0, 0xae30]));
    expect(request.namePrefixes).toEqual(expect.arrayContaining(["GB0", "MX0"]));
  });

  it("returns null and saves nothing when the picker is cancelled", async () => {
    const { printers } = await setup();
    expect(await printers.add("usb")).toBeNull();
    expect(printers.list()).toEqual([]);
  });

  it("reconnects the same device instead of adding it twice", async () => {
    const links = fakeLinks();
    links.next.usb = MASUNG;
    const { printers } = await setup(links);
    await printers.add("usb");
    const again = await printers.add("usb");
    expect(again?.id).toBe("p1");
    expect(printers.list()).toHaveLength(1);
    expect(again?.device?.connected()).toBe(true);
  });

  it("prints to the default printer at its driver's width, and follows width overrides", async () => {
    const links = fakeLinks();
    links.next.usb = MASUNG;
    links.next.bluetooth = CAT;
    const { printers } = await setup(links);
    await printers.add("usb");
    await printers.add("bluetooth");
    expect(printers.defaultPrinter()?.id).toBe("p1");

    await printers.setDefault("p2");
    expect(printers.paperWidth).toBe(384);
    await printers.setDots("p2", 368);
    expect(printers.paperWidth).toBe(368);
    expect(printers.get("p2")?.dotsOverridden).toBe(true);
    await printers.setDots("p2", null);
    expect(printers.paperWidth).toBe(384);

    await printers.printPicture(IMAGE);
    expect(links.writes).toHaveLength(1);
  });

  it("stores a chosen speed once, and never resends it on reconnecting or printing", async () => {
    vi.useFakeTimers();
    try {
      const links = fakeLinks(["usb"]);
      links.next.usb = { ...MASUNG, reported: { maker: "MASUNG", model: "EP8300" } };
      const { fs, printers } = await setup(links);
      await printers.add("usb");
      links.writes.length = 0;

      const device = printers.get("p1")!.device!;
      const stored = device.storeSpeed("low");
      await vi.runAllTimersAsync();
      await stored;
      expect(links.writes.map((w) => [...w])).toEqual([[0x13, 0x74, 0x44, 0x22, 0x00]]);
      expect(printers.get("p1")?.speed).toBe("low");
      await printers.settled();
      expect((await savedList(fs)).printers[0]?.speed).toBe("low");

      // Storing restarts the printer; its reconnect must not write it again.
      await device.forget();
      links.writes.length = 0;
      await printers.printPicture(IMAGE);
      await printers.printPicture(IMAGE);
      expect(links.writes).toHaveLength(2);
      expect(links.writes.some((w) => w[0] === 0x13)).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("remembers the density last stored in a printer", async () => {
    vi.useFakeTimers();
    try {
      const links = fakeLinks(["usb"]);
      links.next.usb = { ...MASUNG, reported: { maker: "MASUNG", model: "EP8300" } };
      const { fs, printers } = await setup(links);
      await printers.add("usb");
      expect(printers.get("p1")?.density).toBeNull();

      const stored = printers.get("p1")!.device!.densitySelfTest(175);
      await vi.runAllTimersAsync();
      await stored;
      expect(printers.get("p1")?.density).toBe(175);
      await printers.settled();
      expect((await savedList(fs)).printers[0]?.density).toBe(175);
    } finally {
      vi.useRealTimers();
    }
  });

  it("reopens saved printers at startup, without prompting", async () => {
    const links = fakeLinks();
    links.next.usb = MASUNG;
    const first = await setup(links);
    await first.printers.add("usb");
    await first.printers.settled();

    const reboot = fakeLinks();
    reboot.present = [MASUNG];
    const printers = await createSystemPrinters({ fs: first.fs, links: reboot });
    await Promise.resolve();
    expect(printers.list().map((p) => p.name)).toEqual(["POS-80"]);
    expect(reboot.requests[0]).toEqual({ kind: "usb", device: { kind: "usb", vendorId: 0x0483, productId: 0x070b } });
    expect(printers.connected()).toBe(true);
  });

  it("moves the default on when the default printer is removed", async () => {
    const links = fakeLinks();
    links.next.usb = MASUNG;
    links.next.bluetooth = CAT;
    const { printers } = await setup(links);
    await printers.add("usb");
    await printers.add("bluetooth");
    await printers.remove("p1");
    expect(printers.list().map((p) => [p.id, p.isDefault])).toEqual([["p2", true]]);
  });

  it("asks for a printer on first print when there's only one way to add one", async () => {
    const links = fakeLinks(["usb"]);
    links.next.usb = MASUNG;
    const { printers } = await setup(links);
    await printers.printPicture(IMAGE);
    expect(printers.list()).toHaveLength(1);
    expect(links.writes).toHaveLength(1);
  });

  it("points to the Chooser when there are several ways to add a printer", async () => {
    const { printers } = await setup();
    await expect(printers.printPicture(IMAGE)).rejects.toBeInstanceOf(NoPrinterError);
  });

  it("uses user drivers from Printer Drivers, and reports broken files", async () => {
    const { fs, printers } = await setup();
    const folder = fs.locate("printer-drivers")!;
    const mine = { ...DRIVER_CAT_58MM, id: "my-cat", name: "My cat", dots: 400 };
    await fs.writeFile(folder.id, "My cat.json", JSON.stringify(printerDriverToJSON(mine)));
    await fs.writeFile(folder.id, "Broken.json", `{"format":"mockintosh-printer-driver","version":1}`);
    await printers.catalog.settled();

    expect(printers.catalog.get("my-cat")?.driver.dots).toBe(400);
    expect(printers.catalog.problems()).toEqual([
      { fileName: "Broken.json", message: expect.stringMatching(/^".+" should be /) },
    ]);
  });

  it("saves a printer's setup as a driver file that recognises it", async () => {
    const links = fakeLinks();
    links.next.usb = MASUNG;
    const { fs, printers } = await setup(links);
    await printers.add("usb");
    await printers.setDots("p1", 512);

    const driver = await printers.saveAsDriver("p1", "My POS-80");
    expect(driver).toMatchObject({ id: "my-pos-80", dots: 512, match: { usb: [{ vendorId: 0x0483, productId: 0x070b }] } });
    expect(printers.get("p1")).toMatchObject({ driver: { id: "my-pos-80" }, dotsOverridden: false });
    expect(fs.child(fs.locate("printer-drivers")!.id, "My POS-80.json")).toBeDefined();
  });

  it("lists a board's built-in printer as the default, and keeps it", async () => {
    const fixed = fakeLinks(["usb"]);
    fixed.present = [MASUNG];
    const transport = fixed.open({ kind: "usb", device: { kind: "usb", vendorId: 0x0483, productId: 0x070b } });
    const { printers } = await setup(undefined, transport);
    expect(printers.list().map((p) => [p.id, p.isDefault, p.fixed])).toEqual([[FIXED_PRINTER_ID, true, true]]);
    expect(printers.paperWidth).toBe(384);
    await expect(printers.remove(FIXED_PRINTER_ID)).rejects.toThrow("can't be changed");
  });
});
