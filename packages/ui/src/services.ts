/**
 * Host services the UI framework may use but does not own.
 *
 * The host passes these to `createUI()`; components reach them through
 * `useUIServices()`. Every service is optional — a platform without a
 * clipboard simply has no copy/paste — so the framework has no dependency on
 * browser globals.
 */
import { createContext, useContext } from "solid-js";

export interface UIClipboard {
  readText(): Promise<string>;
  writeText(text: string): Promise<void>;
}

export interface UIServices {
  clipboard?: UIClipboard;
}

export const UIServicesContext = createContext<UIServices>({});

export function useUIServices(): UIServices {
  return useContext(UIServicesContext);
}
