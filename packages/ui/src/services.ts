/**
 * Host services the UI framework may use but does not own.
 *
 * The host passes these to `createUI()`; components reach them through
 * `useUIServices()`. Every service is optional — a platform without a
 * clipboard simply has no copy/paste — so the framework has no dependency on
 * browser globals.
 */
import { createContext, useContext } from "solid-js";
import type { ImageFrame } from "./dither";

export interface UIClipboard {
  readText(): Promise<string>;
  writeText(text: string): Promise<void>;
}

export interface ImageDecodeOptions {
  /** MIME hint when `source` is raw bytes. */
  type?: string;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Host JPEG/PNG/GIF decoder. The UI kit is DOM-free; a browser host
 * implements this with `createImageBitmap`, a device with its own decoder.
 * `source` is a URL or encoded bytes — not an `ImageFrame`.
 */
export interface UIImageService {
  decode(source: string | Uint8Array, options?: ImageDecodeOptions): Promise<ImageFrame>;
}

export interface UIServices {
  clipboard?: UIClipboard;
  images?: UIImageService;
  /** Host journal for errors thrown from pointer/key handlers. */
  onError?(error: unknown): void;
}

export const UIServicesContext = createContext<UIServices>({});

export function useUIServices(): UIServices {
  return useContext(UIServicesContext);
}
