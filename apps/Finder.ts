import { MultiWindowSystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import type { GrafPort } from "@mockintosh/quickdraw";
import { blitSpriteOutline } from "../lib/canvas/SpriteManager";
import { qdDrawRect } from "../lib/canvas/qdDraw";
import { ResourceManager } from "../lib/toolbox/ResourceManager";
import { drawBitmapText, measureText } from "../lib/canvas/fontAdapter";
import { OSEvent } from "../lib/toolbox/EventManager";
import {
  FileManager,
  getIconForNode,
  ROOT_ID,
} from "../lib/toolbox/FileManager";
import { MenubarDefinition } from "../lib/toolbox/MenuManager";
import { OSServices } from "../lib/canvas/OSServices";
import { HitRegionMap } from "../lib/canvas/HitRegion";
import { SCROLLBAR_WIDTH, INFO_BAR_HEIGHT } from "../lib/toolbox/WindowManager";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FinderIcon {
  title: string;
  img: string;
  nodeId: string;
  isDirectory: boolean;
  isVolume?: boolean;
  position?: { x: number; y: number };
}

export interface FinderDragState {
  fsNodeId: string;
  sourceDirectoryId: string;
  img: string;
  title: string;
  screenX: number;
  screenY: number;
  offsetX: number;
  offsetY: number;
}

export interface FinderWindowInfo {
  windowId: string;
  directoryId: string;
  contentX: number;
  contentY: number;
  contentW: number;
  contentH: number;
  scrollY: number;
  scrollX: number;
  /** Height of the fixed strip at top of content (content top inset). */
  contentTopInset?: number;
}

export interface IconScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FinderServices {
  sprites: ResourceManager;
  fs: FileManager;
  os: OSServices;
  /** Open a filesystem node. Pass iconRect (screen coords) to trigger the
   *  zoom-open animation from the icon to the new window. */
  openFSNode: (nodeId: string, iconRect?: IconScreenRect) => void;
  scheduleRender: () => void;
  screenWidth: number;
  screenHeight: number;
  menubarHeight: number;
  getOpenFolderWindows: () => FinderWindowInfo[];
  /** Reset the drive to default state (confirmation shown inside). */
  formatDrive: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ICON_SIZE = 32;
/** Original Mac: desktop icons were 32×32; hit region was the icon mask (same size). */
const ICON_HIT_W = 32;
const ICON_HIT_H = 32;
const DESKTOP_PADDING_TOP = 8;

const FOLDER_ICON_CELL_W = 80;
const FOLDER_ICON_CELL_H = 56;
const FOLDER_PADDING = 16;

export const DESKTOP_ICON_CELL_W = 84;
export const DESKTOP_ICON_CELL_H = 64;

const DRAG_THRESHOLD = 4;

export const DESKTOP_WINDOW_ID = "__desktop__";

// ---------------------------------------------------------------------------
// FS → Icon helpers
// ---------------------------------------------------------------------------

function buildFolderIcons(fs: FileManager, directoryId: string): FinderIcon[] {
  const children = fs.readDir(directoryId);
  return children.map((node) => ({
    title: node.name,
    img: getIconForNode(node),
    nodeId: node.id,
    isDirectory: node.kind === "directory",
    position: node.position,
  }));
}

function buildDesktopIcons(fs: FileManager): FinderIcon[] {
  const icons: FinderIcon[] = [];

  const volumes = fs.readDir(ROOT_ID);
  for (const vol of volumes) {
    icons.push({
      title: vol.name,
      img: getIconForNode(vol),
      nodeId: vol.id,
      isDirectory: true,
      isVolume: true,
      position: vol.position,
    });
  }

  for (const vol of volumes) {
    if (vol.kind !== "directory") continue;
    const desktopFolder = fs.findByName(vol.id, "Desktop Folder");
    if (!desktopFolder) continue;
    const contents = fs.readDir(desktopFolder.id);
    for (const node of contents) {
      icons.push({
        title: node.name,
        img: getIconForNode(node),
        nodeId: node.id,
        isDirectory: node.kind === "directory",
        isVolume: false,
        position: node.position,
      });
    }
  }

  const trashId = getTrashId(fs);
  if (trashId) {
    icons.push({
      title: "Trash",
      img: "icon/trash",
      nodeId: trashId,
      isDirectory: true,
      isVolume: false,
    });
  }

  return icons;
}

function getDesktopFolderId(fs: FileManager): string | undefined {
  const hd = fs.findByName(ROOT_ID, "Mockintosh HD");
  if (!hd) return undefined;
  const df = fs.findByName(hd.id, "Desktop Folder");
  return df?.id;
}

/** Trash directory on the main volume (original Mac: root-level special folder). */
function getTrashId(fs: FileManager): string | undefined {
  const hd = fs.findByName(ROOT_ID, "Mockintosh HD");
  if (!hd) return undefined;
  const trash = fs.findByName(hd.id, "Trash");
  return trash?.id;
}

/** Original Mac: Trash was traditionally in the lower-right corner of the desktop. */
function getTrashDesktopPosition(svc: FinderServices): {
  x: number;
  y: number;
} {
  const desktopH = svc.screenHeight - svc.menubarHeight;
  const maxRows = Math.max(
    1,
    Math.floor((desktopH - DESKTOP_PADDING_TOP) / DESKTOP_ICON_CELL_H)
  );
  const rightEdge = svc.screenWidth - DESKTOP_ICON_CELL_W;
  const y = (maxRows - 1) * DESKTOP_ICON_CELL_H + DESKTOP_PADDING_TOP;
  return { x: rightEdge, y };
}

// ---------------------------------------------------------------------------
// Desktop icon layout (right-to-left columns, top-to-bottom)
// ---------------------------------------------------------------------------

function computeDesktopIconPos(
  index: number,
  screenWidth: number,
  menubarHeight: number,
  screenHeight: number
): { x: number; y: number } {
  const desktopH = screenHeight - menubarHeight;
  const maxRows = Math.floor(
    (desktopH - DESKTOP_PADDING_TOP) / DESKTOP_ICON_CELL_H
  );
  const col = Math.floor(index / Math.max(1, maxRows));
  const row = index % Math.max(1, maxRows);
  return {
    x: screenWidth - (col + 1) * DESKTOP_ICON_CELL_W,
    y: row * DESKTOP_ICON_CELL_H + DESKTOP_PADDING_TOP,
  };
}

function snapToDesktopGrid(
  x: number,
  y: number,
  screenWidth: number,
  _menubarHeight: number
): { x: number; y: number } {
  const originY = DESKTOP_PADDING_TOP;
  const rightEdge = screenWidth - DESKTOP_ICON_CELL_W;
  const col = Math.round((rightEdge - x) / DESKTOP_ICON_CELL_W);
  const row = Math.round((y - originY) / DESKTOP_ICON_CELL_H);
  return {
    x: rightEdge - col * DESKTOP_ICON_CELL_W,
    y: originY + row * DESKTOP_ICON_CELL_H,
  };
}

/** Returns the 32×32 icon hit rect (original Mac used icon mask = same size as icon). */
function getIconHitRect(
  cellX: number,
  cellY: number,
  cellW: number
): { x: number; y: number; w: number; h: number } {
  return {
    x: cellX + Math.floor((cellW - ICON_HIT_W) / 2),
    y: cellY,
    w: ICON_HIT_W,
    h: ICON_HIT_H,
  };
}

// ---------------------------------------------------------------------------
// Folder icon layout (left-to-right grid)
// ---------------------------------------------------------------------------

function computeFolderIconPos(
  index: number,
  cols: number
): { x: number; y: number } {
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    x: FOLDER_PADDING + col * FOLDER_ICON_CELL_W,
    y: FOLDER_PADDING + row * FOLDER_ICON_CELL_H,
  };
}

function snapToFolderGrid(x: number, y: number): { x: number; y: number } {
  return {
    x:
      FOLDER_PADDING +
      Math.round((x - FOLDER_PADDING) / FOLDER_ICON_CELL_W) *
        FOLDER_ICON_CELL_W,
    y:
      FOLDER_PADDING +
      Math.round((y - FOLDER_PADDING) / FOLDER_ICON_CELL_H) *
        FOLDER_ICON_CELL_H,
  };
}

// ---------------------------------------------------------------------------
// Shared icon position helpers
// ---------------------------------------------------------------------------
// Icons without a custom position are laid out by grid index (current list order).
// "Clean up" assigns every icon a grid position and persists it, so only the
// moved icon's position changes when the user drags.

function getDesktopIconPos(
  icon: FinderIcon,
  index: number,
  svc: FinderServices
): { x: number; y: number } {
  if (getTrashId(svc.fs) === icon.nodeId) {
    const node = svc.fs.getNode(icon.nodeId);
    return node?.position ?? getTrashDesktopPosition(svc);
  }
  if (icon.position) return icon.position;
  return computeDesktopIconPos(
    index,
    svc.screenWidth,
    svc.menubarHeight,
    svc.screenHeight
  );
}

function getFolderIconPos(
  icon: FinderIcon,
  index: number,
  cols: number
): { x: number; y: number } {
  if (icon.position) return icon.position;
  return computeFolderIconPos(index, cols);
}

/** Default content width used when computing folder grid for Clean up (no window size in menu). */
const DEFAULT_FOLDER_CONTENT_WIDTH = 400;

/** Maximum folder grid rows when finding available space (avoids infinite loop). */
const MAX_FOLDER_ROWS = 128;

/**
 * Returns the grid slot (col, row) that a desktop position occupies.
 * Desktop grid: right-to-left columns, top-to-bottom rows.
 */
function desktopPositionToSlot(
  x: number,
  y: number,
  screenWidth: number
): { col: number; row: number } {
  const originY = DESKTOP_PADDING_TOP;
  const rightEdge = screenWidth - DESKTOP_ICON_CELL_W;
  const col = Math.round((rightEdge - x) / DESKTOP_ICON_CELL_W);
  const row = Math.round((y - originY) / DESKTOP_ICON_CELL_H);
  return { col: Math.max(0, col), row: Math.max(0, row) };
}

/**
 * Returns the grid slot (col, row) that a folder position occupies.
 * Folder grid: left-to-right columns, top-to-bottom rows.
 */
function folderPositionToSlot(
  x: number,
  y: number
): { col: number; row: number } {
  const col = Math.round((x - FOLDER_PADDING) / FOLDER_ICON_CELL_W);
  const row = Math.round((y - FOLDER_PADDING) / FOLDER_ICON_CELL_H);
  return { col: Math.max(0, col), row: Math.max(0, row) };
}

/**
 * Finds the first available grid slot on the desktop and returns its position (screen coordinates).
 */
function findAvailableDesktopPosition(svc: FinderServices): {
  x: number;
  y: number;
} {
  const icons = buildDesktopIcons(svc.fs);
  const occupied = new Set<string>();
  for (let i = 0; i < icons.length; i++) {
    const pos = getDesktopIconPos(icons[i], i, svc);
    const slot = desktopPositionToSlot(pos.x, pos.y, svc.screenWidth);
    occupied.add(`${slot.col},${slot.row}`);
  }
  const desktopH = svc.screenHeight - svc.menubarHeight;
  const maxRows = Math.max(
    1,
    Math.floor((desktopH - DESKTOP_PADDING_TOP) / DESKTOP_ICON_CELL_H)
  );
  const rightEdge = svc.screenWidth - DESKTOP_ICON_CELL_W;
  const originY = DESKTOP_PADDING_TOP;
  /** Only consider columns that keep the icon on-screen (x >= 0). */
  const maxCols = Math.max(1, Math.floor(rightEdge / DESKTOP_ICON_CELL_W));
  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < maxCols; col++) {
      if (occupied.has(`${col},${row}`)) continue;
      return {
        x: rightEdge - col * DESKTOP_ICON_CELL_W,
        y: originY + row * DESKTOP_ICON_CELL_H,
      };
    }
  }
  return {
    x: rightEdge - (maxCols - 1) * DESKTOP_ICON_CELL_W,
    y: originY + (maxRows - 1) * DESKTOP_ICON_CELL_H,
  };
}

