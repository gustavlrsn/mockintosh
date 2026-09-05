/**
 * OSContext — Solid context providing OS services to all OS components.
 * Created in solidMain.ts and provided to the tree by OSRoot.
 */

import { createContext, useContext } from "solid-js";
import type { SpriteRegistry } from "./sprites/registry";
import type { FileSystem } from "@mockintosh/fs";
import type { AnimRect } from "./zoomAnimation";
import type { AppInstaller } from "./installedApps";
import type { PrintService } from "@mockintosh/sdk";
import type { PlatformEnv } from "../platform/types";
import type { FetchFunction } from "@mockintosh/sdk";
import type { CapabilitySet } from "./capabilities";

export interface IconScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Drag outline rect — shared type for window drag and zoom animation. */
export type DragRect = AnimRect;

export interface DialogOptions {
  message: string;
  buttons?: string[];
  showInput?: boolean;
  inputDefault?: string;
}

export interface OSServices {
  sprites: SpriteRegistry;
  fs: FileSystem;
  resolution: { width: number; height: number };
  menubarHeight: number;
  env: PlatformEnv;
  /** What this machine can do; apps' `requires` are checked against it. */
  capabilities: CapabilitySet;
  /** Network access, when the platform has it. */
  fetch?: FetchFunction;
  /** The system printer, when the platform provides a transport for one. */
  printer?: PrintService;
  /** Installs third-party apps, when the platform can load code at runtime. */
  installer?: AppInstaller;
  openApp: (appId: string, props?: Record<string, unknown>, fromRect?: IconScreenRect) => void;
  openFolderWindow: (title: string, directoryId: string, fromRect?: IconScreenRect) => void;
  openFSNode: (nodeId: string, fromRect?: IconScreenRect) => void;
  closeWindow: (id: string) => void;
  showDialog: (options: DialogOptions) => Promise<string | null>;
  /**
   * Play the classic zoom-open animation from `fromRect` (e.g. an icon's
   * screen rect) to `toRect` (the window rect), then call `onDone` to
   * actually add the window to state.  The render loop is blocked for the
   * duration so the XOR frames are not overwritten.
   */
  playWindowOpenAnimation: (fromRect: AnimRect, toRect: AnimRect, onDone: () => void) => void;
  /**
   * Show an XOR drag outline at the given visual rect while dragging or
   * resizing a window.  The outline is drawn every frame on top of the Solid
   * render.  `onCommit` is called on mouse-up to persist the change.
   */
  showWindowOutline: (rect: AnimRect, onCommit: () => void) => void;
  /** Remove the drag/resize outline and call the stored commit callback. */
  hideWindowOutline: () => void;
  scheduleRepaint: () => void;
}

export const OSContext = createContext<OSServices | null>(null);

export function useOS(): OSServices {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error("useOS() must be called inside the OS tree");
  return ctx;
}
