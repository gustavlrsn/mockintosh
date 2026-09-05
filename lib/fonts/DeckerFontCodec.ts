import { DeckerFont, getGlyphDataOffset, getGlyphWidth } from "./DeckerFont";

function decodeBase64(data: string): Uint8Array {
  if (typeof atob === "function") {
    return new Uint8Array(Array.from(atob(data), (ch) => ch.charCodeAt(0)));
  }
  const buffer = Buffer.from(data, "base64");
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

function encodeBase64(bytes: Uint8Array): string {
  let raw = "";
  for (let i = 0; i < bytes.length; i++) raw += String.fromCharCode(bytes[i]);
  if (typeof btoa === "function") return btoa(raw);
  return Buffer.from(raw, "binary").toString("base64");
}

export function decodeDeckerDataBlock(
  type: "FNT",
  dataBlock: string
): Uint8Array {
  if (!dataBlock.startsWith(`%%${type}`)) {
    throw new Error(`Invalid ${type} data block`);
  }
  return decodeBase64(dataBlock.slice(6));
}

export function encodeDeckerDataBlock(
  type: "FNT0" | "FNT1",
  bytes: Uint8Array
): string {
  return `%%${type}${encodeBase64(bytes)}`;
}

export function decodeDeckerFont(
  dataBlock: string,
  name: string = "unnamed"
): DeckerFont {
  if (!dataBlock.startsWith("%%FNT0") && !dataBlock.startsWith("%%FNT1")) {
    throw new Error("Expected a %%FNT0 or %%FNT1 Decker font record");
  }

  const sourceFormat = dataBlock.slice(2, 6) as "FNT0" | "FNT1";
  const bytes = decodeDeckerDataBlock("FNT", dataBlock);
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
      glyphData.set(
        bytes.subarray(offset, offset + glyphStride),
        glyphIndex * glyphStride
      );
      offset += glyphStride;
    }
  } else {
    let offset = 3;
    while (offset + 1 < bytes.length) {
      const glyphIndex = bytes[offset++];
      const width = bytes[offset++];
      if (offset + glyphStride > bytes.length) break;
      glyphWidths[glyphIndex] = width;
      glyphData.set(
        bytes.subarray(offset, offset + glyphStride),
        glyphIndex * glyphStride
      );
      offset += glyphStride;
    }
  }

  return {
    name,
    maxWidth,
    glyphHeight,
    spacing,
    glyphStride,
    glyphWidths,
    glyphData,
    sourceFormat,
  };
}

export function encodeDeckerFont(font: DeckerFont): string {
  const header = [font.maxWidth, font.glyphHeight, font.spacing];
  const dense = Array.from({ length: 256 }, (_, index) => index).every(
    (glyphIndex) =>
      (getGlyphWidth(font, glyphIndex) !== 0) ===
      (glyphIndex >= 32 && glyphIndex <= 127)
  );

  const body: number[] = [];
  if (dense) {
    for (let glyphIndex = 32; glyphIndex < 128; glyphIndex++) {
      body.push(getGlyphWidth(font, glyphIndex));
      const offset = getGlyphDataOffset(font, glyphIndex);
      for (let i = 0; i < font.glyphStride; i++) {
        body.push(font.glyphData[offset + i]);
      }
    }
    return encodeDeckerDataBlock("FNT0", new Uint8Array([...header, ...body]));
  }

  for (let glyphIndex = 0; glyphIndex < 256; glyphIndex++) {
    const width = getGlyphWidth(font, glyphIndex);
    if (width < 1) continue;
    body.push(glyphIndex, width);
    const offset = getGlyphDataOffset(font, glyphIndex);
    for (let i = 0; i < font.glyphStride; i++) {
      body.push(font.glyphData[offset + i]);
    }
  }

  return encodeDeckerDataBlock("FNT1", new Uint8Array([...header, ...body]));
}
