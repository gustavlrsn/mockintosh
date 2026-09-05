/**
 * Window record and chrome constants used by Toolbox drawing helpers.
 * Window chrome itself is drawn by the Solid OS shell.
 */

import type { ControlHandle } from "./ControlManager";
import type { GrafPort, Rect } from "@mockintosh/quickdraw";

export type WindowKind =
  | "document"
  | "dialog"
  | "alert"
  | "utility"
  | "presentation"
  | "desktop";

export const TITLE_BAR_HEIGHT = 20;
export const INFO_BAR_HEIGHT = 20;
export const SCROLLBAR_WIDTH = 16;

export interface WindowRecord {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  contentHeight: number;
  contentWidth: number;
  scrollY: number;
  scrollX: number;
  active: boolean;
  appId: string;
  props: unknown;
  scrollable: boolean;
  resizable: boolean;
  minWidth: number;
  minHeight: number;
  infoBar?: string[];
  windowKind: WindowKind;
  modal?: boolean;
  chromeless?: boolean;
  standardBounds?: { x: number; y: number; width: number; height: number };
  userBounds?: { x: number; y: number; width: number; height: number };
  openedFromRect?: { x: number; y: number; width: number; height: number };
  contentTopInset?: number;
  controlList: ControlHandle[];
  scrollBarControls: ControlHandle[];
  updateRect: Rect | null;
  port?: GrafPort;
  framePort?: GrafPort;
}
