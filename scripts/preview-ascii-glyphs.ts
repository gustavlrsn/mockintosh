/**
 * Preview the Photo Booth ASCII glyph set as a scaled 1-bit atlas.
 *
 *   npx tsx scripts/preview-ascii-glyphs.ts [--out path.png]
 *
 * In Photo Booth: View → Character Set.
 */

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import {
  ASCII_TILE,
  listAsciiGlyphs,
  renderAsciiGlyphAtlas,
} from "../packages/ui/src/asciiDither";

const args = process.argv.slice(2);
const outArg = args.includes("--out") ? args[args.indexOf("--out") + 1] : null;
const outPath = resolve(outArg ?? "/tmp/ascii-glyphs.png");

const glyphs = listAsciiGlyphs();
const cols = 16;
const gap = 1;
const rows = Math.ceil(glyphs.length / cols);
const width = cols * (ASCII_TILE + gap) - gap;
const height = rows * (ASCII_TILE + gap) - gap;
const bits = renderAsciiGlyphAtlas(width, height);

const scale = 8;
const rgba = Buffer.alloc(width * height * 4);
for (let i = 0; i < bits.length; i++) {
  const v = bits[i] ? 0 : 255;
  const o = i * 4;
  rgba[o] = v;
  rgba[o + 1] = v;
  rgba[o + 2] = v;
  rgba[o + 3] = 255;
}

await writeFile(
  outPath,
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(width * scale, height * scale, { kernel: "nearest" })
    .png()
    .toBuffer(),
);

console.log(`${glyphs.length} glyphs (${ASCII_TILE}×${ASCII_TILE}), ${cols}×${rows} atlas`);
console.log(outPath);
