/**
 * The system's printers — the OS-side implementation of the SDK's
 * `PrintService`.
 *
 * Like the Chooser, the shell keeps a list of printers with one default;
 * every app window prints to the default through `useApp().print` and never
 * learns which device that is. Printers the user adds (USB, Bluetooth) are
 * saved in Preferences › Printers and paired with a driver from the catalog
 * (built-ins plus Extensions › Printer Drivers). A board with a printer wired
 * in contributes one fixed printer that can't be removed.
 */
import { createSignal } from "solid-js";
import type { FileSystem } from "@mockintosh/fs";
import type { GrafPort } from "@mockintosh/quickdraw";
import {
  DRIVER_ESCPOS_58MM,
  DRIVER_ESCPOS_80MM,
  PROFILE_ESCPOS_80MM,
  deviceRefOf,
  driverForProfile,
  matchPrinterDrivers,
  type BluetoothGattProfile,
  type PrinterDeviceRef,
  type PrinterDriver,
  type PrinterDriverCandidate,
  type PrinterIdentity,
  type PrinterLinkKind,
  type PrinterLinkRequest,
  type PrinterLinks,
  type PrinterProfile,
  type PrinterSpeed,
  type PrinterTransport,
} from "@mockintosh/print";
import type { PrintPictureOptions, PrintService, PrintableImage } from "@mockintosh/sdk";
import { createPrinterDevice, type PrinterDevice, type PrinterDeviceOptions, type PrinterSetup } from "./device";
import { layoutPrintable } from "./pictureLayout";
import { createPrinterDriverCatalog, type PrinterDriverCatalog } from "./drivers";
import {
  EMPTY_PRINTER_LIST,
  PRINTER_LIST_FILE,
  parsePrinterList,
  sameDeviceRef,
  serializePrinterList,
  type ConfiguredPrinter,
  type PrinterList,
} from "./printerList";

/** The id of a board's built-in printer. */
export const FIXED_PRINTER_ID = "built-in";

/** One printer in the list, as the Chooser shows it. A new snapshot replaces it on every change. */
export interface SystemPrinterEntry {
  readonly id: string;
  readonly name: string;
  readonly link: PrinterLinkKind | "fixed";
  /** The driver in use (a generic stand-in when `driverMissing`). */
  readonly driver: PrinterDriver;
  /** The configured driver id isn't in the catalog any more. */
  readonly driverMissing: boolean;
  /** Dots per line in use; differs from `driver.dots` when overridden. */
  readonly dots: number;
  readonly dotsOverridden: boolean;
  /** The speed last stored in the printer from here; `null` if never. Only used when `driver.speed` is set. */
  readonly speed: PrinterSpeed | null;
  /** The density last stored in the printer from here; `null` if never. Only used when `driver.density` is set. */
  readonly density: number | null;
  readonly isDefault: boolean;
  /** Built into the board: can't be removed or re-driven. */
  readonly fixed: boolean;
  /** What the device said the last time it was identified; `null` before that. */
  readonly identity: PrinterIdentity | null;
  /** `null` when this browser can't reach the printer's kind of link. */
  readonly device: PrinterDevice | null;
}

export interface SystemPrinters extends PrintService {
  /** Kinds of printer the user can add here. */
  readonly linkKinds: readonly PrinterLinkKind[];
  readonly catalog: PrinterDriverCatalog;
  /** Configured printers, in the order added. Reactive. */
  list(): readonly SystemPrinterEntry[];
  get(id: string): SystemPrinterEntry | undefined;
  defaultPrinter(): SystemPrinterEntry | null;
  /** Why the saved printer list couldn't be read, or `null`. Reactive. */
  problem(): string | null;
  /**
   * Ask the user for a new printer of `kind`, identify it and pick the best
   * driver. `null` if they cancelled. Adding a printer that's already in the
   * list reconnects that one instead.
   */
  add(kind: PrinterLinkKind): Promise<SystemPrinterEntry | null>;
  remove(id: string): Promise<void>;
  setDefault(id: string): Promise<void>;
  setDriver(id: string, driverId: string): Promise<void>;
  /** Override the driver's dots per line; `null` goes back to the driver's. */
  setDots(id: string, dots: number | null): Promise<void>;
  /** Ask the device about itself again; `null` if the user cancelled connecting. */
  identify(id: string): Promise<PrinterIdentity | null>;
  /** Drivers that fit the printer, best first, from its last identity. */
  candidates(id: string): PrinterDriverCandidate[];
  /**
   * Save the printer's current setup (driver, dots, and rules recognising
   * this model) as a driver file in Printer Drivers, and switch to it.
   */
  saveAsDriver(id: string, name: string): Promise<PrinterDriver>;
  /** Resolves once pending preference writes have landed. */
  settled(): Promise<void>;
}

