import type { PrinterLinkKind, PrinterLinkRequest, PrinterLinks, PrinterTransport } from "@mockintosh/print";
import { WebUSBPrinterTransport, isWebUSBAvailable } from "./WebUSBPrinterTransport";
import { WebBluetoothPrinterTransport, isWebBluetoothAvailable } from "./webBluetoothPrinterTransport";

/** WebUSB and Web Bluetooth printers, whichever this browser has. `undefined` when neither. */
export function createWebPrinterLinks(): PrinterLinks | undefined {
  const kinds: PrinterLinkKind[] = [];
  if (isWebUSBAvailable()) kinds.push("usb");
  if (isWebBluetoothAvailable()) kinds.push("bluetooth");
  if (kinds.length === 0) return undefined;
  return {
    kinds,
    open(request: PrinterLinkRequest): PrinterTransport {
      if (request.kind === "usb") return new WebUSBPrinterTransport(request.device ? { device: request.device } : {});
      return new WebBluetoothPrinterTransport({
        gatt: request.gatt,
        ...(request.namePrefixes ? { namePrefixes: request.namePrefixes } : {}),
        ...(request.device ? { device: request.device } : {}),
      });
    },
  };
}
