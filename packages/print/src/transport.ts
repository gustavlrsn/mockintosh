/**
 * A byte sink connected to a printer. The ESC/POS byte stream is the same on
 * every platform; only the wire differs (WebUSB in the browser, UART on a
 * microcontroller, a socket for a network printer).
 */
import type { BluetoothGattProfile, PrinterDeviceRef, PrinterIdentity, PrinterLinkKind } from "./driver";

/**
 * What to connect to. Without `device`, the transport's `choose()` asks the
 * user for a new printer; with one, `restore()` / `connect()` find that same
 * printer again.
 */
export type PrinterLinkRequest =
  | { kind: "usb"; device?: Extract<PrinterDeviceRef, { kind: "usb" }> }
  | {
      kind: "bluetooth";
      device?: Extract<PrinterDeviceRef, { kind: "bluetooth" }>;
      /** Services a printer may write through; the first one the device has is used. */
      gatt: readonly BluetoothGattProfile[];
      /** Also offer devices whose name starts with one of these in the picker. */
      namePrefixes?: readonly string[];
    };

/** The platform's printer connections: which kinds it has, and a transport per printer. */
export interface PrinterLinks {
  readonly kinds: readonly PrinterLinkKind[];
  open(request: PrinterLinkRequest): PrinterTransport;
}

export interface PrinterTransport {
  /** Whether `write` can currently deliver bytes to a printer. */
  readonly connected: boolean;
  /** The connected device's name as the host shows it, or `null` when not connected. */
  readonly deviceName: string | null;
  /**
   * Establish the connection. On the web this prompts the user to pick a USB
   * device, so it must be called from a user gesture (a click handler).
   */
  connect(): Promise<void>;
  /**
   * Reconnect a printer the user already chose earlier (e.g. before a page
   * reload) without prompting. Stays disconnected if there is none; needs no
   * user gesture, so the system calls it at startup.
   */
  restore?(): Promise<void>;
  /**
   * Ask the user for a (possibly different) printer, even when one is
   * connected, and switch to it. Cancelling keeps the current printer.
   * Transports with one fixed port simply reconnect.
   */
  choose(): Promise<void>;
  /** Disconnect and drop any remembered device, so the next `connect()` asks again. */
  forget(): Promise<void>;
  /**
   * Called when `connected` / `deviceName` change on their own — the printer
   * was unplugged, switched off, or came back. Returns an unsubscribe function.
   */
  onStateChange?(listener: () => void): () => void;

  /**
   * What the link itself knows about the connected device (USB descriptors,
   * Bluetooth name and services), without talking to the printer. `null`
   * when not connected. {@link identifyPrinter} adds the printer's answers.
   */
  identity?(): PrinterIdentity | null;

  // Diagnostics — optional; a transport implements what its wire allows.

  /** One line on how the printer is attached (interface, endpoints). */
  linkDetails?(): string;
  /**
   * Read up to `maxBytes` the printer sent back, or `null` if nothing arrives
   * within `timeoutMs`. Used for status replies.
   */
  read?(maxBytes: number, timeoutMs: number): Promise<Uint8Array | null>;
  /** Raw USB printer-class `GET_PORT_STATUS` byte, or `null` if the device doesn't answer. */
  portStatus?(): Promise<number | null>;
  /** IEEE 1284 device ID string (USB printer-class `GET_DEVICE_ID`), or `null`. */
  deviceId?(): Promise<string | null>;
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

/** Thrown by `connect()` when the user dismisses the device picker without choosing a printer. */
export class PrinterCancelledError extends Error {
  constructor() {
    super("No printer was chosen");
    this.name = "PrinterCancelledError";
  }
}

/** Thrown by `connect()` when the chosen device can't take print data. The transport has already let go of it. */
export class PrinterWrongDeviceError extends Error {
  constructor(readonly deviceName: string) {
    super(`"${deviceName}" isn't a printer. Print again and choose the printer from the list.`);
    this.name = "PrinterWrongDeviceError";
  }
}

/** Thrown when the platform has no way to reach a printer at all. */
export class PrinterUnavailableError extends Error {
  constructor(reason: string) {
    super(`Printing is unavailable: ${reason}`);
    this.name = "PrinterUnavailableError";
  }
}