export interface SystemPrintersOptions {
  fs: FileSystem;
  links?: PrinterLinks;
  /** A printer wired to the board. */
  fixed?: { transport: PrinterTransport; profile?: PrinterProfile };
  /** Id generator for new printers (tests). */
  newId?: () => string;
}

export class NoPrinterError extends Error {
  constructor() {
    super('No printer is set up. Choose "Chooser" from the Apple menu to add one.');
    this.name = "NoPrinterError";
  }
}

interface Slot {
  device: PrinterDevice | null;
  identity: PrinterIdentity | null;
}

const fallbackDriver = (kind: PrinterLinkKind): PrinterDriver =>
  kind === "usb" ? DRIVER_ESCPOS_80MM : DRIVER_ESCPOS_58MM;

export async function createSystemPrinters(options: SystemPrintersOptions): Promise<SystemPrinters> {
  const { fs, links } = options;
  const linkKinds = links?.kinds ?? [];
  const catalog = await createPrinterDriverCatalog(fs);
  const newId = options.newId ?? (() => `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`);

  const [problem, setProblem] = createSignal<string | null>(null);
  const [config, setConfig] = createSignal<PrinterList>(EMPTY_PRINTER_LIST);
  /** Bumped when a slot's device or identity changes, so `list()` re-derives. */
  const [slotVersion, setSlotVersion] = createSignal(0);
  const touchSlots = () => setSlotVersion((v) => v + 1);
  const slots = new Map<string, Slot>();

  // --- The board's printer ---
  const fixedDriver = options.fixed
    ? driverForProfile(options.fixed.profile ?? PROFILE_ESCPOS_80MM, ["usb", "bluetooth"])
    : null;
  if (options.fixed && fixedDriver) {
    const setup = (): PrinterSetup => ({
      profile: fixedDriver,
      hasCutter: fixedDriver.hasCutter,
      density: fixedDriver.density,
      speed: fixedDriver.speed,
    });
    slots.set(FIXED_PRINTER_ID, { device: createPrinterDevice(options.fixed.transport, setup), identity: null });
  }

  // --- Saved printers ---
  const prefs = fs.locate("preferences");
  async function load(): Promise<PrinterList> {
    const node = prefs ? fs.child(prefs.id, PRINTER_LIST_FILE) : undefined;
    if (!node || node.kind !== "file") return EMPTY_PRINTER_LIST;
    try {
      return parsePrinterList((await fs.readText(node.id)) ?? "");
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
      return EMPTY_PRINTER_LIST;
    }
  }

  let writes: Promise<void> = Promise.resolve();
  function commit(next: PrinterList): Promise<void> {
    setConfig(next);
    setProblem(null);
    const write = writes.then(async () => {
      if (!prefs) return;
      await fs.writeFile(prefs.id, PRINTER_LIST_FILE, serializePrinterList(next), { type: "application/json" });
      await fs.flush();
    });
    writes = write.catch((error: unknown) => console.warn("Couldn't save the printer list:", error));
    return write;
  }

  const configOf = (id: string) => config().printers.find((p) => p.id === id);

  /** The driver a configured printer uses; a generic one for its link if the file went away. */
  function resolveDriver(printer: ConfiguredPrinter): { driver: PrinterDriver; missing: boolean } {
    const found = catalog.get(printer.driverId)?.driver;
    return found ? { driver: found, missing: false } : { driver: fallbackDriver(printer.device.kind), missing: true };
  }

  function setupFor(id: () => string, provisional?: () => PrinterDriver): () => PrinterSetup {
    return () => {
      const printer = configOf(id());
      const driver = printer ? resolveDriver(printer).driver : (provisional?.() ?? DRIVER_ESCPOS_80MM);
      const dots = printer?.dots ?? driver.dots;
      return {
        profile: { ...driver, dots },
        hasCutter: driver.hasCutter,
        density: driver.density,
        speed: driver.speed,
      };
    };
  }

  /** Every GATT service a Bluetooth driver writes through, with `first`'s first. */
  function bluetoothRequest(device?: Extract<PrinterDeviceRef, { kind: "bluetooth" }>, first?: PrinterDriver): PrinterLinkRequest {
    const gatt: BluetoothGattProfile[] = [];
    const namePrefixes = new Set<string>();
    const add = (profile: BluetoothGattProfile | undefined) => {
      if (profile && !gatt.some((g) => String(g.service) === String(profile.service) && String(g.write) === String(profile.write))) {
        gatt.push(profile);
      }
    };
    add(first?.bluetooth);
    for (const driver of catalog.drivers()) {
      if (!driver.links.includes("bluetooth")) continue;
      add(driver.bluetooth);
      for (const prefix of driver.match?.bluetoothName ?? []) namePrefixes.add(prefix);
    }
    return { kind: "bluetooth", gatt, namePrefixes: [...namePrefixes], ...(device ? { device } : {}) };
  }

  function requestFor(device: PrinterDeviceRef, driver?: PrinterDriver): PrinterLinkRequest {
    return device.kind === "usb" ? { kind: "usb", device } : bluetoothRequest(device, driver);
  }

  /**
   * Remember the settings a printer accepted into its own memory; one not
   * saved yet (still being added) has nowhere to keep them.
   */
  function recordStoredSettings(id: () => string): Pick<PrinterDeviceOptions, "onDensityStored" | "onSpeedStored"> {
    const record = (change: Pick<ConfiguredPrinter, "density" | "speed">) => {
      if (!configOf(id())) return;
      update(id(), (p) => ({ ...p, ...change })).catch((error: unknown) =>
        console.warn("Couldn't save the printer's settings:", error),
      );
    };
    return {
      onDensityStored: (density) => record({ density }),
      onSpeedStored: (speed) => record({ speed }),
    };
  }

  function openSlot(printer: ConfiguredPrinter): void {
    if (!links || !linkKinds.includes(printer.device.kind)) {
      slots.set(printer.id, { device: null, identity: null });
      return;
    }
    const transport = links.open(requestFor(printer.device, resolveDriver(printer).driver));
    const device = createPrinterDevice(transport, setupFor(() => printer.id), recordStoredSettings(() => printer.id));
    slots.set(printer.id, { device, identity: null });
  }

  const initial = await load();
  setConfig(initial);
  for (const printer of initial.printers) openSlot(printer);

  // --- The list ---
  function list(): SystemPrinterEntry[] {
    slotVersion();
    const { printers, defaultId } = config();
    const entries: SystemPrinterEntry[] = [];
    const effectiveDefault = defaultId ?? (fixedDriver ? FIXED_PRINTER_ID : null);
    if (fixedDriver) {
      const slot = slots.get(FIXED_PRINTER_ID)!;
      entries.push({
        id: FIXED_PRINTER_ID,
        name: fixedDriver.name,
        link: "fixed",
        driver: fixedDriver,
        driverMissing: false,
        dots: fixedDriver.dots,
        dotsOverridden: false,
        speed: null,
        density: null,
        isDefault: effectiveDefault === FIXED_PRINTER_ID,
        fixed: true,
        identity: slot.identity,
        device: slot.device,
      });
    }
    for (const printer of printers) {
      const { driver, missing } = resolveDriver(printer);
      const slot = slots.get(printer.id);
      entries.push({
        id: printer.id,
        name: printer.name,
        link: printer.device.kind,
        driver,
        driverMissing: missing,
        dots: printer.dots ?? driver.dots,
        dotsOverridden: printer.dots !== undefined && printer.dots !== driver.dots,
        speed: printer.speed ?? null,
        density: printer.density ?? null,
        isDefault: effectiveDefault === printer.id,
        fixed: false,
        identity: slot?.identity ?? null,
        device: slot?.device ?? null,
      });
    }
    return entries;
  }

  const get = (id: string) => list().find((e) => e.id === id);
  const defaultPrinter = () => list().find((e) => e.isDefault) ?? null;

  function requireEditable(id: string): ConfiguredPrinter {
    const printer = configOf(id);
    if (!printer) throw new Error(id === FIXED_PRINTER_ID ? "The built-in printer can't be changed" : "No such printer");
    return printer;
  }

  async function update(id: string, change: (p: ConfiguredPrinter) => ConfiguredPrinter): Promise<void> {
    requireEditable(id);
    const current = config();
    await commit({ ...current, printers: current.printers.map((p) => (p.id === id ? change(p) : p)) });
  }

  // --- Adding ---
  async function add(kind: PrinterLinkKind): Promise<SystemPrinterEntry | null> {
    if (!links || !linkKinds.includes(kind)) {
      throw new Error(`This Macintosh can't reach ${kind === "usb" ? "USB" : "Bluetooth"} printers`);
    }
    let id = newId();
    let provisional = fallbackDriver(kind);
    const transport = links.open(kind === "usb" ? { kind: "usb" } : bluetoothRequest());
    const device = createPrinterDevice(transport, setupFor(() => id, () => provisional), {
      restore: false,
      ...recordStoredSettings(() => id),
    });
    await device.choose();
    if (!device.connected()) {
      await device.dispose();
      return null;
    }

    // What the link says picks the driver the questions are asked in (no ESC/POS to a cat printer).
    const linkIdentity = transport.identity?.() ?? { link: kind, name: device.deviceName() };
    provisional = matchPrinterDrivers(linkIdentity, catalog.drivers())[0]?.driver ?? provisional;
    const identity = (await device.identify().catch(() => null)) ?? linkIdentity;
    const best = matchPrinterDrivers(identity, catalog.drivers())[0]?.driver ?? provisional;
    const ref = deviceRefOf(identity) ?? (kind === "usb" ? null : { kind: "bluetooth" as const, name: device.deviceName() ?? undefined });
    if (!ref) {
      await device.dispose();
      throw new Error("The printer didn't say enough about itself to be found again");
    }

    const existing = config().printers.find((p) => sameDeviceRef(p.device, ref));
    if (existing) {
      // Already in the list: the new connection replaces its old one.
      const old = slots.get(existing.id)?.device;
      id = existing.id;
      slots.set(id, { device, identity });
      if (old) await old.dispose().catch(() => {});
      touchSlots();
      return get(id) ?? null;
    }

    slots.set(id, { device, identity });
    const printer: ConfiguredPrinter = {
      id,
      name: identity.name ?? best.name,
      driverId: best.id,
      device: ref,
    };
    const current = config();
    await commit({
      defaultId: current.defaultId ?? id,
      printers: [...current.printers, printer],
    });
    touchSlots();
    return get(id) ?? null;
  }

  async function remove(id: string): Promise<void> {
    requireEditable(id);
    const slot = slots.get(id);
    slots.delete(id);
    if (slot?.device) {
      await slot.device.forget().catch(() => {});
      await slot.device.dispose().catch(() => {});
    }
    const current = config();
    const printers = current.printers.filter((p) => p.id !== id);
    await commit({ defaultId: current.defaultId === id ? (printers[0]?.id ?? null) : current.defaultId, printers });
    touchSlots();
  }

  async function setDefault(id: string): Promise<void> {
    if (id === FIXED_PRINTER_ID && fixedDriver) {
      await commit({ ...config(), defaultId: null });
      return;
    }
    requireEditable(id);
    await commit({ ...config(), defaultId: id });
  }

  const setDriver = async (id: string, driverId: string) => {
    if (!catalog.get(driverId)) throw new Error(`No driver "${driverId}"`);
    await update(id, (p) => {
      const { dots: _dots, ...rest } = p;
      return { ...rest, driverId };
    });
  };

  const setDots = (id: string, dots: number | null) =>
    update(id, (p) => {
      const { dots: _dots, ...rest } = p;
      return dots === null ? rest : { ...rest, dots };
    });
  async function identify(id: string): Promise<PrinterIdentity | null> {
    const slot = slots.get(id);
    if (!slot?.device) throw new Error("This printer can't be reached here");
    const identity = await slot.device.identify();
    if (identity) {
      slot.identity = identity;
      touchSlots();
    }
    return identity;
  }

  function candidates(id: string): PrinterDriverCandidate[] {
    const entry = get(id);
    if (!entry || entry.fixed) return [];
    const identity = entry.identity ?? { link: entry.link as PrinterLinkKind, name: entry.name };
    return matchPrinterDrivers(identity, catalog.drivers());
  }

  async function saveAsDriver(id: string, name: string): Promise<PrinterDriver> {
    const printer = requireEditable(id);
    const entry = get(id)!;
    const identity = entry.identity;
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Give the driver a name");
    const baseId = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "printer";
    const taken = (candidate: string) => {
      const found = catalog.get(candidate);
      return found !== undefined && !(found.source === "file" && found.driver.name === trimmed);
    };
    let driverId = baseId;
    for (let n = 2; taken(driverId); n++) driverId = `${baseId}-${n}`;

    const maker = identity?.reported?.maker ?? identity?.deviceId?.MFG ?? identity?.usb?.manufacturerName ?? entry.driver.maker;
    const model = identity?.reported?.model ?? identity?.deviceId?.MDL;
    const match: NonNullable<PrinterDriver["match"]> = {};
    if (identity?.usb) match.usb = [{ vendorId: identity.usb.vendorId, productId: identity.usb.productId }];
    if (model) match.reportedModel = [model];
    if (printer.device.kind === "bluetooth" && identity?.name) match.bluetoothName = [identity.name];

    const { match: _match, maker: _maker, ...base } = entry.driver;
    const driver: PrinterDriver = {
      ...base,
      id: driverId,
      name: trimmed,
      ...(maker ? { maker } : {}),
      dots: entry.dots,
      links: base.links.includes(printer.device.kind) ? base.links : [...base.links, printer.device.kind],
      ...(Object.keys(match).length > 0 ? { match } : {}),
    };
    await catalog.save(driver);
    await update(id, (p) => {
      const { dots: _dots, ...rest } = p;
      return { ...rest, driverId };
    });
    return driver;
  }

  // --- PrintService: the default printer ---
  /** The default printer's device; adds one when there is none and only one way to add it. */
  async function target(): Promise<PrinterDevice | null> {
    const current = defaultPrinter();
    if (current) {
      if (!current.device) throw new Error(`"${current.name}" can't be reached from this Macintosh`);
      return current.device;
    }
    if (linkKinds.length !== 1) throw new NoPrinterError();
    return (await add(linkKinds[0]!))?.device ?? null;
  }

  const service: SystemPrinters = {
    linkKinds,
    catalog,
    get paperWidth() {
      return defaultPrinter()?.dots ?? PROFILE_ESCPOS_80MM.dots;
    },
    connected: () => defaultPrinter()?.device?.connected() ?? false,
    async connect() {
      await (await target())?.connect();
    },
    async printPicture(image: PrintableImage, opts?: PrintPictureOptions) {
      await (await target())?.printPicture(image, opts);
    },
    layoutPicture(image: PrintableImage, opts?: PrintPictureOptions) {
      return layoutPrintable(image, opts ?? {}, this.paperWidth);
    },
    async printPage(height: number, draw: (port: GrafPort, size: { width: number; height: number }) => void) {
      await (await target())?.printPage(height, draw);
    },
    list,
    get,
    defaultPrinter,
    problem,
    add,
    remove,
    setDefault,
    setDriver,
    setDots,
    identify,
    candidates,
    saveAsDriver,
    async settled() {
      await writes;
      await catalog.settled();
    },
  };
  return service;
}
