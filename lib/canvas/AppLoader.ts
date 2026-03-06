import { SpriteRegistry } from "./SpriteRegistry";
import { AppRegistry, SystemApp } from "./AppRegistry";
import { Sprite } from "./BitCanvas";

/**
 * Metadata stored in MockFS for an installed third-party app.
 * This is what gets persisted so the app can be re-loaded on page reload.
 */
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

/**
 * The expected shape of a third-party app's ESM bundle exports.
 */
interface AppModule {
  default: SystemApp;
  sprites?: Record<string, Sprite>;
}

/**
 * Loads third-party app ESM bundles at runtime, registers their sprites,
 * validates the app export, and registers the app with the AppRegistry.
 */
export class AppLoader {
  private spriteRegistry: SpriteRegistry;
  private appRegistry: AppRegistry;
  private loaded: Set<string> = new Set();

  constructor(spriteRegistry: SpriteRegistry, appRegistry: AppRegistry) {
    this.spriteRegistry = spriteRegistry;
    this.appRegistry = appRegistry;
  }

  /**
   * Load a third-party app from a remote ESM bundle URL.
   *
   * 1. Dynamically imports the module
   * 2. Registers any app-owned sprites into the global SpriteRegistry
   * 3. Validates the default export has the required App shape
   * 4. Registers the app with AppRegistry
   *
   * Returns the loaded app, or throws if the bundle is invalid.
   */
  async load(manifest: AppManifest): Promise<SystemApp> {
    if (this.loaded.has(manifest.id)) {
      const existing = this.appRegistry.get(manifest.id);
      if (existing) return existing;
    }

    const module: AppModule = await import(/* @vite-ignore */ manifest.entry);

    if (module.sprites && typeof module.sprites === "object") {
      this.spriteRegistry.registerAll(module.sprites);
    }

    const app = module.default;
    if (!app || typeof app !== "object") {
      throw new Error(
        `Invalid app bundle for "${manifest.id}": no default export`
      );
    }
    if (!app.id || typeof app.id !== "string") {
      throw new Error(
        `Invalid app bundle for "${manifest.id}": missing or invalid "id"`
      );
    }
    if (typeof app.render !== "function") {
      throw new Error(
        `Invalid app bundle for "${manifest.id}": missing "render" function`
      );
    }
    if (!app.title || !app.icon || !app.defaultSize) {
      throw new Error(
        `Invalid app bundle for "${manifest.id}": missing required fields (title, icon, defaultSize)`
      );
    }

    this.appRegistry.register(app);
    this.loaded.add(manifest.id);

    return app;
  }

  /**
   * Load multiple apps in parallel. Logs errors for individual failures
   * without stopping the batch.
   */
  async loadAll(manifests: AppManifest[]): Promise<void> {
    const results = await Promise.allSettled(
      manifests.map((m) => this.load(m))
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "rejected") {
        console.error(
          `[AppLoader] Failed to load "${manifests[i].id}":`,
          result.reason
        );
      }
    }
  }

  /** Check if an app has already been loaded. */
  isLoaded(appId: string): boolean {
    return this.loaded.has(appId);
  }
}
