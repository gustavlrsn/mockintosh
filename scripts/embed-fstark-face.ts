import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../apps/photobooth");
const orig = readFileSync(join(dir, "fixtures/fstark-original.png")).toString("base64");
const exp = readFileSync(join(dir, "fixtures/fstark-expected.png")).toString("base64");

function wrap(name: string, s: string): string {
  const parts: string[] = [];
  for (let i = 0; i < s.length; i += 120) parts.push(s.slice(i, i + 120));
  return `export const ${name} =\n  "${parts.join('" +\n  "')}";`;
}

writeFileSync(
  join(dir, "fstarkFace.ts"),
  [
    "/** Bundled fstark 200×200 reference pair for the ASCII compare window. */",
    wrap("FSTARK_ORIGINAL_PNG", orig),
    "",
    wrap("FSTARK_EXPECTED_PNG", exp),
    "",
  ].join("\n"),
);

console.log(`wrote fstarkFace.ts (orig ${orig.length} chars, exp ${exp.length} chars)`);