/**
 * Finds the first available grid slot in a folder and returns its position (content coordinates).
 */
function findAvailableFolderPosition(
  svc: FinderServices,
  directoryId: string,
  contentWidth: number
): { x: number; y: number } {
  const icons = buildFolderIcons(svc.fs, directoryId);
  const cols = Math.max(
    1,
    Math.floor((contentWidth - FOLDER_PADDING) / FOLDER_ICON_CELL_W)
  );
  const occupied = new Set<string>();
  for (let i = 0; i < icons.length; i++) {
    const pos = getFolderIconPos(icons[i], i, cols);
    const slot = folderPositionToSlot(pos.x, pos.y);
    occupied.add(`${slot.col},${slot.row}`);
  }
  for (let row = 0; row < MAX_FOLDER_ROWS; row++) {
    for (let col = 0; col < cols; col++) {
      if (occupied.has(`${col},${row}`)) continue;
      return {
        x: FOLDER_PADDING + col * FOLDER_ICON_CELL_W,
        y: FOLDER_PADDING + row * FOLDER_ICON_CELL_H,
      };
    }
  }
  return {
    x: FOLDER_PADDING + (cols - 1) * FOLDER_ICON_CELL_W,
    y: FOLDER_PADDING + (MAX_FOLDER_ROWS - 1) * FOLDER_ICON_CELL_H,
  };
}

