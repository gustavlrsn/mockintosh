import { resolution } from "../../lib/config";
import {
  RASTER_UV_MIN_X,
  RASTER_UV_MAX_X,
  RASTER_UV_MIN_Y,
  RASTER_UV_MAX_Y,
} from "./MacPlusModel";

export interface OSBridge {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export async function bootOS(): Promise<OSBridge> {
  await import("../solidMain");

  const canvas = await waitForCanvas("#root canvas", 5000);

  return {
    canvas,
    width: resolution.width,
    height: resolution.height,
  };
}

function waitForCanvas(
  selector: string,
  timeoutMs: number
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLCanvasElement>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector<HTMLCanvasElement>(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.getElementById("root")!, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error("OS canvas did not appear within timeout"));
    }, timeoutMs);
  });
}

/**
 * Maps a CRT mesh UV coordinate to OS pixel coordinates.
 *
 * The CRT mesh covers the full glass opening, but the OS raster only occupies
 * a sub-rectangle. This function maps from the CRT UV space into the raster
 * sub-region, then to OS pixel coords.
 *
 * Returns null if the UV is outside the raster area (i.e. on the dark border).
 */
export function mapCRTUVToCanvas(
  u: number,
  v: number
): { x: number; y: number } | null {
  // The shader flips V to correct GLB orientation. Apply the same here.
  const flippedU = u;
  const flippedV = 1.0 - v;

  const rasterU =
    (flippedU - RASTER_UV_MIN_X) / (RASTER_UV_MAX_X - RASTER_UV_MIN_X);
  const rasterV =
    (flippedV - RASTER_UV_MIN_Y) / (RASTER_UV_MAX_Y - RASTER_UV_MIN_Y);

  if (rasterU < 0 || rasterU > 1 || rasterV < 0 || rasterV > 1) {
    return null;
  }

  return {
    x: Math.floor(rasterU * resolution.width),
    y: Math.floor((1 - rasterV) * resolution.height),
  };
}

export function dispatchToOSCanvas(
  canvas: HTMLCanvasElement,
  type: string,
  osX: number,
  osY: number
): void {
  const rect = canvas.getBoundingClientRect();

  const scaleX = rect.width / resolution.width || 1;
  const scaleY = rect.height / resolution.height || 1;

  const clientX = rect.left + osX * scaleX;
  const clientY = rect.top + osY * scaleY;

  const event = new MouseEvent(type, {
    clientX,
    clientY,
    bubbles: true,
    cancelable: true,
  });

  canvas.dispatchEvent(event);
}
