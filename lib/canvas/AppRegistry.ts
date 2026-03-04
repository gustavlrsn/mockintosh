import { AppBuilder } from "./AppBuilder";
import { AppContext } from "./AppContext";
import { OSEvent } from "./EventManager";
import { MenubarDefinition } from "./ui/drawMenubar";

export interface WindowSize {
  width: number;
  height: number;
}

export interface NativeApp {
  id: string;
  title: string;
  icon: string;
  defaultSize: { width: number; height: number };
  scrollable?: boolean;
  resizable?: boolean;
  minSize?: { width: number; height: number };
  render: (app: AppBuilder, ctx: AppContext, props: any) => void;
  onEvent?: (
    app: AppBuilder,
    event: OSEvent,
    props: any,
    size: WindowSize
  ) => void;
  onOpen?: (app: AppBuilder, props: any) => void;
  onClose?: (app: AppBuilder) => void;
  getMenubar?: (app: AppBuilder, props: any) => MenubarDefinition[];
  /** For apps that need to report their content height for scrolling */
  getContentHeight?: (app: AppBuilder, props: any, size: WindowSize) => number;
  /** For apps that need to report their content width for horizontal scrolling */
  getContentWidth?: (app: AppBuilder, props: any, size: WindowSize) => number;
  /** Return an array of strings displayed in the info bar below the title bar */
  getInfoBar?: (app: AppBuilder, props: any) => string[] | null;
}

export interface AppInstance {
  appId: string;
  app: NativeApp;
  builder: AppBuilder;
  props: any;
}

/**
 * Registry for native (trusted) apps.
 */
export class AppRegistry {
  private apps: Map<string, NativeApp> = new Map();
  private instances: Map<string, AppInstance> = new Map();

  register(app: NativeApp) {
    this.apps.set(app.id, app);
  }

  get(id: string): NativeApp | undefined {
    return this.apps.get(id);
  }

  getAll(): NativeApp[] {
    return Array.from(this.apps.values());
  }

  /**
   * Create an app instance (when a window is opened).
   */
  createInstance(
    appId: string,
    windowId: string,
    props: any = {}
  ): AppInstance | null {
    const app = this.apps.get(appId);
    if (!app) return null;

    const builder = new AppBuilder();
    const instance: AppInstance = { appId, app, builder, props };
    this.instances.set(windowId, instance);

    if (app.onOpen) {
      app.onOpen(builder, props);
    }

    return instance;
  }

  getInstance(windowId: string): AppInstance | undefined {
    return this.instances.get(windowId);
  }

  /**
   * Destroy an app instance (when a window is closed).
   */
  destroyInstance(windowId: string) {
    const instance = this.instances.get(windowId);
    if (instance) {
      if (instance.app.onClose) {
        instance.app.onClose(instance.builder);
      }
      instance.builder.destroy();
      this.instances.delete(windowId);
    }
  }
}
