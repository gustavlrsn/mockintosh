/**
 * WebUSB transport: talks to a USB thermal printer directly from the browser.
 *
 * Browser-only (Chromium; requires a secure origin). Check
 * {@link isWebUSBAvailable} before constructing one.
 */
import {
  PrinterNotConnectedError,
  PrinterUnavailableError,
  PrinterWrongDeviceError,
  type PrinterIdentity,
  type PrinterTransport,
} from "@mockintosh/print";
import { pickPrinterDevice } from "./devicePicker";
import {
  PRINTER_DEVICE_FILTERS,
  USB_CLASS_PRINTER,
  describePrinterEndpoint,
  findPrinterEndpoint,
  usbDeviceLabel,
  type PrinterEndpoint,
} from "./usbPrinterMatch";

/** Largest single `transferOut`; keeps the printer's receive buffer from stalling. */
const CHUNK_BYTES = 4096;

/** USB printer class requests (USB Printer Class 1.1, §4.2). */
const GET_DEVICE_ID = 0x00;
const GET_PORT_STATUS = 0x01;
const DEVICE_ID_MAX_BYTES = 1024;

export function isWebUSBAvailable(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.usb?.requestDevice === "function";
}

export interface WebUSBPrinterOptions {
  /** Restrict the device picker. Defaults to printer-class and vendor-specific devices. */
  filters?: USBDeviceFilter[];
  /**
   * The printer this transport is for, from an earlier `identity()`. It is
   * reattached without prompting whenever it's granted and plugged in.
   */
  device?: DeviceIdentity;
}

export class WebUSBPrinterTransport implements PrinterTransport {
  private device: USBDevice | null = null;
  private target: PrinterEndpoint | null = null;
  /** A `transferIn` that outlived its `read` timeout; the next `read` picks up its reply. */
  private pendingIn: Promise<USBInTransferResult> | null = null;
  /** The printer last attached, so it can be picked up again when it reappears. */
  private remembered: DeviceIdentity | null = null;
  /**
   * The open in flight. A printer that restarts (e.g. after a stored setting)
   * reappears while a job is waiting for it; the `connect` event and the job's
   * reconnect must not both claim the interface.
   */
  private attaching: Promise<void> | null = null;
  /** The reconnect in flight, shared by startup and a first print that races it. */
  private restoring: Promise<void> | null = null;
  private readonly listeners = new Set<() => void>();
  private readonly filters: USBDeviceFilter[];

  constructor(options: WebUSBPrinterOptions = {}) {
    this.filters = options.filters ?? PRINTER_DEVICE_FILTERS;
    this.remembered = options.device ?? null;
    if (isWebUSBAvailable()) {
      navigator.usb.addEventListener("disconnect", (event) => this.onDisconnect(event.device));
      navigator.usb.addEventListener("connect", (event) => this.onConnect(event.device));
    }
  }

  onStateChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  private onDisconnect(device: USBDevice): void {
    if (device !== this.device) return;
    this.device = null;
    this.target = null;
    this.pendingIn = null;
    this.notify();
  }

  /**
   * A granted device was plugged in or switched on (Chrome only reports
   * devices this origin may use): reattach it without asking if it's this
   * transport's printer. Other transports own other printers.
   */
  private onConnect(device: USBDevice): void {
    if (this.connected || this.attaching || findPrinterEndpoint(device) === null) return;
    if (!this.remembered || !sameDevice(this.remembered, device)) return;
    void this.attach(device)
      .catch(() => {})
      .finally(() => this.notify());
  }

  get connected(): boolean {
    return this.device?.opened === true;
  }

  get deviceName(): string | null {
    return this.connected && this.device ? usbDeviceLabel(this.device) : null;
  }

  async connect(): Promise<void> {
    requireWebUSB();
    await this.restore();
    if (!this.connected) await this.attach(await this.pick());
  }

  /** Reattach this transport's printer if it's granted and plugged in. A transport for a new printer has none. */
  restore(): Promise<void> {
    const remembered = this.remembered;
    if (!isWebUSBAvailable() || this.connected || !remembered) return Promise.resolve();
    this.restoring ??= (async () => {
      const granted = (await navigator.usb.getDevices()).find(
        (d) => sameDevice(remembered, d) && findPrinterEndpoint(d) !== null,
      );
      if (granted) await this.attach(granted);
    })().finally(() => {
      this.restoring = null;
    });
    return this.restoring;
  }

  async choose(): Promise<void> {
    requireWebUSB();
    const picked = await this.pick();
    if (picked === this.device && this.connected) return;
    const previous = this.device;
    await this.attach(picked);
    if (previous && previous !== picked) await release(previous);
  }

