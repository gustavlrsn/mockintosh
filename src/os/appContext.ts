/**
 * The SDK's `AppContext` as the shell provides it: everything an app can do
 * that does not need a window. `onOpen` receives one; `WindowContent`
 * extends one with the window a component is mounted in (`AppServices`).
 */

import type { AppContext, WindowSpec } from "@mockintosh/sdk";
import type { OSServices, IconScreenRect } from "./context";
import { createAppStorage } from "./appStorage";

export interface AppContextOptions {
  /**
   * Where the user opened the app from (its icon). The first window the app
   * opens zooms out of this rect; the animation belongs to that one window,
   * so the rect is consumed by the first `openWindow` call.
   */
  fromRect?: IconScreenRect;
}

export function createAppContext(
  os: OSServices,
  appId: string,
  options: AppContextOptions = {}
): AppContext {
  let pendingFromRect = options.fromRect;
  return {
    getSprite: (name) => os.sprites.get(name),
    storage: createAppStorage(os.fs, appId),
    fs: os.fs,
    os: {
      openApp: (id, props) => os.openApp(id, props),
      openWindow: (id, props) => os.openApp(id, props),
      closeWindow: (id) => os.closeWindow(id),
      showDialog: (opts) => os.showDialog(opts),
    },
    openWindow<P extends Record<string, unknown>>(spec?: WindowSpec<P>): string {
      const fromRect = pendingFromRect;
      pendingFromRect = undefined;
      return os.openWindow(appId, spec, fromRect);
    },
    env: os.env,
    capabilities: os.capabilities,
    fetch: os.fetch,
    print: os.printer,
  };
}
