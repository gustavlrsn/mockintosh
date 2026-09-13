#!/usr/bin/env npx tsx
/**
 * Search the pinned ryOS native 1-bit catalog (ICN# / ics# / SICN) and write
 * previews under /tmp. Does not modify the repo.
 *
 *   npm run icons:find -- trash folder
 *   npm run icons:find -- document --category system --limit 6
 */
import { flagBool, flagNumber, flagString, parseArgs } from "./icons/args";
import { loadCatalog } from "./icons/catalog";
import { slugKey } from "./icons/iconsModule";
import { writeSearchPreviews } from "./icons/preview";
import { searchIcons } from "./icons/search";

function usage(): never {
  console.error(`Usage: npm run icons:find -- <query...> [--limit 8] [--category system]
                    [--no-preview] [--json]

Search native 1-bit icons from ryokun6/ryos (System 7 + Mac OS 8 ICN# / ics# / SICN).
Import a pick with: npm run icons:import -- "<era/path.png>" --key icon/name`);
  process.exit(2);
}

async function main(): Promise<void> {
  const { rest, flags } = parseArgs(process.argv.slice(2));
  if (rest.length === 0 || flags.help) usage();

  const query = rest.join(" ");
  const limit = flagNumber(flags, "limit", 8);
  const category = flagString(flags, "category");
  const json = flagBool(flags, "json");
  const preview = !flagBool(flags, "no-preview");

  const hits = searchIcons(loadCatalog(), query, { limit, category });
  if (hits.length === 0) {
    console.error(`No icons matched ${JSON.stringify(query)}. Try broader terms.`);
    process.exit(1);
  }

  const payload = preview ? await writeSearchPreviews(query, hits, "threshold") : null;

  if (json) {
    console.log(
      JSON.stringify(
        {
          query,
          dir: payload?.dir ?? null,
          results: payload?.results ?? hits.map((hit, i) => ({
            index: i + 1,
            file: hit.icon.file,
            name: hit.icon.name,
            collection: hit.icon.collection,
            category: hit.icon.category,
            description: hit.icon.description,
            score: hit.score,
          })),
        },
        null,
        2
      )
    );
    return;
  }

  if (payload) console.log(`Previews: ${payload.dir}\n`);
  const rows = payload?.results ?? hits.map((hit, i) => ({
    index: i + 1,
    file: hit.icon.file,
    name: hit.icon.name,
    collection: hit.icon.collection,
    category: hit.icon.category,
    description: hit.icon.description,
    score: hit.score,
    suggestedKey: `icon/${slugKey(hit.icon.name, hit.icon.file)}`,
    bitPng: "",
  }));

  for (const row of rows) {
    console.log(`${row.index}. ${row.name || row.file}  [${row.collection}/${row.category}]  score=${row.score}`);
    console.log(`   ${row.file}`);
    if (row.description) console.log(`   ${row.description}`);
    if (row.bitPng) console.log(`   preview: ${row.bitPng}`);
    console.log(`   import: npm run icons:import -- "${row.file}" --key ${row.suggestedKey}`);
    console.log("");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
