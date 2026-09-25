/**
 * One printer: a transport plus what its driver says about the paper. Pages
 * are composed with QuickDraw on an off-screen `PrintPage` and encoded by the
 * profile's encoder; only the transport knows how the bytes reach the paper.
 *
 * The printer list (`manager.ts`) owns one of these per configured printer
 * and hands apps the default one as their `PrintService`.
 */
import { createSignal } from "solid-js";
import type { GrafPort } from "@mockintosh/quickdraw";
import {
  ESCPOS_RECOVER_AND_CLEAR,
  ESCPOS_SELF_TEST,
  PRINTER_DENSITY_SCALES,
  PrinterCancelledError,
  WIDTH_TEST_DOTS,
  createPrintPage,
  disposePrintPage,
  drawOnPage,
  cutTestBytes,
  densityLevelName,
  encoderForProfile,
  identifyPrinter,
  loadTestBytes,
  probeMasung,
  probePrinterId,
  probeUserSettings,
  queryPrinterStatus,
  testPageBytes,
  tuningSampleBytes,
  widthTestBytes,
  writePrinterDensity,
  writePrinterSpeed,
  type EscPosCutCommand,
  type PrinterDensityControl,
  type PrinterSpeed,
  type PrinterSpeedControl,
  type EscPosTuningPreset,
  type PrinterIdentity,
  type PrinterProbeResult,
  type PrinterProfile,
  type PrinterStatusReport,
  type PrinterTransport,
} from "@mockintosh/print";
import { pixelsFromBitMap } from "@mockintosh/quickdraw/bits";
import type { PrintPageOptions, PrintPictureOptions, PrintService, PrintableImage } from "@mockintosh/sdk";
import { FEED_BEFORE_CUT, layoutPicture, layoutPrintable } from "./pictureLayout";

/** What the device needs from its driver, read at each job so driver changes apply at once. */
export interface PrinterSetup {
  /** Encoder profile; `dots` is the printable width actually used. */
  profile: PrinterProfile;
  /** Without a cutter, jobs end with a feed to the tear bar. */
  hasCutter: boolean;
  /** How the printer stores its print density; absent when it can't. */
  density?: PrinterDensityControl;
  /** How the printer stores its print speed; absent when it can't. */
  speed?: PrinterSpeedControl;
}

/**
 * A printer as the shell sees it: what apps get, plus the Chooser's controls
 * and diagnostics. Apps only see `PrintService`.
 */
export interface PrinterDevice extends PrintService {
  readonly profile: PrinterProfile;
  /** Name of the connected device, or `null`. Reactive. */
  deviceName(): string | null;
  /** Ask the user for the device and switch to it; cancelling keeps the current one. */
  choose(): Promise<void>;
  /** Disconnect and forget the device; the next job asks for one again. */
  forget(): Promise<void>;
  /**
   * Everything the connected device tells about itself (link facts, USB
   * device ID, ESC/POS `GS I`). `null` if the user cancelled connecting.
   */
  identify(): Promise<PrinterIdentity | null>;
  /** Advance the paper by `dots` (203 dpi: 8 dots ≈ 1 mm). Connects first if needed. */
  feed(dots: number): Promise<void>;
  /** Print the diagnostic test page. Connects first if needed. */
  printTestPage(): Promise<void>;
  /**
   * Print one strip per candidate width; the widest strip whose end blocks
   * both print is the printer's dots per line.
   */
  printWidthTest(candidates?: readonly number[]): Promise<void>;
  /** Print a short slip ending in one particular ESC/POS cut command. */
  testCut(command: EscPosCutCommand): Promise<void>;
  /** ESC/POS: clear a recoverable error (e.g. a cutter jam, once removed) and discard buffered data. */
  recover(): Promise<void>;
  /** ESC/POS: print the quality sample strip under a speed / heat preset (no cut). */
  testTuning(preset: EscPosTuningPreset): Promise<void>;
  /** Ask the printer what it can report; `null` if the user cancelled connecting. */
  status(): Promise<PrinterStatusReport | null>;
  /**
   * ESC/POS: ask capability questions — `id` (`GS I`), `settings`
   * (`GS ( E` density / speed, which resets the printer) or `masung` (the
   * vendor's reads and the status reads). `null` if the user cancelled
   * connecting.
   */
  probe(kind: PrinterProbeKind): Promise<PrinterProbeResult[] | null>;
  /**
   * Store print density `level` in the printer with its driver's density
   * command (see `PRINTER_DENSITY_SCALES` for ranges), then print the quality
   * sample. The setting stays in the printer until changed again.
   */
  testDensity(level: number): Promise<void>;
  /** Store density `level` in the printer without printing anything. */
  storeDensity(level: number): Promise<void>;
  /** Store density `level`, then print the printer's own self-test, which states the density it applied. */
  densitySelfTest(level: number): Promise<void>;
  /** ESC/POS `GS ( A`: have the printer print its own test page. */
  printSelfTest(): Promise<void>;
  /** Solid blocks at a quarter, half and full line width (no cut). */
  printLoadTest(): Promise<void>;
  /** Store print speed `speed` in the printer with its driver's command. */
  storeSpeed(speed: PrinterSpeed): Promise<void>;
  /** Stop following the transport and disconnect it. */
  dispose(): Promise<void>;
}