  async write(bytes: Uint8Array): Promise<void> {
    const { device, target } = this.requireOpen();
    for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTES) {
      const chunk = bytes.subarray(offset, offset + CHUNK_BYTES);
      const result = await device.transferOut(target.endpointNumber, chunk).catch((error: unknown) => {
        throw explainUsbError(error);
      });
      if (result.status === "stall") {
        await device.clearHalt("out", target.endpointNumber);
        throw new Error("The printer refused the data (USB stall). Check paper and cover, then try again.");
      }
      if (result.status !== "ok" || result.bytesWritten !== chunk.length) {
        throw new Error(`USB write failed: ${result.status}, ${result.bytesWritten}/${chunk.length} bytes`);
      }
    }
  }

  async disconnect(): Promise<void> {
    const device = this.device;
    this.device = null;
    this.target = null;
    this.pendingIn = null;
    if (device?.opened) await device.close();
  }

  /** Let go of this transport's printer and revoke its grant; other printers stay. */
  async forget(): Promise<void> {
    const remembered = this.remembered;
    this.remembered = null;
    await this.disconnect();
    if (!remembered || !isWebUSBAvailable()) return;
    for (const device of await navigator.usb.getDevices()) {
      if (sameDevice(remembered, device)) await release(device);
    }
  }

  identity(): PrinterIdentity | null {
    const device = this.connected ? this.device : null;
    if (!device) return null;
    return {
      link: "usb",
      name: usbDeviceLabel(device),
      usb: {
        vendorId: device.vendorId,
        productId: device.productId,
        ...(device.manufacturerName ? { manufacturerName: device.manufacturerName } : {}),
        ...(device.productName ? { productName: device.productName } : {}),
        ...(device.serialNumber ? { serialNumber: device.serialNumber } : {}),
      },
    };
  }

  linkDetails(): string {
    return this.target ? describePrinterEndpoint(this.target) : "Not connected";
  }

  async read(maxBytes: number, timeoutMs: number): Promise<Uint8Array | null> {
    const { device, target } = this.requireOpen();
    if (target.inEndpointNumber === null) return null;
    this.pendingIn ??= device.transferIn(target.inEndpointNumber, Math.max(maxBytes, 64));
    const pending = this.pendingIn;
    const result = await Promise.race([pending, delay(timeoutMs)]);
    if (!result) return null;
    this.pendingIn = null;
    if (result.status === "stall") {
      await device.clearHalt("in", target.inEndpointNumber);
      return null;
    }
    if (!result.data) return null;
    return new Uint8Array(result.data.buffer, result.data.byteOffset, Math.min(result.data.byteLength, maxBytes));
  }

  async portStatus(): Promise<number | null> {
    const reply = await this.classRequest(GET_PORT_STATUS, 0, this.requireOpen().target.interfaceNumber, 1);
    return reply && reply.byteLength >= 1 ? reply.getUint8(0) : null;
  }

  async deviceId(): Promise<string | null> {
    const { target } = this.requireOpen();
    const index = (target.interfaceNumber << 8) | target.alternateSetting;
    const reply = await this.classRequest(GET_DEVICE_ID, 0, index, DEVICE_ID_MAX_BYTES);
    if (!reply || reply.byteLength < 2) return null;
    // The first two bytes are the big-endian length, including themselves.
    const length = Math.min(reply.getUint16(0), reply.byteLength);
    const text = new TextDecoder().decode(new Uint8Array(reply.buffer, reply.byteOffset + 2, Math.max(0, length - 2)));
    return text || null;
  }

  /** A printer-class control request; `null` when the interface isn't printer class or doesn't answer. */
  private async classRequest(request: number, value: number, index: number, length: number): Promise<DataView | null> {
    const { device, target } = this.requireOpen();
    if (target.interfaceClass !== USB_CLASS_PRINTER) return null;
    try {
      const result = await device.controlTransferIn({ requestType: "class", recipient: "interface", request, value, index }, length);
      return result.status === "ok" && result.data ? result.data : null;
    } catch {
      return null;
    }
  }

  private requireOpen(): { device: USBDevice; target: PrinterEndpoint } {
    const { device, target } = this;
    if (!device || !device.opened || !target) throw new PrinterNotConnectedError();
    return { device, target };
  }

  private pick(): Promise<USBDevice> {
    return pickPrinterDevice(() => navigator.usb.requestDevice({ filters: this.filters }));
  }

  /**
   * Open `device` as the printer, or let go of it if it can't take print data.
   * A printer that drops off the bus mid-open (common for a few seconds after
   * power-on) is waited for once and opened again under its new identity.
   */
  private async attach(device: USBDevice): Promise<void> {
    while (this.attaching) {
      await this.attaching.catch(() => {});
      if (this.connected && this.device && sameDevice(identityOf(this.device), device)) return;
    }
    const attempt = this.openAsPrinter(device).catch((error: unknown) => {
      throw explainUsbError(error);
    });
    this.attaching = attempt;
    try {
      await attempt;
    } finally {
      if (this.attaching === attempt) this.attaching = null;
    }
  }

  private async openAsPrinter(device: USBDevice): Promise<void> {
    const target = findPrinterEndpoint(device);
    if (!target) {
      await release(device);
      throw new PrinterWrongDeviceError(usbDeviceLabel(device));
    }

    try {
      await open(device, target);
    } catch (error) {
      if (!isDisconnectedError(error)) throw error;
      const back = await waitForReconnect(device, RECONNECT_WAIT_MS);
      if (!back) throw new Error(`"${usbDeviceLabel(device)}" keeps disconnecting. Check its cable and power, then try again.`);
      device = back;
      await open(device, target);
    }

    this.device = device;
    this.target = target;
    this.pendingIn = null;
    this.remembered = identityOf(device);
  }
}

