/**
 * Browser JPEG/PNG/GIF → ImageFrame. Not imported by the DOM-free core.
 */
import type { ImageFrame } from "../dither";
import type { ImageDecodeOptions, UIImageService } from "../services";

async function toBlob(source: string | Uint8Array | Blob, type?: string): Promise<Blob> {
  if (typeof Blob !== "undefined" && source instanceof Blob) return source;
  if (typeof source === "string") {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Could not fetch image (${response.status})`);
    return response.blob();
  }
  return new Blob([source as BlobPart], { type: type ?? "application/octet-stream" });
}

export async function decodeImage(
  source: string | Uint8Array | Blob,
  options?: ImageDecodeOptions,
): Promise<ImageFrame> {
  const blob = await toBlob(source, options?.type);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    throw new Error("Could not decode image");
  }
  let width = bitmap.width;
  let height = bitmap.height;
  if (options?.maxWidth || options?.maxHeight) {
    const scale = Math.min(1, (options.maxWidth ?? width) / width, (options.maxHeight ?? height) / height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not decode image");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const data = ctx.getImageData(0, 0, width, height);
  return { width, height, rgba: data.data };
}

export function createWebImageService(): UIImageService {
  return { decode: decodeImage };
}
