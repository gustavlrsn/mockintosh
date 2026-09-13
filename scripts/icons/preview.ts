import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { pngBufferToSprite, spriteToPreviewPng, isWashout } from "./convert";
import { fetchIconPng } from "./fetchIcon";
import { slugKey } from "./iconsModule";
import { previewRoot } from "./paths";
import type { ConvertMode, SearchHit } from "./types";

export interface PreviewResult {
  index: number;
  file: string;
  name: string;
  collection: string;
  category: string;
  description: string;
  score: number;
  colorPng: string;
  bitPng: string;
  washout: boolean;
  suggestedKey: string;
}

function sessionDir(query: string): string {
  const slug = query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "search";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return join(previewRoot(), `${slug}-${stamp}`);
}

function safeFileStem(file: string): string {
  return file.replace(/[/\\]/g, "_").replace(/\.png$/i, "");
}

export async function writeSearchPreviews(
  query: string,
  hits: SearchHit[],
  mode: ConvertMode = "threshold"
): Promise<{ dir: string; results: PreviewResult[] }> {
  const dir = sessionDir(query);
  await mkdir(dir, { recursive: true });
  const results: PreviewResult[] = [];
  for (let i = 0; i < hits.length; i++) {
    const { icon, score } = hits[i];
    const n = String(i + 1).padStart(2, "0");
    const stem = safeFileStem(icon.file);
    const colorPng = "";
    const bitPng = join(dir, `${n}-${stem}.1bit.png`);
    const png = await fetchIconPng(icon.file);
    const sprite = await pngBufferToSprite(png, mode);
    await spriteToPreviewPng(sprite, bitPng);
    const washout = isWashout(sprite);
    hits[i].washout = washout;
    results.push({
      index: i + 1,
      file: icon.file,
      name: icon.name,
      collection: icon.collection,
      category: icon.category,
      description: icon.description,
      score,
      colorPng,
      bitPng,
      washout,
      suggestedKey: `icon/${slugKey(icon.name, icon.file)}`,
    });
  }
  await writeFile(join(dir, "results.json"), JSON.stringify({ query, mode, results }, null, 2));
  return { dir, results };
}