/**
 * Assign every icon in the container a grid position and persist it.
 * After this, every icon has a custom position, so moving one never shifts others.
 */
function cleanUpAndPersistPositions(
  svc: FinderServices,
  isDesktop: boolean,
  directoryId: string | undefined
): void {
  if (!directoryId) return;

  if (isDesktop) {
    const icons = buildDesktopIcons(svc.fs);
    const trashId = getTrashId(svc.fs);
    for (let i = 0; i < icons.length; i++) {
      if (icons[i].nodeId === trashId) continue;
      const pos = computeDesktopIconPos(
        i,
        svc.screenWidth,
        svc.menubarHeight,
        svc.screenHeight
      );
      svc.fs.setPosition(icons[i].nodeId, pos);
    }
  } else {
    const icons = buildFolderIcons(svc.fs, directoryId);
    const contentWidth = DEFAULT_FOLDER_CONTENT_WIDTH - 2 - SCROLLBAR_WIDTH;
    const cols = Math.max(
      1,
      Math.floor((contentWidth - FOLDER_PADDING) / FOLDER_ICON_CELL_W)
    );
    for (let i = 0; i < icons.length; i++) {
      const pos = computeFolderIconPos(i, cols);
      svc.fs.setPosition(icons[i].nodeId, pos);
    }
  }
  svc.scheduleRender();
}

// ---------------------------------------------------------------------------
// The Finder application
// ---------------------------------------------------------------------------