export type PrinterProbeKind = "id" | "settings" | "masung";

export interface PrinterDeviceOptions {
  /** Reconnect a device chosen earlier without prompting. Default true. */
  restore?: boolean;
  /**
   * Told each density the printer accepted. Printers can't report their
   * density, so this is the only record of it besides the self-test.
   */
  onDensityStored?: (level: number) => void;
  /** Told each speed the printer accepted, like {@link onDensityStored}. */
  onSpeedStored?: (speed: PrinterSpeed) => void;
}

export function createPrinterDevice(
  transport: PrinterTransport,
  setup: () => PrinterSetup,
  options: PrinterDeviceOptions = {},
): PrinterDevice {
  const [connected, setConnected] = createSignal(transport.connected);
  const [deviceName, setDeviceName] = createSignal(transport.deviceName);

  // Settings are only ever written on the user's request, never on
  // (re)connecting: storing one restarts some printers, and a restart
  // reconnects, which would write it again.
  const publish = () => {
    setConnected(transport.connected);
    setDeviceName(transport.deviceName);
  };
  const unsubscribe = transport.onStateChange?.(publish);

  const profile = () => setup().profile;
  const paperWidth = () => profile().dots;

  /** Run a transport call, treating a dismissed picker as "no change", then publish its state. */
  async function update(step: () => Promise<void>): Promise<void> {
    try {
      await step();
    } catch (error) {
      if (!(error instanceof PrinterCancelledError)) throw error;
    } finally {
      publish();
    }
  }

  const connect = () => update(() => transport.connect());

  if (transport.restore && options.restore !== false) {
    update(() => transport.restore!()).catch((error: unknown) => {
      console.warn("Couldn't reconnect the printer:", error);
    });
  }
  const choose = () => update(() => transport.choose());
  const forget = () => update(() => transport.forget());

  /** Connect unless already connected; `false` if the user cancelled. */
  async function ensureConnected(): Promise<boolean> {
    if (!transport.connected) await connect();
    return transport.connected;
  }

  async function send(bytes: Uint8Array): Promise<void> {
    if (!(await ensureConnected())) return;
    await update(() => transport.write(bytes));
  }

  /** Ask the connected printer something; `null` if the user cancelled connecting. */
  async function ask<T>(question: () => Promise<T>): Promise<T | null> {
    if (!(await ensureConnected())) return null;
    try {
      return await question();
    } finally {
      publish();
    }
  }

  const isEscPos = () => profile().dialect === "escpos";

  const identify = () => ask(() => identifyPrinter(transport, { escpos: isEscPos() }));
  const feed = (dots: number) => send(encoderForProfile(profile()).feed(dots).end());
  const printTestPage = () => send(testPageBytes(profile(), paperWidth()));
  const printWidthTest = (candidates: readonly number[] = WIDTH_TEST_DOTS) =>
    send(widthTestBytes(profile(), candidates));
  const testCut = (command: EscPosCutCommand) => send(cutTestBytes(command));
  const recover = () => send(ESCPOS_RECOVER_AND_CLEAR);
  const testTuning = (preset: EscPosTuningPreset) => send(tuningSampleBytes(preset, profile(), paperWidth()));
  const status = () => ask(() => queryPrinterStatus(transport, profile()));
  const probes: Record<PrinterProbeKind, (t: PrinterTransport) => Promise<PrinterProbeResult[]>> = {
    id: probePrinterId,
    settings: probeUserSettings,
    masung: probeMasung,
  };
  const probe = (kind: PrinterProbeKind) => ask(() => probes[kind](transport));

  /** Store density `level`; `null` if the user cancelled connecting. */
  async function writeDensity(level: number): Promise<PrinterDensityControl | null> {
    const control = setup().density;
    if (!control) throw new Error("This printer's driver has no way to set the density.");
    if (!(await ensureConnected())) return null;
    await update(() => writePrinterDensity(transport, control.command, level));
    options.onDensityStored?.(level);
    return control;
  }

  async function storeDensity(level: number): Promise<void> {
    await writeDensity(level);
  }

  async function densitySelfTest(level: number): Promise<void> {
    if (await writeDensity(level)) await send(ESCPOS_SELF_TEST);
  }

  async function testDensity(level: number): Promise<void> {
    const control = await writeDensity(level);
    if (!control) return;
    const scale = PRINTER_DENSITY_SCALES[control.command];
    const name = densityLevelName(scale, level);
    const label = `Density ${scale.steps ? `${level} = ${name}` : name} (${scale.label})`;
    await send(tuningSampleBytes({ id: `density-${level}`, label, tuning: null }, profile(), paperWidth()));
  }

  const printSelfTest = () => send(ESCPOS_SELF_TEST);
  const printLoadTest = () => send(loadTestBytes(profile(), paperWidth()));

  async function storeSpeed(speed: PrinterSpeed): Promise<void> {
    const control = setup().speed;
    if (!control) throw new Error("This printer's driver can't change its speed.");
    if (!(await ensureConnected())) return;
    await update(() => writePrinterSpeed(transport, control.command, speed));
    options.onSpeedStored?.(speed);
  }

  async function printPage(
    height: number,
    draw: (port: GrafPort, size: { width: number; height: number }) => void,
    opts: PrintPageOptions = {},
  ): Promise<void> {
    const { profile, hasCutter } = setup();
    const scale = Math.max(1, Math.floor(opts.scale ?? 1));
    const page = createPrintPage(Math.floor(profile.dots / scale), height);
    try {
      drawOnPage(page, (port) => draw(port, { width: page.width, height: page.height }));
      // Enlarging is picture layout at a fixed whole-number scale, so pages
      // and pictures meet the paper the same way.
      const bits =
        scale === 1
          ? page.bits
          : layoutPicture(
              { width: page.width, height: page.height, data: pixelsFromBitMap(page.bits) },
              { scale, orientation: "portrait" },
              profile.dots,
            ).page;
      const encoder = encoderForProfile(profile).begin().raster(bits).feed(FEED_BEFORE_CUT);
      await send((hasCutter ? encoder.cut() : encoder).end());
    } finally {
      disposePrintPage(page);
    }
  }

  function printPicture(image: PrintableImage, opts: PrintPictureOptions = {}): Promise<void> {
    const { profile, hasCutter } = setup();
    const layout = layoutPicture(image, opts, profile.dots);
    const encoder = encoderForProfile(profile).begin().raster(layout.page).feed(FEED_BEFORE_CUT);
    return send((hasCutter ? encoder.cut() : encoder).end());
  }

  function layoutServicePicture(image: PrintableImage, opts: PrintPictureOptions = {}) {
    return layoutPrintable(image, opts, paperWidth());
  }

  async function dispose(): Promise<void> {
    unsubscribe?.();
    await transport.disconnect();
  }

  return {
    get profile() {
      return profile();
    },
    get paperWidth() {
      return paperWidth();
    },
    connected,
    deviceName,
    connect,
    choose,
    forget,
    identify,
    feed,
    printTestPage,
    printWidthTest,
    testCut,
    recover,
    testTuning,
    status,
    probe,
    testDensity,
    storeDensity,
    densitySelfTest,
    printSelfTest,
    printLoadTest,
    storeSpeed,
    printPicture,
    layoutPicture: layoutServicePicture,
    printPage,
    dispose,
  };
}
