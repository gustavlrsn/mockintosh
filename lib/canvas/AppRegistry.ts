import { AppBuilder } from "./AppBuilder";
import { WindowContext } from "../toolbox/WindowContext";
import { OSEvent } from "../toolbox/EventManager";
import type { MenubarDefinition } from "@mockintosh/sdk";

export interface WindowSize {
  width: number;
  height: number;
  contentOriginX?: number;
  contentOriginY?: number;
  /** When window has content top inset: height of the fixed strip. */
  contentTopInset?: number;
  /** Current scroll offset (for screen coord conversion when contentTopInset is set). */
  scrollY?: number;
  scrollX?: number;
}

// ---------------------------------------------------------------------------
// Single-window app
// ---------------------------------------------------------------------------

export interface SystemApp {
  id: string;
  title: string;
  icon: string;
  defaultSize: { width: number; height: number };
  windowKind?:
    | "document"
    | "dialog"
    | "alert"
    | "utility"
    | "desktop"
    | "presentation";
  scrollable?: boolean;
  resizable?: boolean;
  minSize?: { width: number; height: number };
  render: (app: AppBuilder, ctx: WindowContext, props: any) => void;
  onEvent?: (
    app: AppBuilder,
    event: OSEvent,
    props: any,
    size: WindowSize
  ) => void;
  onOpen?: (app: AppBuilder, props: any) => void;
  onClose?: (app: AppBuilder) => void;
  getMenubar?: (app: AppBuilder, props: any) => MenubarDefinition[];
  getContentHeight?: (app: AppBuilder, props: any, size: WindowSize) => number;
  getContentWidth?: (app: AppBuilder, props: any, size: WindowSize) => number;
  getContentTopInset?: (
    app: AppBuilder,
    props: any,
    size: WindowSize
  ) => number;
  getInfoBar?: (app: AppBuilder, props: any) => string[] | null;
}

export interface AppInstance {
  appId: string;
  app: SystemApp;
  builder: AppBuilder;
  props: any;
}

// ---------------------------------------------------------------------------
// Multi-window app — one app instance can own many windows + background layers
// ---------------------------------------------------------------------------

export interface MultiWindowSystemApp {
  id: string;
  title: string;
  icon: string;

  onStart?(app: AppBuilder): void;
  onStop?(app: AppBuilder): void;

  renderWindow(
    app: AppBuilder,
    win: AppBuilder,
    ctx: WindowContext,
    windowId: string,
    props: any
  ): void;

  onWindowEvent?(
    app: AppBuilder,
    win: AppBuilder,
    event: OSEvent,
    windowId: string,
    props: any,
    size: WindowSize
  ): void;

  onWindowOpen?(
    app: AppBuilder,
    win: AppBuilder,
    windowId: string,
    props: any
  ): void;

  onWindowClose?(app: AppBuilder, win: AppBuilder, windowId: string): void;

  getMenubar?(
    app: AppBuilder,
    win: AppBuilder,
    windowId: string,
    props: any
  ): MenubarDefinition[];

  getContentHeight?(
    app: AppBuilder,
    win: AppBuilder,
    windowId: string,
    props: any,
    size: WindowSize
  ): number;

  getContentTopInset?(
    app: AppBuilder,
    win: AppBuilder,
    windowId: string,
    props: any,
    size: WindowSize
  ): number;

  getContentWidth?(
    app: AppBuilder,
    win: AppBuilder,
    windowId: string,
    props: any,
    size: WindowSize
  ): number;

  getInfoBar?(
    app: AppBuilder,
    win: AppBuilder,
    windowId: string,
    props: any
  ): string[] | null;
}

interface MultiWindowSystemAppState {
  app: MultiWindowSystemApp;
  appBuilder: AppBuilder;
  windowBuilders: Map<string, { builder: AppBuilder; props: any }>;
}

export interface MultiWindowInstance {
  app: MultiWindowSystemApp;
  appBuilder: AppBuilder;
  winBuilder: AppBuilder;
  props: any;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export class AppRegistry {
  private apps: Map<string, SystemApp> = new Map();
  private instances: Map<string, AppInstance> = new Map();

  private multiApps: Map<string, MultiWindowSystemApp> = new Map();
  private multiStates: Map<string, MultiWindowSystemAppState> = new Map();

  // --- Single-window apps (unchanged) ---

  register(app: SystemApp) {
    this.apps.set(app.id, app);
  }

  get(id: string): SystemApp | undefined {
    return this.apps.get(id);
  }

  getAll(): SystemApp[] {
    return Array.from(this.apps.values());
  }

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

  // --- Multi-window apps ---

  registerMultiWindow(app: MultiWindowSystemApp) {
    this.multiApps.set(app.id, app);
  }

  startApp(appId: string): AppBuilder | null {
    const app = this.multiApps.get(appId);
    if (!app) return null;
    if (this.multiStates.has(appId)) {
      return this.multiStates.get(appId)!.appBuilder;
    }

    const appBuilder = new AppBuilder();
    const state: MultiWindowSystemAppState = {
      app,
      appBuilder,
      windowBuilders: new Map(),
    };
    this.multiStates.set(appId, state);

    if (app.onStart) {
      app.onStart(appBuilder);
    }

    return appBuilder;
  }

  stopApp(appId: string) {
    const state = this.multiStates.get(appId);
    if (!state) return;

    for (const [winId, entry] of state.windowBuilders) {
      if (state.app.onWindowClose) {
        state.app.onWindowClose(state.appBuilder, entry.builder, winId);
      }
      entry.builder.destroy();
    }
    state.windowBuilders.clear();

    if (state.app.onStop) {
      state.app.onStop(state.appBuilder);
    }
    state.appBuilder.destroy();
    this.multiStates.delete(appId);
  }

  createWindowForApp(
    appId: string,
    windowId: string,
    props: any = {}
  ): MultiWindowInstance | null {
    const state = this.multiStates.get(appId);
    if (!state) return null;

    const existing = state.windowBuilders.get(windowId);
    if (existing) {
      return {
        app: state.app,
        appBuilder: state.appBuilder,
        winBuilder: existing.builder,
        props: existing.props,
      };
    }

    const winBuilder = new AppBuilder();
    state.windowBuilders.set(windowId, { builder: winBuilder, props });

    if (state.app.onWindowOpen) {
      state.app.onWindowOpen(state.appBuilder, winBuilder, windowId, props);
    }

    return {
      app: state.app,
      appBuilder: state.appBuilder,
      winBuilder,
      props,
    };
  }

  destroyWindowForApp(appId: string, windowId: string) {
    const state = this.multiStates.get(appId);
    if (!state) return;

    const entry = state.windowBuilders.get(windowId);
    if (!entry) return;

    if (state.app.onWindowClose) {
      state.app.onWindowClose(state.appBuilder, entry.builder, windowId);
    }
    entry.builder.destroy();
    state.windowBuilders.delete(windowId);
  }

  getMultiWindowInstance(
    appId: string,
    windowId: string
  ): MultiWindowInstance | null {
    const state = this.multiStates.get(appId);
    if (!state) return null;

    const entry = state.windowBuilders.get(windowId);
    if (!entry) return null;

    return {
      app: state.app,
      appBuilder: state.appBuilder,
      winBuilder: entry.builder,
      props: entry.props,
    };
  }

  getMultiWindowApp(appId: string): MultiWindowSystemAppState | undefined {
    return this.multiStates.get(appId);
  }

  isMultiWindowApp(appId: string): boolean {
    return this.multiApps.has(appId);
  }
}
