import { encodeQR as encode } from "@paulmillr/qr";
import type { Sprite } from "@mockintosh/ui";

/** Encode `text` as a 1-bit sprite (black modules = 1). */
export function encodeQR(text: string): Sprite {
  const raw = encode(text, "raw") as Record<number, boolean[]>;
  const size = Object.keys(raw).length;
  const data = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    const row = raw[y];
    for (let x = 0; x < size; x++) data[y * size + x] = row[x] ? 1 : 0;
  }
  return { width: size, height: size, data };
}
