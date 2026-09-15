import type { ImageFrame, ImageService } from "@mockintosh/sdk";

export function createWebImageService(): ImageService {
  return {
    async decode(bytes, type, options) {
      const blob = new Blob([bytes as BlobPart], { type: type ?? "application/octet-stream" });
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
      return { width, height, rgba: data.data } satisfies ImageFrame;
    },
  };
}
