import { join } from "path";

export const REPO_ROOT = join(import.meta.dirname!, "..", "..");
export const ICONS_MODULE_PATH = join(REPO_ROOT, "src", "os", "sprites", "icons.ts");
export const CATALOG_PATH = join(import.meta.dirname!, "data", "catalog.json.gz");

export function previewRoot(): string {
  return join(process.env.TMPDIR || "/tmp", "mockintosh-icons");
}
