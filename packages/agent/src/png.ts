/**
 * Pack a 1-bit QuickDraw-style frame (`bytes` + `rowBytes`) into a PNG
 * (grayscale, 1 bpp, stored-deflate). DOM-free.
 */

export interface PackedFrame {
  width: number;
  height: number;
  rowBytes: number;
  bytes: number[] | Uint8Array;
}

export function encodePackedPng(frame: PackedFrame): Uint8Array {
  const { width, height, rowBytes } = frame;
  const src = frame.bytes instanceof Uint8Array ? frame.bytes : new Uint8Array(frame.bytes);
  const stride = Math.ceil(width / 8);
  const raw = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    raw.set(src.subarray(y * rowBytes, y * rowBytes + stride), y * (stride + 1) + 1);
  }
  const ihdr = new Uint8Array(13);
  writeUint32(ihdr, 0, width);
  writeUint32(ihdr, 4, height);
  ihdr[8] = 1;
  ihdr[9] = 0;
  const idat = zlibStore(raw);
  const chunks = [
    pngSignature(),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", new Uint8Array(0)),
  ];
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const part of chunks) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function encodePackedPngDataUrl(frame: PackedFrame): string {
  return `data:image/png;base64,${bytesToBase64(encodePackedPng(frame))}`;
}

function pngSignature(): Uint8Array {
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  writeUint32(out, 0, data.length);
  out[4] = type.charCodeAt(0);
  out[5] = type.charCodeAt(1);
  out[6] = type.charCodeAt(2);
  out[7] = type.charCodeAt(3);
  out.set(data, 8);
  const crcSrc = out.subarray(4, 8 + data.length);
  writeUint32(out, 8 + data.length, crc32(crcSrc));
  return out;
}

function zlibStore(data: Uint8Array): Uint8Array {
  const blocks: Uint8Array[] = [];
  let offset = 0;
  while (offset < data.length || offset === 0 && data.length === 0) {
    const size = Math.min(65535, data.length - offset);
    const last = offset + size >= data.length;
    const block = new Uint8Array(5 + size);
    block[0] = last ? 1 : 0;
    block[1] = size & 0xff;
    block[2] = (size >> 8) & 0xff;
    block[3] = (~size) & 0xff;
    block[4] = ((~size) >> 8) & 0xff;
    block.set(data.subarray(offset, offset + size), 5);
    blocks.push(block);
    offset += size;
    if (data.length === 0) break;
  }
  const bodyLen = blocks.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(2 + bodyLen + 4);
  out[0] = 0x78;
  out[1] = 0x01;
  let at = 2;
  for (const block of blocks) {
    out.set(block, at);
    at += block.length;
  }
  writeUint32(out, at, adler32(data));
  return out;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1, b = 0;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function writeUint32(target: Uint8Array, offset: number, value: number): void {
  target[offset] = (value >>> 24) & 0xff;
  target[offset + 1] = (value >>> 16) & 0xff;
  target[offset + 2] = (value >>> 8) & 0xff;
  target[offset + 3] = value & 0xff;
}

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += alphabet[(n >> 18) & 63] + alphabet[(n >> 12) & 63];
    out += i + 1 < bytes.length ? alphabet[(n >> 6) & 63] : "=";
    out += i + 2 < bytes.length ? alphabet[n & 63] : "=";
  }
  return out;
}
