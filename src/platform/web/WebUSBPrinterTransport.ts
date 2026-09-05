/**
 * WebUSB transport: talks to a USB thermal printer directly from the browser.
 *
 * Browser-only (Chromium; requires a secure origin). Check
 * {@link isWebUSBAvailable} before constructing one.
 */
import { PrinterNotConnectedError, PrinterUnavailableError, type PrinterTransport } from "@mockintosh/print";

/** Largest single `transferOut`; keeps the printer's receive buffer from stalling. */
const CHUNK_BYTES = 4096;

export function isWebUSBAvailable(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.usb?.requestDevice === "function";
}

export interface WebUSBPrinterOptions {
  /** Restrict the device picker; empty (default) lists every USB device. */
  filters?: USBDeviceFilter[];
}

export class WebUSBPrinterTransport implements PrinterTransport {
  private device: USBDevice | null = null;
  private endpoint = 0;
  private readonly filters: USBDeviceFilter[];

  constructor(options: WebUSBPrinterOptions = {}) {
    this.filters = options.filters ?? [];
  }

  get connected(): boolean {
    return this.device?.opened === true;
  }

  async connect(): Promise<void> {
    if (!isWebUSBAvailable()) throw new PrinterUnavailableError("WebUSB is not supported here");
    if (this.connected) return;

    // Reuse a device the user already granted; otherwise prompt.
    const granted = await navigator.usb.getDevices();
    const device = granted[0] ?? (await navigator.usb.requestDevice({ filters: this.filters }));

    await device.open();
    if (device.configuration === null) await device.selectConfiguration(1);
    const { interfaceNumber, endpoint } = findBulkOut(device);
    await device.claimInterface(interfaceNumber);

    this.device = device;
    this.endpoint = endpoint;
  }

  async write(bytes: Uint8Array): Promise<void> {
    const device = this.device;
    if (!device || !device.opened) throw new PrinterNotConnectedError();
    for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTES) {
      await device.transferOut(this.endpoint, bytes.subarray(offset, offset + CHUNK_BYTES));
    }
  }

  async disconnect(): Promise<void> {
    const device = this.device;
    this.device = null;
    if (device?.opened) await device.close();
  }
}

/** Locate the first bulk OUT endpoint — the one printers accept commands on. */
function findBulkOut(device: USBDevice): { interfaceNumber: number; endpoint: number } {
  for (const iface of device.configuration?.interfaces ?? []) {
    for (const alt of iface.alternates) {
      const ep = alt.endpoints.find((e) => e.direction === "out" && e.type === "bulk");
      if (ep) return { interfaceNumber: iface.interfaceNumber, endpoint: ep.endpointNumber };
    }
  }
  throw new PrinterUnavailableError("the selected USB device has no bulk OUT endpoint");
}
