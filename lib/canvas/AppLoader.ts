import { ResourceManager } from "../toolbox/ResourceManager";
import { Sprite } from "./BitCanvas";
import { registerApp, getApp, type SolidApp } from "../../src/os/apps";

export interface AppManifest {
  id: string;
  title: string;
  description: string;
  icon: string;
  author: string;
  version: string;
  sdk: string;
  permissions: string[];
  entry: string;
}

interface AppModule {
  default: SolidApp<any>;
  sprites?: Record<string, Sprite>;
}

export class AppLoader {
  private spriteRegistry: ResourceManager;
  private loaded: Set<string> = new Set();

  constructor(spriteRegistry: ResourceManager) {
    this.spriteRegistry = spriteRegistry;
  }

  async load(manifest: AppManifest): Promise<SolidApp<any>> {
    if (this.loaded.has(manifest.id)) {
      const existing = getApp(manifest.id);
      if (existing) return existing;
    }

    const module: AppModule = await import(/* @vite-ignore */ manifest.entry);

    if (module.sprites && typeof module.sprites === "object") {
      this.spriteRegistry.registerAll(module.sprites);
    }

    const app = module.default;
    if (!app || typeof app !== "object") {
      throw new Error(`Invalid app bundle for "${manifest.id}": no default export`);
    }
    if (!app.id || typeof app.Component !== "function") {
      throw new Error(
        `Invalid app bundle for "${manifest.id}": expected defineApp({ Component })`
      );
    }
    if (!app.title || !app.icon || !app.defaultSize) {
      throw new Error(
        `Invalid app bundle for "${manifest.id}": missing title, icon, or defaultSize`
      );
    }

    registerApp(app);
    this.loaded.add(manifest.id);
    return app;
  }

  async loadAll(manifests: AppManifest[]): Promise<void> {
    const results = await Promise.allSettled(manifests.map((m) => this.load(m)));
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "rejected") {
        console.error(`[AppLoader] Failed to load "${manifests[i].id}":`, result.reason);
      }
    }
  }

  isLoaded(appId: string): boolean {
    return this.loaded.has(appId);
  }
}
