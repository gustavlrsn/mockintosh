/**
 * Epson `GS ( E` user-setting mode: settings the printer keeps in its own
 * memory across power cycles, such as print density and speed. Commands are
 * accepted only between entering the mode and leaving it; leaving resets the
 * printer, which then starts with the new values.
 */
import type { PrinterTransport } from "./transport";
import { ESCPOS_STATUS, escPosStatusQuery, isEscPosStatusByte } from "./status";

const GS = 0x1d;

/** `GS ( E pL pH fn [data]` with the length prefix filled in. */
export function gsParenE(fn: number, ...data: number[]): Uint8Array {
  const length = data.length + 1;
  return Uint8Array.of(GS, 0x28, 0x45, length & 0xff, length >> 8, fn, ...data);
}

/** Setting codes (`a`) for `fn = 5` (set) and `fn = 6` (read). */
export const ESCPOS_USER_SETTING = {
  density: 5,
  speed: 6,
} as const;

/** Epson's density steps: −6 (lightest) … 0 (standard) … +6 (darkest). */
export const ESCPOS_DENSITY_RANGE = { min: -6, max: 6 } as const;

export const ENTER_USER_SETTINGS = gsParenE(1, 0x49, 0x4e); // "IN"
export const EXIT_USER_SETTINGS = gsParenE(2, 0x4f, 0x55, 0x54); // "OUT"
/** What an Epson-compatible printer answers to {@link ENTER_USER_SETTINGS}. */
export const ENTERED_USER_SETTINGS_REPLY = [0x37, 0x20, 0x00] as const;

/** `fn = 5`: set one stored value. Negative values go as their 16-bit two's complement. */
export function setUserSettingBytes(a: number, value: number): Uint8Array {
  const n = value < 0 ? 0x10000 + value : value;
  return gsParenE(5, a, n & 0xff, n >> 8);
}

/** `fn = 6`: ask for one stored value. */
export function readUserSettingBytes(a: number): Uint8Array {
  return gsParenE(6, a);
}

/** `fn = 4`: ask for memory switch `a` (1–8). */
export function readMemorySwitchBytes(a: number): Uint8Array {
  return gsParenE(4, a);
}

const ENTER_TIMEOUT_MS = 800;
const RESTART_POLL_MS = 300;
const RESTART_TIMEOUT_MS = 8000;

/**
 * Store `value` for setting `a`, then leave settings mode so the printer
 * restarts with it, and wait until it answers again. Throws if the printer
 * doesn't acknowledge settings mode, so nothing is sent blind.
 */
export async function writeUserSetting(transport: PrinterTransport, a: number, value: number): Promise<void> {
  if (!transport.read) throw new Error("This connection can't read replies from the printer.");
  await transport.write(ENTER_USER_SETTINGS);
  const reply = await transport.read(64, ENTER_TIMEOUT_MS);
  const acknowledged =
    reply !== null && ENTERED_USER_SETTINGS_REPLY.every((byte, i) => reply[i] === byte);
  if (!acknowledged) {
    await transport.write(EXIT_USER_SETTINGS);
    throw new Error("The printer didn't acknowledge settings mode (GS ( E), so nothing was changed.");
  }
  await transport.write(setUserSettingBytes(a, value));
  await transport.write(EXIT_USER_SETTINGS);
  await waitForRestart(transport);
}

/** Poll real-time status until the printer answers after its reset. */
async function waitForRestart(transport: PrinterTransport): Promise<void> {
  const deadline = Date.now() + RESTART_TIMEOUT_MS;
  await sleep(RESTART_POLL_MS);
  while (Date.now() < deadline) {
    try {
      if (transport.connected && transport.read) {
        await transport.write(escPosStatusQuery(ESCPOS_STATUS.printer));
        const reply = await transport.read(1, RESTART_POLL_MS);
        if (reply && isEscPosStatusByte(reply[0]!)) return;
      } else {
        await sleep(RESTART_POLL_MS);
      }
    } catch {
      // The printer may drop off USB while it resets.
      await sleep(RESTART_POLL_MS);
    }
  }
  throw new Error("The printer didn't come back after saving the setting. Try switching it off and on.");
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
