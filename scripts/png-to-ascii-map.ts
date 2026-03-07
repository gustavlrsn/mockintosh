/**
 * Convert a 1-bit reference PNG to an ASCII map for pixel-perfect layout.
 *
 * Usage: npx tsx scripts/png-to-ascii-map.ts path/to/image.png [--out file.txt]
 *
 * Output: one line per row, '#' = black/dark pixel, ' ' (space) = white/light.
 * Use this to match classic Mac button (or other UI) layout exactly:
 * - Paste the output into a .txt file and share it, or
 * - Use with fromGrid(width, height, rows) for a sprite ('#' = black, ' ' = white).
 *
 * If the PNG is 2x retina, run on the PNG as-is and note the dimensions;
 * we can then sample every other pixel if we need 1x layout.
 */

import sharp from "sharp";
import { writeFile } from "fs/promises";
import { join } from "path";

const args = process.argv.slice(2);
const pathArg = args.find((a) => !a.startsWith("--"));
const outArg = args.includes("--out") ? args[args.indexOf("--out") + 1] : null;

if (!pathArg) {
  console.error(
    "Usage: npx tsx scripts/png-to-ascii-map.ts <image.png> [--out file.txt]"
  );
  process.exit(1);
}

async function main() {
  const { data, info } = await sharp(pathArg)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rows: string[] = [];

  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3] ?? 255;
      const lum = a < 128 ? 255 : (r + g + b) / 3;
      row += lum < 128 ? "#" : " ";
    }
    rows.push(row);
  }

  const ascii = rows.join("\n");
  console.log(`# ${width}x${height}`);
  console.log(ascii);

  if (outArg) {
    const outPath = join(process.cwd(), outArg);
    await writeFile(outPath, `# ${width}x${height}\n${ascii}\n`, "utf-8");
    console.error(`Wrote ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
