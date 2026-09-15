/**
 * The browser platform: a `<canvas>` for the screen, DOM events for input,
 * `requestAnimationFrame` for the clock, OPFS for the disk, and WebUSB for
 * the printer. This is the only OS-level module that may use DOM APIs.
 */
import { InMemoryBackend } from "@mockintosh/fs";
import { OPFSBackend, isOPFSAvailable } from "./OPFSBackend";
import { WebUSBPrinterTransport, isWebUSBAvailable } from "./WebUSBPrinterTransport";
import type { UIClipboard } from "@mockintosh/ui";
import type {
  HostCapability,
  Platform,
  PlatformDisplay,
  PlatformInput,
  PlatformKeyEvent,
  PlatformPointerEvent,
  PlatformScheduler,
  PointerButton,
} from "../types";
import { browserBuilder } from "./builder";
import { CanvasPresenter } from "./CanvasPresenter";
import { createWebImageService } from "./media/images";
import { createWebVideoService } from "./media/video";
import { createWebCameraService } from "./media/camera";
import { createWebCrypto } from "./crypto";
import { createWebBrowserService } from "./browser";

export interface WebPlatformOptions {
  /** Element the screen canvas is appended to. */
  root: HTMLElement;
  width: number;
  height: number;
}

/** The classic 512×342 screen — what the web build boots with. */
export const DEFAULT_SCREEN = { width: 512, height: 342 } as const;

export function createWebPlatform(options: WebPlatformOptions): Platform {
  const { root, width, height } = options;

  // --- Screen: an integer-zoomed canvas that fits the window ---
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.tabIndex = 0; // focusable so it receives keyboard events
  canvas.style.outline = "none";
  root.appendChild(canvas);
  const ctx2d = canvas.getContext("2d", { alpha: false })!;

  let zoom = 1;
  function fitToWindow(): void {
    zoom = Math.max(
      1,
      Math.min(Math.floor(window.innerWidth / width), Math.floor(window.innerHeight / height))
    );
    canvas.style.width = `${width * zoom}px`;
    canvas.style.height = `${height * zoom}px`;
  }
  fitToWindow();
  window.addEventListener("resize", fitToWindow);

  let presenter: CanvasPresenter | null = null;
  const display: PlatformDisplay = {
    width,
    height,
    present(screen) {
      presenter ??= new CanvasPresenter(screen, ctx2d);
      presenter.present();
    },
  };

  // --- Input: DOM events → screen-space pointer/key events ---
  const input = createDOMInput(canvas, () => zoom);

  // --- Clock ---
  const scheduler: PlatformScheduler = {
    requestFrame(cb) {
      const id = requestAnimationFrame(cb);
      return () => cancelAnimationFrame(id);
    },
    now: () => performance.now(),
  };

  // --- Disk ---
  if (!isOPFSAvailable()) {
    console.warn("OPFS unavailable — the file system will not persist across reloads.");
  }
  const storage = isOPFSAvailable() ? new OPFSBackend() : new InMemoryBackend();

  // --- Peripherals ---
  const clipboard: UIClipboard | undefined = navigator.clipboard
    ? {
        readText: () => navigator.clipboard.readText(),
        writeText: (text) => navigator.clipboard.writeText(text),
      }
    : undefined;

  const hostCapabilities: HostCapability[] = [];

  return {
    display,
    input,
    scheduler,
    storage,
    env: {
      origin: location.origin,
      config: {
        SPOTIFY_CLIENT_ID: (import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined) ?? "",
      },
    },
    hostCapabilities,
    crypto: createWebCrypto(),
    browser: createWebBrowserService(),
    clipboard,
    printer: isWebUSBAvailable() ? new WebUSBPrinterTransport() : undefined,
    fetch: globalThis.fetch.bind(globalThis),
    images: createWebImageService(),
    video: createWebVideoService(),
    camera: createWebCameraService(),
    builder: browserBuilder,
    async loadArtifact(code) {
      const url = URL.createObjectURL(new Blob([code], {type: "text/javascript"}));
      try { return await import(/* @vite-ignore */ url); } finally { URL.revokeObjectURL(url); }
    },
    loadModule: (url) => import(/* @vite-ignore */ url),
  };
}

function createDOMInput(canvas: HTMLCanvasElement, zoom: () => number): PlatformInput {
  const pointerHandlers = new Set<(e: PlatformPointerEvent) => void>();
  const keyHandlers = new Set<(e: PlatformKeyEvent) => void>();

  const emitPointer = (e: PlatformPointerEvent) => pointerHandlers.forEach((h) => h(e));
  const emitKey = (e: PlatformKeyEvent) => keyHandlers.forEach((h) => h(e));

  function toScreen(e: MouseEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const z = zoom();
    return { x: Math.floor((e.clientX - rect.left) / z), y: Math.floor((e.clientY - rect.top) / z) };
  }
  const button = (e: MouseEvent): PointerButton => (e.button === 1 || e.button === 2 ? e.button : 0);

  canvas.addEventListener("mousedown", (e) => {
    canvas.focus({ preventScroll: true });
    emitPointer({ type: "down", ...toScreen(e), button: button(e) });
  });
  canvas.addEventListener("mouseup", (e) => {
    emitPointer({ type: "up", ...toScreen(e), button: button(e) });
  });

  // Coalesce mouse moves to one per frame.
  let pendingMove: MouseEvent | null = null;
  canvas.addEventListener("mousemove", (e) => {
    if (pendingMove) {
      pendingMove = e;
      return;
    }
    pendingMove = e;
    requestAnimationFrame(() => {
      const ev = pendingMove!;
      pendingMove = null;
      emitPointer({ type: "move", ...toScreen(ev) });
    });
  });

  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      emitPointer({ type: "scroll", ...toScreen(e), deltaX: e.deltaX, deltaY: e.deltaY });
    },
    { passive: false }
  );

  const keyEvent = (type: "down" | "up", e: KeyboardEvent): PlatformKeyEvent => ({
    type,
    key: e.key,
    modifiers: { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey },
  });
  window.addEventListener("keydown", (e) => emitKey(keyEvent("down", e)));
  window.addEventListener("keyup", (e) => emitKey(keyEvent("up", e)));

  return {
    onPointer(handler) {
      pointerHandlers.add(handler);
      return () => pointerHandlers.delete(handler);
    },
    onKey(handler) {
      keyHandlers.add(handler);
      return () => keyHandlers.delete(handler);
    },
  };
}
