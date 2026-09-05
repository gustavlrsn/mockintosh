/**
 * System preferences — a reactive store persisted as a JSON file in
 * `System Folder/Preferences`, alongside the per-app storage folders.
 *
 * Applying a preference (e.g. switching the color mode) happens here, so the
 * Control Panel, the boot sequence and any other caller behave identically.
 */
import { createStore } from "solid-js/store";
import { MIME, type FileSystem } from "@mockintosh/fs";
import { getDefaultColorMode, setColorMode, type ColorMode } from "../../lib/canvas/ColorSystem";

export interface SystemPreferences {
  colorMode: ColorMode;
}

const PREFERENCES_FILE = "System Preferences";
/** Pre-FS location at the OPFS root; migrated on first boot and then removed. */
const LEGACY_OPFS_FILE = "mockintosh-system-preferences.json";

const [preferences, setPreferences] = createStore<SystemPreferences>({
  colorMode: getDefaultColorMode(),
});

/** Reactive read of the current preferences. */
export const systemPreferences: SystemPreferences = preferences;

function sanitize(raw: unknown): Partial<SystemPreferences> {
  const out: Partial<SystemPreferences> = {};
  const p = raw as Partial<SystemPreferences> | null;
  if (p?.colorMode === "colors" || p?.colorMode === "monochrome") out.colorMode = p.colorMode;
  return out;
}

function apply(prefs: SystemPreferences): void {
  setColorMode(prefs.colorMode);
}

async function persist(fs: FileSystem): Promise<void> {
  const folder = fs.locate("preferences");
  if (!folder) return;
  await fs.writeJSON(folder.id, PREFERENCES_FILE, { ...preferences }, { type: MIME.json });
}

/** Load preferences from the file system (migrating the old OPFS-root file) and apply them. */
export async function loadSystemPreferences(fs: FileSystem): Promise<void> {
  const folder = fs.locate("preferences");
  const file = folder ? fs.child(folder.id, PREFERENCES_FILE) : undefined;
  let stored: Partial<SystemPreferences> = {};
  if (file?.kind === "file") {
    stored = sanitize(await fs.readJSON<unknown>(file.id));
  } else {
    const legacy = await readLegacyPreferences();
    if (legacy) {
      stored = legacy;
      setPreferences(stored);
      await persist(fs);
    }
  }
  setPreferences(stored);
  apply(preferences);
}

/** Change preferences: updates the store, applies them, and persists. */
export async function updateSystemPreferences(
  fs: FileSystem,
  patch: Partial<SystemPreferences>
): Promise<void> {
  setPreferences(patch);
  apply(preferences);
  await persist(fs);
}

async function readLegacyPreferences(): Promise<Partial<SystemPreferences> | null> {
  if (typeof navigator === "undefined" || typeof navigator.storage?.getDirectory !== "function") return null;
  try {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(LEGACY_OPFS_FILE);
    const parsed = sanitize(JSON.parse(await (await handle.getFile()).text()));
    await root.removeEntry(LEGACY_OPFS_FILE);
    return parsed;
  } catch {
    return null;
  }
}
