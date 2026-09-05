import { AppLoader, type AppManifest } from "../../lib/canvas/AppLoader";
import type { ResourceManager } from "../../lib/toolbox/ResourceManager";

const STORAGE_KEY = "mockintosh:installed-apps";

let loader: AppLoader | null = null;

export function initInstalledApps(sprites: ResourceManager): AppLoader {
  loader = new AppLoader(sprites);
  return loader;
}

export function getAppLoader(): AppLoader {
  if (!loader) throw new Error("AppLoader not initialized");
  return loader;
}

export function readInstalledManifests(): AppManifest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppManifest[]) : [];
  } catch {
    return [];
  }
}

export function writeInstalledManifests(manifests: AppManifest[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manifests));
}

export async function installManifest(manifest: AppManifest): Promise<void> {
  await getAppLoader().load(manifest);
  const existing = readInstalledManifests().filter((m) => m.id !== manifest.id);
  writeInstalledManifests([...existing, manifest]);
}

export async function loadInstalledApps(): Promise<void> {
  await getAppLoader().loadAll(readInstalledManifests());
}
