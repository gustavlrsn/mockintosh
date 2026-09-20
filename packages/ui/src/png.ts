/**
 * 1-bit greyscale PNG for the `<bitmap>` / `blitPixels` contract:
 * `0` = white, `1` = black. PNG itself is the opposite (0 = black), so
 * pixels are inverted on the way out.
 */

const SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i++) {
    a += bytes[i];
    if (a >= 65521) a -= 65521;
    b += a;
    if (b >= 65521) b -= 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function writeBe32(out: Uint8Array, offset: number, value: number): void {
  out[offset] = (value >>> 24) & 0xff;
  out[offset + 1] = (value >>> 16) & 0xff;
  out[offset + 2] = (value >>> 8) & 0xff;
  out[offset + 3] = value & 0xff;
}

function concat(parts: readonly Uint8Array[]): Uint8Array {
  let size = 0;
  for (const p of parts) size += p.length;
  const out = new Uint8Array(size);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  writeBe32(out, 0, data.length);
  out[4] = type.charCodeAt(0);
  out[5] = type.charCodeAt(1);
  out[6] = type.charCodeAt(2);
  out[7] = type.charCodeAt(3);
  out.set(data, 8);
  writeBe32(out, 8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

/** Filter-None scanlines, 1 bpp, MSB leftmost, PNG white = 1. */
function scanlines(pixels: Uint8Array, width: number, height: number): Uint8Array {
  const rowBytes = 1 + ((width + 7) >> 3);
  const out = new Uint8Array(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const row = y * rowBytes;
    const srcRow = y * width;
    for (let x = 0; x < width; x++) {
      if (pixels[srcRow + x] === 0) out[row + 1 + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return out;
}

/** zlib, stored (uncompressed) DEFLATE blocks. */
function zlibStore(data: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
  if (data.length === 0) {
    parts.push(new Uint8Array([1, 0, 0, 0xff, 0xff]));
  } else {
    for (let offset = 0; offset < data.length; ) {
      const n = Math.min(65535, data.length - offset);
      const last = offset + n >= data.length;
      const block = new Uint8Array(5 + n);
      block[0] = last ? 1 : 0;
      block[1] = n & 0xff;
      block[2] = (n >> 8) & 0xff;
      block[3] = (~n) & 0xff;
      block[4] = ((~n) >> 8) & 0xff;
      block.set(data.subarray(offset, offset + n), 5);
      parts.push(block);
      offset += n;
    }
  }
  const check = new Uint8Array(4);
  writeBe32(check, 0, adler32(data));
  parts.push(check);
  return concat(parts);
}

/**
 * Encode `pixels` (`0` = white, `1` = black) as a 1-bit greyscale PNG.
 */
export function encodePng1bit(pixels: Uint8Array, width: number, height: number): Uint8Array {
  if (width < 1 || height < 1) throw new Error("PNG size must be at least 1×1");
  if (pixels.length < width * height) throw new Error("Pixel buffer is shorter than width×height");

  const ihdr = new Uint8Array(13);
  writeBe32(ihdr, 0, width);
  writeBe32(ihdr, 4, height);
  ihdr[8] = 1; // bit depth
  ihdr[9] = 0; // greyscale
  return concat([
    SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlibStore(scanlines(pixels, width, height))),
    chunk("IEND", new Uint8Array(0)),
  ]);
}

/** Filter-None scanlines, 8-bit RGBA. */
function rgbaScanlines(rgba: Uint8Array, width: number, height: number): Uint8Array {
  const rowBytes = 1 + width * 4;
  const out = new Uint8Array(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const dest = y * rowBytes + 1;
    const src = y * width * 4;
    out.set(rgba.subarray(src, src + width * 4), dest);
  }
  return out;
}

/**
 * Encode packed RGBA (`r,g,b,a` per pixel) as an 8-bit color PNG.
 * Used for CSS `cursor: url(...)` faces that need a mask.
 */
export function encodePngRgba(rgba: Uint8Array, width: number, height: number): Uint8Array {
  if (width < 1 || height < 1) throw new Error("PNG size must be at least 1×1");
  if (rgba.length < width * height * 4) throw new Error("RGBA buffer is shorter than width×height×4");

  const ihdr = new Uint8Array(13);
  writeBe32(ihdr, 0, width);
  writeBe32(ihdr, 4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return concat([
    SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlibStore(rgbaScanlines(rgba, width, height))),
    chunk("IEND", new Uint8Array(0)),
  ]);
}
