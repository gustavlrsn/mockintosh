#!/usr/bin/env npx tsx
/**
 * Fetch one native 1-bit ryOS PNG, pack it as defineSprite, append to
 * src/os/sprites/icons.ts. No PNG is written into the repo.
 *
 *   npm run icons:import -- "system-7/system/system-trash-system.png" --key icon/trash
 */
import { readFile } from "fs/promises";
import { flagString, parseArgs } from "./icons/args";
import { pngBufferToSprite } from "./icons/convert";
import { fetchIconPng } from "./icons/fetchIcon";
import {
  appendIconToModule,
  constNameForKey,
  parseIconEntries,
  slugKey,
  uniqueConst,
  uniqueKey,
} from "./icons/iconsModule";
import { loadCatalog } from "./icons/catalog";
import { ICONS_MODULE_PATH } from "./icons/paths";

function usage(): never {
  console.error(`Usage: npm run icons:import -- <era/path.png> [--key icon/name] [--from <png-path>]

Writes a defineSprite() into src/os/sprites/icons.ts. Does not add files under public/.`);
  process.exit(2);
}

async function main(): Promise<void> {
  const { rest, flags } = parseArgs(process.argv.slice(2));
  if (rest.length === 0 || flags.help) usage();
  const file = rest.join(" ");

  const catalog = loadCatalog();
  const record = catalog.find((icon) => icon.file === file);
  if (!record && !flagString(flags, "from")) {
    throw new Error(
      `Unknown catalog file ${JSON.stringify(file)}. Run icons:find first and pass the exact path.`
    );
  }

  const png = flagString(flags, "from")
    ? await readFile(flagString(flags, "from")!)
    : await fetchIconPng(file);
  const sprite = await pngBufferToSprite(png, "threshold");

  const existing = parseIconEntries(await readFile(ICONS_MODULE_PATH, "utf8"));
  const takenKeys = new Set(existing.map((e) => e.key));
  const takenConsts = new Set(existing.map((e) => e.constName));

  const preferredKey =
    flagString(flags, "key") ?? `icon/${slugKey(record?.name ?? "", file)}`;
  const key = uniqueKey(preferredKey, takenKeys);
  if (key !== preferredKey) {
    console.error(`Key ${preferredKey} is taken; using ${key}`);
  }
  const constName = uniqueConst(constNameForKey(key), takenConsts);

  await appendIconToModule({
    key,
    constName,
    sprite,
    sourceFile: file,
    mode: "threshold",
  });

  console.log(`Imported ${file}`);
  console.log(`  key:   ${key}`);
  console.log(`  const: ${constName}`);
  console.log(`  size:  ${sprite.width}×${sprite.height}`);
  console.log(`  file:  ${ICONS_MODULE_PATH}`);
  console.log(`Use as <image src="${key}"> or os.sprites.get("${key}").`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