export const FinderApp: MultiWindowSystemApp = {
  id: "finder",
  title: "Finder",
  icon: "icon/folder",

  renderWindow(
    app: AppBuilder,
    win: AppBuilder,
    ctx: WindowContext,
    windowId: string,
    props: any
  ) {
    const svc: FinderServices = props._finderServices;
    if (!svc) return;

    if (windowId === DESKTOP_WINDOW_ID) {
      renderDesktopWindow(app, win, ctx, svc);
    } else {
      renderFolderWindow(app, win, ctx, windowId, props, svc);
    }
  },

  onWindowEvent(
    app: AppBuilder,
    win: AppBuilder,
    event: OSEvent,
    windowId: string,
    props: any,
    size: WindowSize
  ) {
    const svc: FinderServices = props._finderServices;
    if (!svc) return;

    if (windowId === DESKTOP_WINDOW_ID) {
      handleDesktopEvent(app, win, event, svc, size);
    } else {
      handleFolderEvent(app, win, event, windowId, props, svc, size);
    }
  },

  getContentHeight(
    _app: AppBuilder,
    win: AppBuilder,
    windowId: string,
    props: any,
    size: WindowSize
  ): number {
    if (windowId === DESKTOP_WINDOW_ID) return 0;

    const svc: FinderServices = props._finderServices;
    if (!svc) return 0;
    const directoryId: string | undefined = props.directoryId;

    const icons: FinderIcon[] = win.useMemo(() => {
      if (directoryId) return buildFolderIcons(svc.fs, directoryId);
      return [];
    }, [directoryId, svc.fs.version]);

    const contentWidth = size.width - 2 - SCROLLBAR_WIDTH;
    const cols = Math.max(
      1,
      Math.floor((contentWidth - FOLDER_PADDING) / FOLDER_ICON_CELL_W)
    );

    let maxY = 0;
    for (let i = 0; i < icons.length; i++) {
      const pos = getFolderIconPos(icons[i], i, cols);
      const bottom = pos.y + FOLDER_ICON_CELL_H;
      if (bottom > maxY) maxY = bottom;
    }
    return maxY + FOLDER_PADDING;
  },

  getMenubar(
    _app: AppBuilder,
    _win: AppBuilder,
    windowId: string,
    props: any
  ): MenubarDefinition[] {
    const svc: FinderServices = props._finderServices;
    if (!svc) return [];

    const isDesktop = windowId === DESKTOP_WINDOW_ID;
    const directoryId: string | undefined = isDesktop
      ? getDesktopFolderId(svc.fs)
      : props.directoryId;

    const cleanUpLabel = isDesktop ? "Clean Up Desktop" : "Clean Up Window";

    return [
      {
        label: "File",
        items: [
          {
            label: "New Folder",
            shortcut: "⌘N",
            disabled: !directoryId,
            onClick: async () => {
              if (!directoryId) return;
              const name = await svc.os.showDialog({
                message: "Name for new folder:",
                buttons: ["Cancel", "OK"],
                showInput: true,
                inputDefault: "untitled folder",
              });
              if (name && name !== "Cancel") {
                const dir = svc.fs.mkdir(directoryId, name);
                const pos = isDesktop
                  ? findAvailableDesktopPosition(svc)
                  : findAvailableFolderPosition(
                      svc,
                      directoryId,
                      DEFAULT_FOLDER_CONTENT_WIDTH - 2 - SCROLLBAR_WIDTH
                    );
                svc.fs.setPosition(dir.id, pos);
              }
            },
          },
          {
            label: "New Text File",
            disabled: !directoryId,
            onClick: async () => {
              if (!directoryId) return;
              const name = await svc.os.showDialog({
                message: "Name for new file:",
                buttons: ["Cancel", "OK"],
                showInput: true,
                inputDefault: "untitled.txt",
              });
              if (name && name !== "Cancel") {
                const file = await svc.fs.writeFile(
                  directoryId,
                  name,
                  "",
                  "text"
                );
                const pos = isDesktop
                  ? findAvailableDesktopPosition(svc)
                  : findAvailableFolderPosition(
                      svc,
                      directoryId,
                      DEFAULT_FOLDER_CONTENT_WIDTH - 2 - SCROLLBAR_WIDTH
                    );
                svc.fs.setPosition(file.id, pos);
              }
            },
          },
          { type: "separator" as const },
          { label: "Open", shortcut: "⌘O", disabled: true },
          { label: "Close", disabled: true },
        ],
      },
      {
        label: "Edit",
        items: [
          { label: "Undo", shortcut: "⌘Z", disabled: true },
          { label: "Cut", shortcut: "⌘X", disabled: true },
          { label: "Copy", shortcut: "⌘C", disabled: true },
          { label: "Paste", shortcut: "⌘V", disabled: true },
        ],
      },
      {
        label: "View",
        items: [
          { label: "By Icon", disabled: true },
          { label: "By Name", disabled: true },
          { label: "By Date", disabled: true },
        ],
      },
      {
        label: "Special",
        items: [
          {
            label: cleanUpLabel,
            disabled: !directoryId,
            onClick: () => {
              cleanUpAndPersistPositions(svc, isDesktop, directoryId);
            },
          },
          {
            label: "Empty Trash",
            disabled: (() => {
              const tid = getTrashId(svc.fs);
              return !tid || svc.fs.readDir(tid).length === 0;
            })(),
            onClick: async () => {
              const tid = getTrashId(svc.fs);
              if (!tid) return;
              const children = svc.fs.readDir(tid);
              for (const child of children) await svc.fs.remove(child.id);
              svc.scheduleRender();
            },
          },
          { type: "separator" as const },
          {
            label: "Format Drive…",
            onClick: () => void svc.formatDrive(),
          },
          { type: "separator" as const },
          { label: "Restart", disabled: true },
          { label: "Shut Down", disabled: true },
        ],
      },
    ];
  },

  getInfoBar(
    _app: AppBuilder,
    win: AppBuilder,
    windowId: string,
    props: any
  ): string[] | null {
    if (windowId === DESKTOP_WINDOW_ID) return null;
    // Folder windows draw the info strip in the content top inset; no chrome info bar.
    return null;
  },

  getContentTopInset(
    _app: AppBuilder,
    win: AppBuilder,
    windowId: string,
    props: any,
    _size: WindowSize
  ): number {
    if (windowId === DESKTOP_WINDOW_ID) return 0;
    return INFO_BAR_HEIGHT;
  },
};

