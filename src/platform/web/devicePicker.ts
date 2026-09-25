import { PrinterCancelledError } from "@mockintosh/print";

/**
 * Run a browser device chooser (`navigator.usb.requestDevice`,
 * `navigator.bluetooth.requestDevice`). Both reject with a `NotFoundError`
 * DOMException when the user closes the chooser without picking a device.
 */
export async function pickPrinterDevice<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") throw new PrinterCancelledError();
    throw error;
  }
}
