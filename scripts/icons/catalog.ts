import { mkdir, writeFile } from "fs/promises";
import { existsSync, readFileSync } from "fs";
import { dirname } from "path";
import { gunzipSync, gzipSync } from "zlib";
import { CATALOG_PATH } from "./paths";
import {
  CATALOG_FIELDS,
  NATIVE_1BIT_KINDS,
  UPSTREAM_CATALOG_ROOT,
  UPSTREAM_ERAS,
  UPSTREAM_REF,
  UPSTREAM_REPO,
  type CatalogFile,
  type CatalogRow,
  type IconRecord,
} from "./types";

const FETCH_HEADERS = {
  "User-Agent": "mockintosh-icon-archive",
  Accept: "application/json",
};

export function rowToRecord(row: CatalogRow): IconRecord {
  return {
    file: row[0],
    name: row[1],
    collection: row[2],
    category: row[3],
    themes: row[4] ?? [],
    vibes: row[5] ?? [],
    description: row[6] ?? "",
  };
}

export function recordToRow(icon: IconRecord): CatalogRow {
  return [
    icon.file,
    icon.name,
    icon.collection,
    icon.category,
    icon.themes,
    icon.vibes,
    icon.description,
  ];
}

export function loadCatalog(path = CATALOG_PATH): IconRecord[] {
  if (!existsSync(path)) {
    throw new Error(
      `Icon catalog missing at ${path}. Run \`npm run icons:refresh-catalog\`.`
    );
  }
  const parsed = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8")) as CatalogFile;
  if (!Array.isArray(parsed.icons)) {
    throw new Error(`Invalid icon catalog at ${path}: missing icons array`);
  }
  return parsed.icons.map(rowToRecord);
}

export interface RyosEntry {
  type?: string;
  name?: string;
  sourceFile?: string;
  sourceResource?: string;
  catalogPath?: string;
  width?: number;
  height?: number;
}

export function resourceKind(sourceResource: string): string {
  return decodeURIComponent(sourceResource.split("/")[0] || "");
}

export function isNative1Bit(sourceResource: string): boolean {
  return NATIVE_1BIT_KINDS.has(resourceKind(sourceResource));
}

export function catalogFileFromPath(catalogPath: string): string {
  const prefix = "/public/resources/classic-mac-icon-catalogs/";
  return catalogPath.startsWith(prefix) ? catalogPath.slice(prefix.length) : catalogPath.replace(/^\//, "");
}

export function slimRyosEntries(era: string, entries: RyosEntry[]): IconRecord[] {
  const icons: IconRecord[] = [];
  for (const entry of entries) {
    const resource = entry.sourceResource || "";
    if (!isNative1Bit(resource) || !entry.catalogPath) continue;
    const kind = resourceKind(resource);
    const type = entry.type || "";
    icons.push({
      file: catalogFileFromPath(entry.catalogPath),
      name: entry.name || "",
      collection: era,
      category: type,
      themes: [kind, type].filter(Boolean),
      vibes: [],
      description: [entry.sourceFile, decodeURIComponent(resource)].filter(Boolean).join(" "),
    });
  }
  return icons;
}

export function encodeCatalog(icons: IconRecord[]): Buffer {
  const file: CatalogFile = {
    source: `https://github.com/${UPSTREAM_REPO}`,
    ref: UPSTREAM_REF,
    count: icons.length,
    fields: CATALOG_FIELDS,
    icons: icons.map(recordToRow),
  };
  return gzipSync(Buffer.from(JSON.stringify(file), "utf8"), { level: 9 });
}

export async function refreshCatalog(dest = CATALOG_PATH): Promise<{ count: number; path: string }> {
  const icons: IconRecord[] = [];
  for (const era of UPSTREAM_ERAS) {
    const url = `${UPSTREAM_CATALOG_ROOT}/${era}/catalog.json`;
    const response = await fetch(url, { headers: FETCH_HEADERS });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const body = (await response.json()) as { entries?: RyosEntry[] };
    if (!Array.isArray(body.entries)) {
      throw new Error(`${url} has no entries array`);
    }
    icons.push(...slimRyosEntries(era, body.entries));
  }
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, encodeCatalog(icons));
  return { count: icons.length, path: dest };
}
