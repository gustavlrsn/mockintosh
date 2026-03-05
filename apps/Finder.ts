import { MultiWindowApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BitCanvas, BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { SpriteRegistry } from "../lib/canvas/SpriteRegistry";
import { drawBitmapText, measureText } from "../lib/canvas/fontAdapter";
import { OSEvent } from "../lib/canvas/EventManager";
import { MockFS, getIconForNode, ROOT_ID } from "../lib/canvas/fs/MockFS";
import { MenubarDefinition } from "../lib/canvas/ui/drawMenubar";
import { OSServices } from "../lib/canvas/OSServices";
import { HitRegionMap } from "../lib/canvas/HitRegion";
import { SCROLLBAR_WIDTH } from "../lib/canvas/WindowManager";

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
}

export interface FinderServices {
  sprites: SpriteRegistry;
  fs: MockFS;
  os: OSServices;
  openFSNode: (nodeId: string) => void;
  scheduleRender: () => void;
  screenWidth: number;
  screenHeight: number;
  menubarHeight: number;
  getOpenFolderWindows: () => FinderWindowInfo[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ICON_SIZE = 32;
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

function buildFolderIcons(fs: MockFS, directoryId: string): FinderIcon[] {
  const children = fs.readDir(directoryId);
  return children.map((node) => ({
    title: node.name,
    img: getIconForNode(node),
    nodeId: node.id,
    isDirectory: node.kind === "directory",
    position: node.position,
  }));
}

function buildDesktopIcons(fs: MockFS): FinderIcon[] {
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

  return icons;
}

function getDesktopFolderId(fs: MockFS): string | undefined {
  const hd = fs.findByName(ROOT_ID, "Mockintosh HD");
  if (!hd) return undefined;
  const df = fs.findByName(hd.id, "Desktop Folder");
  return df?.id;
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

function getDesktopIconPos(
  icon: FinderIcon,
  index: number,
  svc: FinderServices
): { x: number; y: number } {
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

// ---------------------------------------------------------------------------
// The Finder application
// ---------------------------------------------------------------------------

export const FinderApp: MultiWindowApp = {
  id: "finder",
  title: "Finder",
  icon: "icon/folder",

  renderWindow(
    app: AppBuilder,
    win: AppBuilder,
    ctx: AppContext,
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
                buttons: ["OK", "Cancel"],
                showInput: true,
                inputDefault: "untitled folder",
              });
              if (name && name !== "Cancel") {
                svc.fs.mkdir(directoryId, name);
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
                buttons: ["OK", "Cancel"],
                showInput: true,
                inputDefault: "untitled.txt",
              });
              if (name && name !== "Cancel") {
                await svc.fs.writeFile(directoryId, name, "", "text");
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
              if (!directoryId) return;
              svc.fs.clearPositions(directoryId);
              if (isDesktop) {
                const rootChildren = svc.fs.readDir(ROOT_ID);
                for (const vol of rootChildren) {
                  if (vol.position) {
                    svc.fs.setPosition(vol.id, undefined);
                  }
                }
              }
            },
          },
          { label: "Empty Trash", disabled: true },
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

    const svc: FinderServices = props._finderServices;
    if (!svc) return null;
    const directoryId: string | undefined = props.directoryId;

    const icons: FinderIcon[] = win.useMemo(() => {
      if (directoryId) return buildFolderIcons(svc.fs, directoryId);
      return [];
    }, [directoryId, svc.fs.version]);

    const count = icons.length;
    return [
      `${count} item${count !== 1 ? "s" : ""}`,
      "2,427K in disk",
      "7,648K available",
    ];
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

  if (dropTarget) {
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
      const localGhostX = ghostX - fw.contentX;
      const localGhostY = ghostY - fw.contentY + fw.scrollY;

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
 * Render the drag ghost on the BitCanvas in screen coordinates.
 * Called from main.tsx after all windows are drawn, so the ghost appears on top.
 * Draws a solid outline of the icon silhouette and a rectangle outline around
 * the label, matching the classic Mac Finder drag appearance.
 */
export function finderRenderDragGhost(
  app: AppBuilder,
  canvas: BitCanvas,
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
  canvas.blitOutline(sprite, ix, ghostY);

  const textW = measureText(drag.title, "Geneva9");
  const labelW = textW + 4;
  const labelH = 12;
  const labelX = ghostX + Math.floor((cellW - labelW) / 2);
  const labelY = ghostY + ICON_SIZE + 2;
  canvas.drawRect(labelX, labelY, labelW, labelH, BLACK);
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
      const localX = screenX - fw.contentX;
      const localY = screenY - fw.contentY + fw.scrollY;
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
        if (
          localX >= pos.x &&
          localX < pos.x + FOLDER_ICON_CELL_W &&
          localY >= pos.y &&
          localY < pos.y + FOLDER_ICON_CELL_H
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
    if (
      screenX >= pos.x &&
      screenX < pos.x + DESKTOP_ICON_CELL_W &&
      localScreenY >= pos.y &&
      localScreenY < pos.y + DESKTOP_ICON_CELL_H
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
  ctx: AppContext,
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
      if (
        mx >= pos.x &&
        mx < pos.x + DESKTOP_ICON_CELL_W &&
        localY >= pos.y &&
        localY < pos.y + DESKTOP_ICON_CELL_H
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
      if (
        mx >= pos.x &&
        mx < pos.x + DESKTOP_ICON_CELL_W &&
        my >= pos.y &&
        my < pos.y + DESKTOP_ICON_CELL_H
      ) {
        svc.openFSNode(icons[i].nodeId);
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
  ctx: AppContext,
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

  const cols = Math.max(
    1,
    Math.floor((ctx.width - FOLDER_PADDING) / FOLDER_ICON_CELL_W)
  );

  ctx.clear(WHITE);

  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];

    const pos = getFolderIconPos(icon, i, cols);
    const isSelected = selected === icon.nodeId;
    const isDropTgt = dropTarget?.nodeId === icon.nodeId;

    drawIcon(
      ctx,
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

  if (event.type === "mouseDown") {
    const mx = event.x!;
    const my = event.y!;

    let hitIcon: FinderIcon | null = null;
    let hitPos: { x: number; y: number } | null = null;
    for (let i = 0; i < icons.length; i++) {
      const pos = getFolderIconPos(icons[i], i, cols);
      if (
        mx >= pos.x &&
        mx < pos.x + FOLDER_ICON_CELL_W &&
        my >= pos.y &&
        my < pos.y + FOLDER_ICON_CELL_H
      ) {
        hitIcon = icons[i];
        hitPos = pos;
        break;
      }
    }

    if (hitIcon && hitPos) {
      setSelected(hitIcon.nodeId);
      const screenX = mx + originX;
      const screenY = my + originY;
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

  if (event.type === "mouseMove") {
    const screenX = event.x! + originX;
    const screenY = event.y! + originY;
    finderHandleMouseMove(app, screenX, screenY, svc);
  }

  if (event.type === "mouseUp") {
    const screenX = event.x! + originX;
    const screenY = event.y! + originY;
    finderHandleMouseUp(app, screenX, screenY, svc);
  }

  if (event.type === "doubleClick") {
    const mx = event.x!;
    const my = event.y!;
    if (st.drag) return;

    for (let i = 0; i < icons.length; i++) {
      const pos = getFolderIconPos(icons[i], i, cols);
      if (
        mx >= pos.x &&
        mx < pos.x + FOLDER_ICON_CELL_W &&
        my >= pos.y &&
        my < pos.y + FOLDER_ICON_CELL_H
      ) {
        svc.openFSNode(icons[i].nodeId);
        return;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Shared icon drawing
// ---------------------------------------------------------------------------

function drawIcon(
  ctx: AppContext,
  sprites: SpriteRegistry,
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
