/**
 * Which part of a USB device a thermal printer takes its ESC/POS bytes on.
 *
 * Printers either use the USB printer class or a vendor-specific interface
 * (most cheap 58/80 mm printers); either way they expose a bulk OUT endpoint.
 */

export const USB_CLASS_PRINTER = 0x07;
export const USB_CLASS_VENDOR_SPECIFIC = 0xff;

/** Picker filter: hides keyboards, hubs, cameras and other devices that can't be printers. */
export const PRINTER_DEVICE_FILTERS: USBDeviceFilter[] = [
  { classCode: USB_CLASS_PRINTER },
  { classCode: USB_CLASS_VENDOR_SPECIFIC },
];

export interface PrinterEndpoint {
  configurationValue: number;
  interfaceNumber: number;
  alternateSetting: number;
  interfaceClass: number;
  endpointNumber: number;
  /** Bulk IN on the same interface, where status replies arrive; `null` for write-only printers. */
  inEndpointNumber: number | null;
}

/** Interfaces that can't be claimed from a web page, or can't be a printer. */
const NEVER_PRINTER_CLASSES = new Set([0x01, 0x02, 0x03, 0x08, 0x09, 0x0a, 0x0b, 0x0e, 0xe0]);

function rank(interfaceClass: number): number {
  if (interfaceClass === USB_CLASS_PRINTER) return 0;
  if (interfaceClass === USB_CLASS_VENDOR_SPECIFIC) return 1;
  return 2;
}

/**
 * The bulk OUT endpoint to print on, preferring a printer-class interface,
 * or `null` when the device can't take print data at all.
 */
export function findPrinterEndpoint(device: Pick<USBDevice, "configuration" | "configurations">): PrinterEndpoint | null {
  const configurations = device.configuration ? [device.configuration] : device.configurations;
  let best: { endpoint: PrinterEndpoint; rank: number } | null = null;
  for (const configuration of configurations) {
    for (const iface of configuration.interfaces) {
      for (const alt of iface.alternates) {
        if (NEVER_PRINTER_CLASSES.has(alt.interfaceClass)) continue;
        const out = alt.endpoints.find((e) => e.direction === "out" && e.type === "bulk");
        if (!out) continue;
        const r = rank(alt.interfaceClass);
        if (best && best.rank <= r) continue;
        const input = alt.endpoints.find((e) => e.direction === "in" && e.type === "bulk");
        best = {
          rank: r,
          endpoint: {
            configurationValue: configuration.configurationValue,
            interfaceNumber: iface.interfaceNumber,
            alternateSetting: alt.alternateSetting,
            interfaceClass: alt.interfaceClass,
            endpointNumber: out.endpointNumber,
            inEndpointNumber: input?.endpointNumber ?? null,
          },
        };
      }
    }
  }
  return best?.endpoint ?? null;
}

export function describePrinterEndpoint(endpoint: PrinterEndpoint): string {
  const kind =
    endpoint.interfaceClass === USB_CLASS_PRINTER
      ? "printer class"
      : endpoint.interfaceClass === USB_CLASS_VENDOR_SPECIFIC
        ? "vendor-specific"
        : `class 0x${endpoint.interfaceClass.toString(16)}`;
  const input = endpoint.inEndpointNumber === null ? "no IN" : `IN ep ${endpoint.inEndpointNumber}`;
  return `USB interface ${endpoint.interfaceNumber} (${kind}), OUT ep ${endpoint.endpointNumber}, ${input}`;
}

/** What to call the device in messages — the name Chrome's picker showed. */
export function usbDeviceLabel(device: Pick<USBDevice, "productName" | "manufacturerName" | "vendorId" | "productId">): string {
  if (device.productName) return device.productName;
  const hex = (n: number) => n.toString(16).padStart(4, "0");
  return `${device.manufacturerName ?? "USB device"} ${hex(device.vendorId)}:${hex(device.productId)}`;
}