// ---------------------------------------------------------------------------
// App-level drag state — stored as a module-level singleton.
//
// This MUST NOT live inside a useRef/useState hook because it is read from
// outside the render/event cycle (e.g. finderIsDragging is called from the
// global event handler before resetForRender). A hook-based approach would
// read the wrong slot when the hook cursor isn't at the expected position.
// ---------------------------------------------------------------------------

interface FinderAppState {
  drag: FinderDragState | null;
  dropTarget: { nodeId: string } | null;
  pendingDrag: {
    fsNodeId: string;
    sourceDirectoryId: string;
    img: string;
    title: string;
    startScreenX: number;
    startScreenY: number;
    offsetX: number;
    offsetY: number;
  } | null;
}

const finderState: FinderAppState = {
  drag: null,
  dropTarget: null,
  pendingDrag: null,
};

function getAppState(): FinderAppState {
  return finderState;
}

// ---------------------------------------------------------------------------
// Helpers to check if the Finder has an active drag
// ---------------------------------------------------------------------------

export function finderIsDragging(app: AppBuilder): boolean {
  const st = getAppState();
  return st.drag !== null || st.pendingDrag !== null;
}

export function finderHandleMouseMove(
  app: AppBuilder,
  screenX: number,
  screenY: number,
  svc: FinderServices
) {
  const st = getAppState();

  if (st.pendingDrag && !st.drag) {
    const dx = Math.abs(screenX - st.pendingDrag.startScreenX);
    const dy = Math.abs(screenY - st.pendingDrag.startScreenY);
    if (dx >= DRAG_THRESHOLD || dy >= DRAG_THRESHOLD) {
      st.drag = {
        fsNodeId: st.pendingDrag.fsNodeId,
        sourceDirectoryId: st.pendingDrag.sourceDirectoryId,
        img: st.pendingDrag.img,
        title: st.pendingDrag.title,
        screenX,
        screenY,
        offsetX: st.pendingDrag.offsetX,
        offsetY: st.pendingDrag.offsetY,
      };
      st.pendingDrag = null;
    }
  }

  if (st.drag) {
    st.drag.screenX = screenX;
    st.drag.screenY = screenY;
    st.dropTarget = findDropTargetAtScreen(screenX, screenY, svc);
    svc.scheduleRender();
  }
}

export function finderHandleMouseUp(
  app: AppBuilder,
  screenX: number,
  screenY: number,
  svc: FinderServices
) {
  const st = getAppState();

  st.pendingDrag = null;

  if (!st.drag) return;

  const drag = st.drag;
  const dropTarget = st.dropTarget;

  st.drag = null;
  st.dropTarget = null;

  if (dropTarget && getTrashId(svc.fs) !== drag.fsNodeId) {
    svc.fs.move(drag.fsNodeId, dropTarget.nodeId);
    svc.scheduleRender();
    return;
  }

  const ghostX = drag.screenX - drag.offsetX;
  const ghostY = drag.screenY - drag.offsetY;

  // Check if dropped over an open folder window
  const openWindows = svc.getOpenFolderWindows();
  for (let w = openWindows.length - 1; w >= 0; w--) {
    const fw = openWindows[w];
    if (
      screenX >= fw.contentX &&
      screenX < fw.contentX + fw.contentW &&
      screenY >= fw.contentY &&
      screenY < fw.contentY + fw.contentH
    ) {
      const inset = fw.contentTopInset ?? 0;
      const localGhostX = ghostX - fw.contentX + fw.scrollX;
      const localGhostY = ghostY - fw.contentY - inset + fw.scrollY;

      if (drag.sourceDirectoryId !== fw.directoryId) {
        svc.fs.move(drag.fsNodeId, fw.directoryId);
      }
      svc.fs.setPosition(drag.fsNodeId, { x: localGhostX, y: localGhostY });
      svc.scheduleRender();
      return;
    }
  }

  // Dropped over the desktop — save position in desktop-local space
  const localDropY = ghostY - svc.menubarHeight;
  if (drag.sourceDirectoryId === DESKTOP_WINDOW_ID) {
    svc.fs.setPosition(drag.fsNodeId, { x: ghostX, y: localDropY });
  } else {
    const desktopFolderId = getDesktopFolderId(svc.fs);
    if (desktopFolderId) {
      svc.fs.move(drag.fsNodeId, desktopFolderId);
      svc.fs.setPosition(drag.fsNodeId, { x: ghostX, y: localDropY });
    }
  }

  svc.scheduleRender();
}

