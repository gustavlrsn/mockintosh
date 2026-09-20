import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { initBuiltinFonts, requireFont } from "../packages/ui/src/fonts/registry";
import { getGlyphIndexForChar, getGlyphPixel, getGlyphWidth } from "../packages/ui/src/fonts/font";
import { measureText } from "../packages/ui/src/fonts/bridge";

initBuiltinFonts();
const font = requireFont("pixel");
const lines = [
  "Geist Pixel",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789 $€@?",
];
const pad = 4;
const gap = 4;
const width = Math.max(...lines.map((t) => measureText(t, "pixel"))) + pad * 2;
const height = pad * 2 + lines.length * font.glyphHeight + (lines.length - 1) * gap;
const bits = new Uint8Array(width * height);

let y = pad;
for (const text of lines) {
  let x = pad;
  for (const ch of text) {
    const ord = getGlyphIndexForChar(font, ch);
    const w = getGlyphWidth(font, ord);
    for (let gy = 0; gy < font.glyphHeight; gy++) {
      for (let gx = 0; gx < w; gx++) {
        if (getGlyphPixel(font, ord, gx, gy)) bits[(y + gy) * width + x + gx] = 1;
      }
    }
    x += w + font.spacing;
  }
  y += font.glyphHeight + gap;
}

const scale = 3;
const rgba = Buffer.alloc(width * height * 4);
for (let i = 0; i < bits.length; i++) {
  const v = bits[i] ? 0 : 255;
  rgba[i * 4] = v;
  rgba[i * 4 + 1] = v;
  rgba[i * 4 + 2] = v;
  rgba[i * 4 + 3] = 255;
}

const out = resolve("/tmp/geist-pixel-preview.png");
await writeFile(
  out,
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(width * scale, height * scale, { kernel: "nearest" })
    .png()
    .toBuffer(),
);
console.log(`${out} ${width}×${height} cell ${font.maxWidth}×${font.glyphHeight}`);
