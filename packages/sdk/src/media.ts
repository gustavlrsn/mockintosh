import type { ImageFrame } from "@mockintosh/ui";

export type { ImageFrame } from "@mockintosh/ui";

export interface ImageService {
  /** Decode PNG/JPEG/GIF bytes; `type` is the MIME hint. Rejects when undecodable. */
  decode(bytes: Uint8Array, type?: string, options?: { maxWidth?: number; maxHeight?: number }): Promise<ImageFrame>;
}

export interface VideoSource {
  play(): Promise<void>;
  pause(): void;
  /** Latest decoded frame, or null before the first one. Cheap to call every frame. */
  frame(): ImageFrame | null;
  readonly width: number;
  readonly height: number;
  close(): void;
}

export interface VideoService {
  open(url: string, options?: { loop?: boolean; muted?: boolean }): Promise<VideoSource>;
}

export interface CameraSource extends Omit<VideoSource, "play" | "pause"> {}

export interface CameraService {
  /** Prompts the user on the web; call from a click. */
  open(options?: { facing?: "user" | "environment"; width?: number; height?: number }): Promise<CameraSource>;
}

export interface AppScheduler {
  /** Run `callback` before the next display refresh; returns a cancel function. */
  requestFrame(callback: (timeMs: number) => void): () => void;
  /** Monotonic milliseconds. */
  now(): number;
}
