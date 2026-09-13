#!/usr/bin/env npx tsx
/**
 * Rebuild the pinned slim catalog from ryOS System 7 / Mac OS 8 catalog.json
 * (native 1-bit ICN# / ics# / SICN only).
 *
 *   npm run icons:refresh-catalog
 */
import { refreshCatalog } from "./icons/catalog";
import { CATALOG_PATH } from "./icons/paths";

async function main(): Promise<void> {
  const { count, path } = await refreshCatalog();
  console.log(`Wrote ${count} icons to ${path}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
