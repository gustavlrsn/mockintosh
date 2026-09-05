/**
 * A byte sink connected to a printer. The ESC/POS byte stream is the same on
 * every platform; only the wire differs (WebUSB in the browser, UART on a
 * microcontroller, a socket for a network printer).
 */
export interface PrinterTransport {
  /** Whether `write` can currently deliver bytes to a printer. */
  readonly connected: boolean;
  /**
   * Establish the connection. On the web this prompts the user to pick a USB
   * device, so it must be called from a user gesture (a click handler).
   */
  connect(): Promise<void>;
  /** Deliver `bytes` to the printer, in order. Rejects if not connected. */
  write(bytes: Uint8Array): Promise<void>;
  /** Release the device. `connected` becomes false. */
  disconnect(): Promise<void>;
}

/** Thrown when a transport is asked to write before `connect()` succeeded. */
export class PrinterNotConnectedError extends Error {
  constructor() {
    super("No printer is connected");
    this.name = "PrinterNotConnectedError";
  }
}

/** Thrown when the platform has no way to reach a printer at all. */
export class PrinterUnavailableError extends Error {
  constructor(reason: string) {
    super(`Printing is unavailable: ${reason}`);
    this.name = "PrinterUnavailableError";
  }
}
