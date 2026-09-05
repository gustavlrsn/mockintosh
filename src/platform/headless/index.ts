/**
 * The headless platform: no screen, no hardware, no host APIs at all.
 *
 * The OS boots against an in-memory display whose frames can be read back,
 * synthetic pointer/keyboard injection, and a clock the caller advances by
 * hand. This is how the shell is tested end to end (see `boot.test.ts`), and
 * the natural starting point for any new host — replace `present()` and the
 * input injectors with real drivers.
 */
import { InMemoryBackend } from "@mockintosh/fs";
import { pixelsFromBitMap, type BitMap } from "@mockintosh/quickdraw";
import type {
  Platform,
  PlatformKeyEvent,
  PlatformPointerEvent,
  PlatformScheduler,
} from "../types";

export interface HeadlessPlatformOptions {
  width: number;
  height: number;
}

export interface HeadlessPlatform extends Platform {
  /** Number of frames presented so far. */
  readonly frameCount: number;
  /** Framebuffer as presented most recently, one byte per pixel (1 = black); `null` before the first frame. */
  lastFrame(): Uint8Array | null;
  /** Inject a pointer event as if the mouse/touch driver produced it. */
  pointer(event: PlatformPointerEvent): void;
  /** Inject a key event as if the keyboard driver produced it. */
  key(event: PlatformKeyEvent): void;
  /** Press and release at (x, y). */
  click(x: number, y: number): void;
  /** Advance the clock by `ms` and run every pending frame callback once. */
  tick(ms?: number): void;
}

export function createHeadlessPlatform(options: HeadlessPlatformOptions): HeadlessPlatform {
  const { width, height } = options;

  let presented: BitMap | null = null;
  let frameCount = 0;

  const pointerHandlers = new Set<(e: PlatformPointerEvent) => void>();
  const keyHandlers = new Set<(e: PlatformKeyEvent) => void>();

  let clock = 0;
  let frameCallbacks: Array<(timeMs: number) => void> = [];

  const scheduler: PlatformScheduler = {
    requestFrame(cb) {
      frameCallbacks.push(cb);
    },
    now: () => clock,
  };

  return {
    display: {
      width,
      height,
      present(screen) {
        presented = screen;
        frameCount++;
      },
    },
    input: {
      onPointer(handler) {
        pointerHandlers.add(handler);
        return () => pointerHandlers.delete(handler);
      },
      onKey(handler) {
        keyHandlers.add(handler);
        return () => keyHandlers.delete(handler);
      },
    },
    scheduler,
    storage: new InMemoryBackend(),
    env: { origin: "" },
    hostCapabilities: [],

    get frameCount() {
      return frameCount;
    },
    lastFrame() {
      return presented ? pixelsFromBitMap(presented) : null;
    },
    pointer(event) {
      pointerHandlers.forEach((h) => h(event));
    },
    key(event) {
      keyHandlers.forEach((h) => h(event));
    },
    click(x, y) {
      this.pointer({ type: "down", x, y, button: 0 });
      this.pointer({ type: "up", x, y, button: 0 });
    },
    tick(ms = 16) {
      clock += ms;
      const due = frameCallbacks;
      frameCallbacks = [];
      for (const cb of due) cb(clock);
    },
  };
}
