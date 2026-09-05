/**
 * Installed third-party apps live in the file system: each is a `MIME.app`
 * file in the Applications folder whose body is the `AppManifest`. Opening
 * one from the Finder launches the app; trashing it uninstalls.
 */
import { MIME, type FileSystem, type FSFile } from "@mockintosh/fs";
import { AppLoader, type AppManifest } from "../../lib/canvas/AppLoader";
import type { ResourceManager } from "../../lib/toolbox/ResourceManager";

/** Pre-FS location of the manifests; migrated on first boot and then removed. */
const LEGACY_STORAGE_KEY = "mockintosh:installed-apps";

let loader: AppLoader | null = null;

export function initInstalledApps(sprites: ResourceManager): AppLoader {
  loader = new AppLoader(sprites);
  return loader;
}

export function getAppLoader(): AppLoader {
  if (!loader) throw new Error("AppLoader not initialized");
  return loader;
}

function manifestFiles(fs: FileSystem): FSFile[] {
  const apps = fs.locate("applications");
  if (!apps) return [];
  return fs.children(apps.id).filter((n): n is FSFile => n.kind === "file" && n.type === MIME.app);
}

function isManifest(v: unknown): v is AppManifest {
  const m = v as Partial<AppManifest> | null;
  return !!m && typeof m.id === "string" && typeof m.entry === "string" && typeof m.title === "string";
}

/** Manifests of every installed app (reactive: tracks the Applications folder). */
export async function readInstalledManifests(fs: FileSystem): Promise<AppManifest[]> {
  const parsed = await Promise.all(manifestFiles(fs).map((f) => fs.readJSON<unknown>(f.id)));
  return parsed.filter(isManifest);
}

/** The app id a manifest file installs, kept as an attribute so it can be read synchronously. */
function installedAppId(fs: FileSystem, file: FSFile): string | undefined {
  const id = fs.attributes(file.id).appId;
  return typeof id === "string" ? id : undefined;
}

/** Ids of installed apps (reactive) — what the App Store needs for its checkmarks. */
export function installedAppIds(fs: FileSystem): string[] {
  return manifestFiles(fs).flatMap((f) => installedAppId(fs, f) ?? []);
}

async function writeManifest(fs: FileSystem, manifest: AppManifest): Promise<FSFile> {
  const apps = fs.locate("applications");
  if (!apps) throw new Error("File system has no Applications folder");
  // Replace any earlier install of the same app, whatever it was named.
  for (const f of manifestFiles(fs)) {
    if (installedAppId(fs, f) === manifest.id && f.name !== manifest.title) await fs.remove(f.id);
  }
  return fs.writeJSON(apps.id, manifest.title, manifest, {
    type: MIME.app,
    attributes: { icon: manifest.icon, appId: manifest.id },
  });
}

export async function installManifest(fs: FileSystem, manifest: AppManifest): Promise<void> {
  await getAppLoader().load(manifest);
  await writeManifest(fs, manifest);
}

export async function loadInstalledApps(fs: FileSystem): Promise<void> {
  await migrateLegacyManifests(fs);
  await getAppLoader().loadAll(await readInstalledManifests(fs));
}

async function migrateLegacyManifests(fs: FileSystem): Promise<void> {
  if (typeof localStorage === "undefined") return;
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return;
  try {
    const manifests = (JSON.parse(raw) as unknown[]).filter(isManifest);
    for (const m of manifests) await writeManifest(fs, m);
  } catch (err) {
    console.error("Failed to migrate installed apps into the file system", err);
    return;
  }
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}
