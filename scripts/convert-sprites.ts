import sharp from "sharp";
import { readdir, writeFile } from "fs/promises";
import { join, basename, extname } from "path";

const PUBLIC = join(import.meta.dirname!, "..", "public");
const OUT_DIR = join(import.meta.dirname!, "..", "lib", "canvas", "sprites");

interface SpriteGroup {
  dir: string;
  prefix: string;
  outFile: string;
}

const GROUPS: SpriteGroup[] = [
  { dir: join(PUBLIC, "icons"), prefix: "icon", outFile: "icons.ts" },
  { dir: join(PUBLIC, "cursors"), prefix: "cursor", outFile: "cursors.ts" },
];

const ROOT_SPRITES = ["eaten_apple.png", "user2.png", "microdesktop-disk.png"];

function toKey(prefix: string, filename: string): string {
  const name = basename(filename, extname(filename));
  return `${prefix}/${name}`;
}

async function pngToBase64Sprite(
  filepath: string
): Promise<{ width: number; height: number; b64: string }> {
  const { data, info } = await sharp(filepath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const totalPixels = width * height;
  const packedLen = Math.ceil(totalPixels / 4);
  const packed = new Uint8Array(packedLen);

  for (let i = 0; i < totalPixels; i++) {
    const ri = i * channels;
    const alpha = data[ri + 3];
    let val: number;
    if (alpha < 128) {
      val = 0b00; // transparent
    } else {
      const avg = (data[ri] + data[ri + 1] + data[ri + 2]) / 3;
      val = avg < 128 ? 0b10 : 0b01; // black : white
    }
    const byteIdx = i >> 2;
    const shift = 6 - (i & 3) * 2;
    packed[byteIdx] |= val << shift;
  }

  const b64 = Buffer.from(packed).toString("base64");
  return { width, height, b64 };
}

function escapeForTS(b64: string): string {
  return `"${b64}"`;
}

async function convertGroup(group: SpriteGroup): Promise<string> {
  const files = (await readdir(group.dir))
    .filter((f) => f.endsWith(".png"))
    .sort();

  const lines: string[] = [
    `import { Sprite } from "../BitCanvas";`,
    `import { defineSprite } from "../SpriteRegistry";`,
    ``,
  ];

  const entries: string[] = [];

  for (const file of files) {
    const filepath = join(group.dir, file);
    const { width, height, b64 } = await pngToBase64Sprite(filepath);
    const key = toKey(group.prefix, file);
    const constName = key
      .replace(/[/-]/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toUpperCase();
    lines.push(
      `const ${constName} = defineSprite(${width}, ${height}, ${escapeForTS(
        b64
      )});`
    );
    entries.push(`  "${key}": ${constName},`);
  }

  lines.push(``);
  lines.push(`export const ${group.prefix}Sprites: Record<string, Sprite> = {`);
  lines.push(...entries);
  lines.push(`};`);
  lines.push(``);

  return lines.join("\n");
}

async function convertRootSprites(): Promise<string> {
  const lines: string[] = [
    `import { Sprite } from "../BitCanvas";`,
    `import { defineSprite } from "../SpriteRegistry";`,
    ``,
  ];

  const entries: string[] = [];

  for (const file of ROOT_SPRITES) {
    const filepath = join(PUBLIC, file);
    const { width, height, b64 } = await pngToBase64Sprite(filepath);
    const key = basename(file, extname(file));
    const constName = key
      .replace(/[/-]/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toUpperCase();
    lines.push(
      `const ${constName} = defineSprite(${width}, ${height}, ${escapeForTS(
        b64
      )});`
    );
    entries.push(`  "${key}": ${constName},`);
  }

  lines.push(``);
  lines.push(`export const uiSprites: Record<string, Sprite> = {`);
  lines.push(...entries);
  lines.push(`};`);
  lines.push(``);

  return lines.join("\n");
}

async function main() {
  const { mkdir } = await import("fs/promises");
  await mkdir(OUT_DIR, { recursive: true });

  for (const group of GROUPS) {
    const source = await convertGroup(group);
    const outPath = join(OUT_DIR, group.outFile);
    await writeFile(outPath, source, "utf-8");
    console.log(`Wrote ${outPath}`);
  }

  const uiSource = await convertRootSprites();
  const uiPath = join(OUT_DIR, "ui.ts");
  await writeFile(uiPath, uiSource, "utf-8");
  console.log(`Wrote ${uiPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
