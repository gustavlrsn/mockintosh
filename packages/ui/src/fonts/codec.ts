import type { DeckerFont } from "./font";
import { decodeBase64, encodeBase64 } from "../base64";

export function decodeDeckerFont(dataBlock: string, name: string = "unnamed"): DeckerFont {
  if (!dataBlock.startsWith("%%FNT0") && !dataBlock.startsWith("%%FNT1")) {
    throw new Error("Expected a %%FNT0 or %%FNT1 Decker font record");
  }

  const sourceFormat = dataBlock.slice(2, 6) as "FNT0" | "FNT1";
  const bytes = decodeBase64(dataBlock.slice(6));
  if (bytes.length < 3) {
    throw new Error("Decker font payload is too short");
  }

  const maxWidth = Math.max(1, bytes[0]);
  const glyphHeight = Math.max(1, bytes[1]);
  const spacing = bytes[2];
  const glyphStride = Math.ceil(maxWidth / 8) * glyphHeight;
  const glyphWidths = new Uint8Array(256);
  const glyphData = new Uint8Array(256 * glyphStride);

  if (sourceFormat === "FNT0") {
    let offset = 3;
    for (let glyphIndex = 32; glyphIndex < 128; glyphIndex++) {
      if (offset >= bytes.length) break;
      const width = bytes[offset++];
      if (offset + glyphStride > bytes.length) break;
      glyphWidths[glyphIndex] = width;
      glyphData.set(bytes.subarray(offset, offset + glyphStride), glyphIndex * glyphStride);
      offset += glyphStride;
    }
  } else {
    let offset = 3;
    while (offset + 1 < bytes.length) {
      const glyphIndex = bytes[offset++];
      const width = bytes[offset++];
      if (offset + glyphStride > bytes.length) break;
      glyphWidths[glyphIndex] = width;
      glyphData.set(bytes.subarray(offset, offset + glyphStride), glyphIndex * glyphStride);
      offset += glyphStride;
    }
  }

  return { name, maxWidth, glyphHeight, spacing, glyphStride, glyphWidths, glyphData, sourceFormat };
}

/** Pack a decoded font back into a %%FNT0 / %%FNT1 data block. */
export function encodeDeckerFont(font: DeckerFont): string {
  const chunks: number[] = [font.maxWidth, font.glyphHeight, font.spacing];
  if (font.sourceFormat === "FNT0") {
    for (let glyphIndex = 32; glyphIndex < 128; glyphIndex++) {
      chunks.push(font.glyphWidths[glyphIndex] ?? 0);
      const start = glyphIndex * font.glyphStride;
      for (let i = 0; i < font.glyphStride; i++) chunks.push(font.glyphData[start + i] ?? 0);
    }
  } else {
    for (let glyphIndex = 0; glyphIndex < 256; glyphIndex++) {
      const width = font.glyphWidths[glyphIndex] ?? 0;
      if (width < 1) continue;
      chunks.push(glyphIndex, width);
      const start = glyphIndex * font.glyphStride;
      for (let i = 0; i < font.glyphStride; i++) chunks.push(font.glyphData[start + i] ?? 0);
    }
  }
  return `%%${font.sourceFormat}${encodeBase64(Uint8Array.from(chunks))}`;
}