/**
 * Render the drag ghost on the GrafPort in screen coordinates.
 * Called from main.tsx after all windows are drawn, so the ghost appears on top.
 * Draws a solid outline of the icon silhouette and a rectangle outline around
 * the label, matching the classic Mac Finder drag appearance.
 */
export function finderRenderDragGhost(
  app: AppBuilder,
  port: GrafPort,
  svc: FinderServices
) {
  const st = getAppState();
  const drag = st.drag;
  if (!drag) return;

  const sprite = svc.sprites.get(drag.img);
  if (!sprite) return;

  const ghostX = drag.screenX - drag.offsetX;
  const ghostY = drag.screenY - drag.offsetY;
  const cellW =
    drag.sourceDirectoryId === DESKTOP_WINDOW_ID
      ? DESKTOP_ICON_CELL_W
      : FOLDER_ICON_CELL_W;
  const ix = ghostX + Math.floor((cellW - ICON_SIZE) / 2);

  blitSpriteOutline(port, sprite, ix, ghostY, BLACK);

  const textW = measureText(drag.title, "Geneva9");
  const labelW = textW + 4;
  const labelH = 12;
  const labelX = ghostX + Math.floor((cellW - labelW) / 2);
  const labelY = ghostY + ICON_SIZE + 2;
  if (labelW > 0 && labelH > 0) {
    qdDrawRect(port, labelX, labelY, labelW, labelH, BLACK);
  }
}

// ---------------------------------------------------------------------------
// Find drop targets across all Finder surfaces
// ---------------------------------------------------------------------------

