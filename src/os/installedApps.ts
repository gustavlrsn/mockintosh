/**
 * Installed third-party apps live in the file system: each is a `MIME.app`
 * file in the Applications folder whose body is the `AppManifest`. Opening
 * one from the Finder launches the app; trashing it uninstalls.
 *
 * Loading the code behind a manifest needs `Platform.loadModule`; the
 * `AppInstaller` wraps it and is only offered (`OSServices.installer`) on
 * platforms that have it.
 */
import { MIME, type FileSystem, type FSFile } from "@mockintosh/fs";
import type { AppManifest, Capability } from "@mockintosh/sdk";
import type { Sprite } from "@mockintosh/ui";
import type { ModuleLoader } from "../platform/types";
import { getApp, registerApp, registerUnavailableApp, type SolidApp } from "./apps";
import { missingCapabilities, type CapabilitySet } from "./capabilities";
import type { SpriteRegistry } from "./sprites/registry";

/**
 * What an app bundle's entry module must export. A `defineApp` result is
 * structurally the OS's `SolidApp`; the loader only checks shape at runtime.
 */
interface AppModule {
  default: SolidApp<any>;
  sprites?: Record<string, Sprite>;
}

export interface AppInstaller {
  /** Load an app's bundle and register it; then record the install in the file system. */
  install(manifest: AppManifest): Promise<void>;
  /** Load every installed app this platform can run; record the rest as unavailable. */
  loadInstalled(): Promise<void>;
}

export interface AppInstallerOptions {
  fs: FileSystem;
  sprites: SpriteRegistry;
  capabilities: CapabilitySet;
  loadModule: ModuleLoader;
}

export function createAppInstaller(options: AppInstallerOptions): AppInstaller {
  const { fs, sprites, capabilities, loadModule } = options;
  const loaded = new Set<string>();

  async function load(manifest: AppManifest): Promise<SolidApp<any>> {
    if (loaded.has(manifest.id)) {
      const existing = getApp(manifest.id);
      if (existing) return existing;
    }

    const module = validateModule(manifest.id, await loadModule(manifest.entry));
    if (module.sprites) sprites.registerAll(module.sprites);
    registerApp(module.default);
    loaded.add(manifest.id);
    return module.default;
  }

  return {
    async install(manifest) {
      await load(manifest);
      await writeManifest(fs, manifest);
    },

    async loadInstalled() {
      const loadable: AppManifest[] = [];
      for (const manifest of await readInstalledManifests(fs)) {
        const missing: Capability[] = missingCapabilities(manifest.requires, capabilities);
        if (missing.length === 0) loadable.push(manifest);
        else registerUnavailableApp({ id: manifest.id, title: manifest.title, missing });
      }
      const results = await Promise.allSettled(loadable.map(load));
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          console.error(`Failed to load installed app "${loadable[i].id}":`, result.reason);
        }
      });
    },
  };
}

export function validateModule(appId: string, module: unknown): AppModule {
  const m = module as Partial<AppModule> | null;
  const app = m?.default;
  if (!app || typeof app !== "object") {
    throw new Error(`Invalid app bundle for "${appId}": no default export`);
  }
  if (app.id !== appId || typeof app.Component !== "function") {
    throw new Error(`Invalid app bundle for "${appId}": expected defineApp({ Component })`);
  }
  if (!app.title || !app.icon || !app.defaultSize) {
    throw new Error(`Invalid app bundle for "${appId}": missing title, icon, or defaultSize`);
  }
  return {
    default: app,
    sprites: m.sprites && typeof m.sprites === "object" ? m.sprites : undefined,
  };
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