const RECONNECT_WAIT_MS = 5000;

export interface DeviceIdentity {
  vendorId: number;
  productId: number;
  serialNumber?: string;
}

function identityOf(device: USBDevice): DeviceIdentity {
  return { vendorId: device.vendorId, productId: device.productId, serialNumber: device.serialNumber };
}

function sameDevice(identity: DeviceIdentity, device: USBDevice): boolean {
  return (
    identity.vendorId === device.vendorId &&
    identity.productId === device.productId &&
    (identity.serialNumber || undefined) === (device.serialNumber || undefined)
  );
}

async function open(device: USBDevice, target: PrinterEndpoint): Promise<void> {
  if (!device.opened) await device.open();
  if (device.configuration?.configurationValue !== target.configurationValue) {
    await device.selectConfiguration(target.configurationValue);
  }
  const claimed = device.configuration?.interfaces.some((i) => i.interfaceNumber === target.interfaceNumber && i.claimed);
  if (!claimed) await device.claimInterface(target.interfaceNumber);
  if (target.alternateSetting !== 0) {
    await device.selectAlternateInterface(target.interfaceNumber, target.alternateSetting);
  }
}

/**
 * WebUSB's own messages ("Failed to execute 'transferOut' on 'USBDevice': …")
 * name the API, not the problem. Put a plain sentence in front of the common
 * ones and keep the original in brackets for diagnosis.
 */
function explainUsbError(error: unknown): unknown {
  if (!(error instanceof DOMException)) return error;
  const plain = usbErrorAdvice(error);
  return plain ? new Error(`${plain} (${error.message})`, { cause: error }) : error;
}

function usbErrorAdvice(error: DOMException): string | null {
  if (/claim interface/i.test(error.message)) {
    return "Something else is using the printer, perhaps another Mockintosh tab or window. Close it, then try again.";
  }
  if (isDisconnectedError(error)) return "The printer was disconnected. Check its cable and power, then try again.";
  if (error.name === "NetworkError" || /transfer error/i.test(error.message)) {
    return "The printer stopped responding. It may be restarting; try again in a few seconds.";
  }
  if (error.name === "SecurityError") return "The browser wasn't allowed to open the printer. Choose it again with Connect.";
  return null;
}

function isDisconnectedError(error: unknown): boolean {
  return error instanceof DOMException && (error.name === "NotFoundError" || /disconnected/i.test(error.message));
}

/** Resolve with the new object for `gone` once it is plugged in again, or `null` after `timeoutMs`. */
function waitForReconnect(gone: USBDevice, timeoutMs: number): Promise<USBDevice | null> {
  const identity = identityOf(gone);
  return new Promise((resolve) => {
    const onConnect = (event: USBConnectionEvent) => {
      if (event.device === gone || !sameDevice(identity, event.device)) return;
      finish(event.device);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    function finish(device: USBDevice | null): void {
      clearTimeout(timer);
      navigator.usb.removeEventListener("connect", onConnect);
      resolve(device);
    }
    navigator.usb.addEventListener("connect", onConnect);
    // It may already be back by the time the open failed.
    void navigator.usb.getDevices().then((devices) => {
      const found = devices.find((d) => d !== gone && sameDevice(identity, d));
      if (found) finish(found);
    });
  });
}

function requireWebUSB(): void {
  if (!isWebUSBAvailable()) throw new PrinterUnavailableError("WebUSB is not supported here");
}

function delay(ms: number): Promise<null> {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

/** Close the device and revoke the grant so the next connect prompts again. */
async function release(device: USBDevice): Promise<void> {
  if (device.opened) await device.close();
  await device.forget?.();
}