function findDropTargetAtScreen(
  screenX: number,
  screenY: number,
  svc: FinderServices
): { nodeId: string } | null {
  const st = getAppState();
  const drag = st.drag;
  if (!drag) return null;

  // Check folder window icons first (higher z-order — windows are on top of desktop)
  const openWindows = svc.getOpenFolderWindows();
  for (let w = openWindows.length - 1; w >= 0; w--) {
    const fw = openWindows[w];
    if (
      screenX >= fw.contentX &&
      screenX < fw.contentX + fw.contentW &&
      screenY >= fw.contentY &&
      screenY < fw.contentY + fw.contentH
    ) {
      const inset = fw.contentTopInset ?? 0;
      const localX = screenX - fw.contentX + fw.scrollX;
      const localY = screenY - fw.contentY - inset + fw.scrollY;
      const icons = buildFolderIcons(svc.fs, fw.directoryId);
      const cols = Math.max(
        1,
        Math.floor((fw.contentW - FOLDER_PADDING) / FOLDER_ICON_CELL_W)
      );
      for (let i = 0; i < icons.length; i++) {
        const icon = icons[i];
        if (icon.nodeId === drag.fsNodeId) continue;
        if (!icon.isDirectory) continue;
        const pos = getFolderIconPos(icon, i, cols);
        const hit = getIconHitRect(pos.x, pos.y, FOLDER_ICON_CELL_W);
        if (
          localX >= hit.x &&
          localX < hit.x + hit.w &&
          localY >= hit.y &&
          localY < hit.y + hit.h
        ) {
          return { nodeId: icon.nodeId };
        }
      }
      break;
    }
  }

  // Check desktop icons (positions are in desktop-local space, Y=0 is top of desktop)
  const desktopIcons = buildDesktopIcons(svc.fs);
  const localScreenY = screenY - svc.menubarHeight;
  for (let i = 0; i < desktopIcons.length; i++) {
    const icon = desktopIcons[i];
    if (icon.nodeId === drag.fsNodeId) continue;
    if (!icon.isDirectory && !icon.isVolume) continue;
    const pos = getDesktopIconPos(icon, i, svc);
    const hit = getIconHitRect(pos.x, pos.y, DESKTOP_ICON_CELL_W);
    if (
      screenX >= hit.x &&
      screenX < hit.x + hit.w &&
      localScreenY >= hit.y &&
      localScreenY < hit.y + hit.h
    ) {
      return { nodeId: icon.nodeId };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Desktop window rendering
// ---------------------------------------------------------------------------

function renderDesktopWindow(
  app: AppBuilder,
  win: AppBuilder,
  ctx: WindowContext,
  svc: FinderServices
) {
  ctx.fillPattern(0, 0, ctx.width, ctx.height, "checkers");

  const icons: FinderIcon[] = win.useMemo(
    () => buildDesktopIcons(svc.fs),
    [svc.fs.version]
  );

  const [selected, _setSelected] = win.useState<string | null>(null);
  const openWindowTitles: Set<string> = win.useMemo(() => new Set(), []);

  const st = getAppState();
  const dropTarget = st.dropTarget;

  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];

    const pos = getDesktopIconPos(icon, i, svc);
    const isSelected = selected === icon.nodeId;
    const isOpen = openWindowTitles.has(icon.title);
    const isDropTgt = dropTarget?.nodeId === icon.nodeId;

    drawIcon(
      ctx,
      svc.sprites,
      icon,
      pos.x,
      pos.y,
      DESKTOP_ICON_CELL_W,
      isSelected,
      isDropTgt,
      isOpen
    );
  }
}

// ---------------------------------------------------------------------------
// Desktop event handling
// ---------------------------------------------------------------------------

function handleDesktopEvent(
  app: AppBuilder,
  win: AppBuilder,
  event: OSEvent,
  svc: FinderServices,
  _size: WindowSize
) {
  const icons: FinderIcon[] = win.useMemo(
    () => buildDesktopIcons(svc.fs),
    [svc.fs.version]
  );

  const [_selected, setSelected] = win.useState<string | null>(null);

  const st = getAppState();

  if (event.type === "mouseDown") {
    const mx = event.x!;
    const my = event.y!;
    const localY = my - svc.menubarHeight;

    let hitIcon: FinderIcon | null = null;
    let hitPos: { x: number; y: number } | null = null;
    for (let i = 0; i < icons.length; i++) {
      const pos = getDesktopIconPos(icons[i], i, svc);
      const hit = getIconHitRect(pos.x, pos.y, DESKTOP_ICON_CELL_W);
      if (
        mx >= hit.x &&
        mx < hit.x + hit.w &&
        localY >= hit.y &&
        localY < hit.y + hit.h
      ) {
        hitIcon = icons[i];
        hitPos = pos;
        break;
      }
    }

    if (hitIcon && hitPos) {
      setSelected(hitIcon.nodeId);
      st.pendingDrag = {
        fsNodeId: hitIcon.nodeId,
        sourceDirectoryId: DESKTOP_WINDOW_ID,
        img: hitIcon.img,
        title: hitIcon.title,
        startScreenX: mx,
        startScreenY: my,
        offsetX: mx - hitPos.x,
        offsetY: localY - hitPos.y,
      };
    } else {
      setSelected(null);
      st.pendingDrag = null;
    }
  }

  if (event.type === "mouseMove") {
    finderHandleMouseMove(app, event.x!, event.y!, svc);
  }

  if (event.type === "mouseUp") {
    finderHandleMouseUp(app, event.x!, event.y!, svc);
  }

  if (event.type === "doubleClick") {
    const mx = event.x!;
    const my = event.y! - svc.menubarHeight;
    if (st.drag) return;

    for (let i = 0; i < icons.length; i++) {
      const pos = getDesktopIconPos(icons[i], i, svc);
      const hit = getIconHitRect(pos.x, pos.y, DESKTOP_ICON_CELL_W);
      if (
        mx >= hit.x &&
        mx < hit.x + hit.w &&
        my >= hit.y &&
        my < hit.y + hit.h
      ) {
        svc.openFSNode(icons[i].nodeId, {
          x: pos.x,
          y: pos.y + svc.menubarHeight,
          width: DESKTOP_ICON_CELL_W,
          height: DESKTOP_ICON_CELL_H,
        });
        return;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Folder window rendering
// ---------------------------------------------------------------------------

function renderFolderWindow(
  app: AppBuilder,
  win: AppBuilder,
  ctx: WindowContext,
  _windowId: string,
  props: any,
  svc: FinderServices
) {
  const directoryId: string | undefined = props.directoryId;

  const icons: FinderIcon[] = win.useMemo(() => {
    if (directoryId) return buildFolderIcons(svc.fs, directoryId);
    return [];
  }, [directoryId, svc.fs.version]);

  const [selected, _setSelected] = win.useState<string | null>(null);
  const st = getAppState();
  const dropTarget = st.dropTarget;

  ctx.clear(WHITE);

  // Fixed strip: info bar (same content as former chrome getInfoBar)
  const infoItems = [
    `${icons.length} item${icons.length !== 1 ? "s" : ""}`,
    "2,427K in disk",
    "7,648K available",
  ];
  ctx.drawHLine(0, INFO_BAR_HEIGHT - 1, ctx.width, BLACK);
  if (infoItems.length > 0) {
    const colW = Math.floor((ctx.width - 2) / infoItems.length);
    for (let i = 0; i < infoItems.length; i++) {
      const tw = measureText(infoItems[i], "Geneva9");
      const tx = 1 + i * colW + Math.floor((colW - tw) / 2);
      ctx.drawText(infoItems[i], tx, 4, { font: "Geneva9", color: BLACK });
      if (i < infoItems.length - 1) {
        ctx.drawVLine(1 + (i + 1) * colW, 0, INFO_BAR_HEIGHT - 1, BLACK);
      }
    }
  }

  // Scrollable content: icon grid
  const cols = Math.max(
    1,
    Math.floor((ctx.width - FOLDER_PADDING) / FOLDER_ICON_CELL_W)
  );
  ctx.drawScrollableContent((scrollCtx) => {
    for (let i = 0; i < icons.length; i++) {
      const icon = icons[i];
      const pos = getFolderIconPos(icon, i, cols);
      const isSelected = selected === icon.nodeId;
      const isDropTgt = dropTarget?.nodeId === icon.nodeId;
      drawIcon(
        scrollCtx,
        svc.sprites,
        icon,
        pos.x,
        pos.y,
        FOLDER_ICON_CELL_W,
        isSelected,
        isDropTgt,
        false
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Folder event handling
// ---------------------------------------------------------------------------

function handleFolderEvent(
  app: AppBuilder,
  win: AppBuilder,
  event: OSEvent,
  _windowId: string,
  props: any,
  svc: FinderServices,
  size: WindowSize
) {
  const directoryId: string | undefined = props.directoryId;

  const icons: FinderIcon[] = win.useMemo(() => {
    if (directoryId) return buildFolderIcons(svc.fs, directoryId);
    return [];
  }, [directoryId, svc.fs.version]);

  const [_selected, setSelected] = win.useState<string | null>(null);

  const st = getAppState();

  const contentWidth = size.width - 2 - SCROLLBAR_WIDTH;
  const cols = Math.max(
    1,
    Math.floor((contentWidth - FOLDER_PADDING) / FOLDER_ICON_CELL_W)
  );

  const originX = size.contentOriginX ?? 0;
  const originY = size.contentOriginY ?? 0;
  const inset = size.contentTopInset ?? 0;
  const scrollY = size.scrollY ?? 0;
  // When content top inset is set, event.y in scrollable region is in scrollable-content space; convert to screen.
  const toScreenY = (contentY: number) =>
    inset > 0 ? originY + inset + contentY - scrollY : originY + contentY;

  const inScrollableRegion =
    event.contentRegion !== "fixed" &&
    (event.contentRegion === "scrollable" || inset === 0);

  if (event.type === "mouseDown") {
    if (!inScrollableRegion) {
      setSelected(null);
      st.pendingDrag = null;
    } else {
      const mx = event.x!;
      const my = event.y!;

      let hitIcon: FinderIcon | null = null;
      let hitPos: { x: number; y: number } | null = null;
      for (let i = 0; i < icons.length; i++) {
        const pos = getFolderIconPos(icons[i], i, cols);
        const hit = getIconHitRect(pos.x, pos.y, FOLDER_ICON_CELL_W);
        if (
          mx >= hit.x &&
          mx < hit.x + hit.w &&
          my >= hit.y &&
          my < hit.y + hit.h
        ) {
          hitIcon = icons[i];
          hitPos = pos;
          break;
        }
      }

      if (hitIcon && hitPos) {
        setSelected(hitIcon.nodeId);
        const screenX = mx + originX;
        const screenY = toScreenY(my);
        st.pendingDrag = {
          fsNodeId: hitIcon.nodeId,
          sourceDirectoryId: directoryId ?? "",
          img: hitIcon.img,
          title: hitIcon.title,
          startScreenX: screenX,
          startScreenY: screenY,
          offsetX: mx - hitPos.x,
          offsetY: my - hitPos.y,
        };
      } else {
        setSelected(null);
        st.pendingDrag = null;
      }
    }
  }

  if (event.type === "mouseMove" && inScrollableRegion) {
    const screenX = event.x! + originX;
    const screenY = toScreenY(event.y!);
    finderHandleMouseMove(app, screenX, screenY, svc);
  }

  if (event.type === "mouseUp" && inScrollableRegion) {
    const screenX = event.x! + originX;
    const screenY = toScreenY(event.y!);
    finderHandleMouseUp(app, screenX, screenY, svc);
  }

  if (event.type === "doubleClick" && inScrollableRegion) {
    const mx = event.x!;
    const my = event.y!;
    if (st.drag) return;

    for (let i = 0; i < icons.length; i++) {
      const pos = getFolderIconPos(icons[i], i, cols);
      const hit = getIconHitRect(pos.x, pos.y, FOLDER_ICON_CELL_W);
      if (
        mx >= hit.x &&
        mx < hit.x + hit.w &&
        my >= hit.y &&
        my < hit.y + hit.h
      ) {
        svc.openFSNode(icons[i].nodeId, {
          x: originX + pos.x,
          y: toScreenY(pos.y),
          width: FOLDER_ICON_CELL_W,
          height: FOLDER_ICON_CELL_H,
        });
        return;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Shared icon drawing
// ---------------------------------------------------------------------------

function drawIcon(
  ctx: WindowContext,
  sprites: ResourceManager,
  icon: FinderIcon,
  cellX: number,
  cellY: number,
  cellW: number,
  selected: boolean,
  isDropTarget: boolean,
  isOpen: boolean
) {
  const sprite = sprites.get(icon.img);
  if (sprite) {
    const ix = cellX + Math.floor((cellW - ICON_SIZE) / 2);
    if (isDropTarget) {
      ctx.blitInverted(sprite, ix, cellY);
    } else if (isOpen) {
      ctx.blitShadowOutline(sprite, ix, cellY);
    } else if (selected) {
      ctx.blitInverted(sprite, ix, cellY);
    } else {
      ctx.blit(sprite, ix, cellY);
    }
  }

  const textW = measureText(icon.title, "Geneva9");
  const labelX = cellX + Math.floor((cellW - textW) / 2) - 2;
  const labelY = cellY + ICON_SIZE + 2;

  if (selected || isDropTarget) {
    ctx.drawText(icon.title, labelX, labelY, {
      font: "Geneva9",
      color: WHITE,
      bg: BLACK,
      width: textW + 4,
      align: "center",
    });
  } else {
    ctx.drawText(icon.title, labelX, labelY, {
      font: "Geneva9",
      color: BLACK,
      bg: WHITE,
      width: textW + 4,
      align: "center",
    });
  }
}
