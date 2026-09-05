/**
 * Temporary host that runs a pre-Solid SystemApp inside a <raster> node.
 * Deleted in Phase 6 once every app is a Solid component.
 */

import { onCleanup, type JSX } from "solid-js";
import { AppBuilder } from "../../../lib/canvas/AppBuilder";
import { WindowContext } from "../../../lib/toolbox/WindowContext";
import { HitRegionMap } from "../../../lib/canvas/HitRegion";
import type { SystemApp } from "../../../lib/canvas/AppRegistry";
import type { WindowRecord } from "../../../lib/toolbox/WindowRecord";
import type { OSEvent } from "../../../lib/toolbox/EventManager";
import { FindControl, TrackControl } from "../../../lib/toolbox/ControlManager";
import {
  makePoint,
  makeRect,
  cloneRect,
  patCopy,
  blackColor,
  whiteColor,
  type GrafPort,
} from "@mockintosh/quickdraw";
import { useOS } from "../context";
import { useWindow } from "../windowContext";
import { createOSServices } from "../../../lib/canvas/OSServices";
import { createAppStorage } from "../appStorage";
export interface LegacyAppHostProps {
  app: SystemApp;
}

function makeWindowPort(screen: GrafPort, x: number, y: number, w: number, h: number): GrafPort {
  const screenW = screen.portBits.rowBytes;
  const screenH = (screen.portBits.baseAddr.length / screenW) | 0;
  const portRect = makeRect(0, 0, h, w);
  const bounds = makeRect(-y, -x, screenH - y, screenW - x);
  return {
    device: 0,
    portBits: {
      baseAddr: screen.portBits.baseAddr,
      rowBytes: screen.portBits.rowBytes,
      bounds: cloneRect(bounds),
    },
    portRect: cloneRect(portRect),
    visRgn: { rgn: { rgnSize: 10, rgnBBox: cloneRect(portRect) } },
    clipRgn: { rgn: { rgnSize: 10, rgnBBox: cloneRect(portRect) } },
    bkPat: new Uint8Array(8),
    fillPat: new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
    pnLoc: { v: 0, h: 0 },
    pnSize: { v: 1, h: 1 },
    pnMode: patCopy,
    pnPat: new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
    pnVis: 0,
    txFont: 0,
    txFace: 0,
    txMode: 1,
    txSize: 0,
    spExtra: 0,
    fgColor: blackColor,
    bkColor: whiteColor,
    colrBit: 0,
    patStretch: 0,
    picSave: null,
    rgnSave: null,
    polySave: null,
    grafProcs: screen.grafProcs,
  };
}

function stubWindow(id: string, appId: string, title: string): WindowRecord {
  return {
    id,
    title,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    contentHeight: 100,
    contentWidth: 100,
    scrollY: 0,
    scrollX: 0,
    active: true,
    appId,
    props: {},
    scrollable: false,
    resizable: false,
    minWidth: 100,
    minHeight: 60,
    windowKind: "document",
    controlList: [],
    scrollBarControls: [],
    updateRect: null,
  };
}

export function LegacyAppHost(props: LegacyAppHostProps): JSX.Element {
  const os = useOS();
  const win = useWindow();
  const builder = new AppBuilder();
  const hits = new HitRegionMap();
  const record = stubWindow(win.id, props.app.id, win.win.title);
  let lastActive = win.isActive();
  let origin = { x: 0, y: 0 };
  let trackEnd: ((pt: { h: number; v: number }) => number) | null = null;

  const toolboxOS = createOSServices({
    openWindow: (appId: string, p?: Record<string, unknown>) => os.openApp(appId, p),
    closeWindow: (id: string) => os.closeWindow(id),
    showDialog: (opts) => os.showDialog(opts),
    storage: createAppStorage(os.fs, props.app.id),
  });

  const appProps: Record<string, unknown> = {
    ...win.win.props,
    _sprites: os.sprites,
    _fs: os.fs,
    _os: toolboxOS,
    _openFSNode: (nodeId: string) => os.openFSNode(nodeId),
    _openWindow: (type: string, _t: string, payload: Record<string, unknown>) =>
      os.openApp(type, payload),
    getSprite: (name: string) => os.sprites.get(name),
    storage: toolboxOS.storage,
    env: { origin: typeof location !== "undefined" ? location.origin : "" },
  };

  builder.setRenderFunction(() => os.scheduleRepaint());
  props.app.onOpen?.(builder, appProps);

  onCleanup(() => {
    props.app.onClose?.(builder);
    builder.destroy();
  });

  function dispatch(event: OSEvent): void {
    if (!props.app.onEvent) return;
    builder.resetForRender();
    props.app.onEvent(builder, event, appProps, {
      width: win.width(),
      height: win.height(),
      scrollY: win.scrollY(),
    });
    builder.flushEffects();
  }

  function screen(lx: number, ly: number): { x: number; y: number } {
    return { x: origin.x + lx, y: origin.y + ly };
  }

  function paint(screenPort: unknown, rect: { x: number; y: number; width: number; height: number }): void {
    origin = { x: rect.x, y: rect.y };
    const port = makeWindowPort(screenPort as GrafPort, rect.x, rect.y, rect.width, rect.height);
    record.port = port;
    record.width = win.win.width;
    record.height = win.win.height;
    record.scrollY = win.win.scrollY;
    record.active = win.isActive();

    if (lastActive !== record.active) {
      dispatch({ type: record.active ? "activate" : "deactivate" });
      lastActive = record.active;
    }

    hits.clear();
    const ctx = new WindowContext(
      port,
      0,
      0,
      rect.width,
      rect.height,
      0,
      0,
      hits,
      undefined,
      { width: win.win.minWidth ?? 100, height: win.win.minHeight ?? 60 },
      { width: win.win.width, height: win.win.height },
      win.win.contentTopInset ?? 0,
      win.win.scrollY,
      win.win.scrollX,
      rect.x,
      rect.y,
      record
    );

    builder.resetForRender();
    props.app.render(builder, ctx, appProps);
    builder.flushEffects();

    if (props.app.getContentHeight) {
      builder.resetForRender();
      const h = props.app.getContentHeight(builder, appProps, {
        width: rect.width,
        height: rect.height,
      });
      if (typeof h === "number" && h !== win.win.contentHeight) {
        win.setContentSize(win.win.contentWidth, h);
      }
    }
    if (props.app.getInfoBar) {
      builder.resetForRender();
      const bar = props.app.getInfoBar(builder, appProps);
      win.setInfoBar(bar ?? null);
    }
    if (props.app.getMenubar) {
      builder.resetForRender();
      const menus = props.app.getMenubar(builder, appProps);
      if (menus) win.setMenus(menus);
    }
    if (props.app.getContentTopInset) {
      builder.resetForRender();
      const inset = props.app.getContentTopInset(builder, appProps, {
        width: rect.width,
        height: rect.height,
      });
      if (typeof inset === "number") win.setContentTopInset(inset);
    }
  }

  return (
    <raster
      width="100%"
      height="100%"
      tabIndex={0}
      onPaint={paint}
      onMouseDown={(lx, ly) => {
        const pt = makePoint(lx, ly);
        const fc = FindControl(pt, record);
        if (fc.theControl && record.port) {
          const result = TrackControl(fc.theControl, pt, record.port);
          trackEnd = typeof result === "function" ? result : result.onTrackEnd;
          os.scheduleRepaint();
          return;
        }
        const s = screen(lx, ly);
        hits.handleMouseDown(s.x, s.y);
        dispatch({ type: "mouseDown", x: lx, y: ly });
      }}
      onMouseUp={(lx, ly) => {
        if (trackEnd) {
          trackEnd(makePoint(lx, ly));
          trackEnd = null;
          os.scheduleRepaint();
          return;
        }
        const s = screen(lx, ly);
        hits.handleMouseUp(s.x, s.y);
        dispatch({ type: "mouseUp", x: lx, y: ly });
      }}
      onDrag={(lx, ly, gx, gy) => {
        hits.handleMouseMove(gx, gy);
        dispatch({ type: "mouseMove", x: lx, y: ly });
      }}
      onDoubleClick={(lx, ly) => {
        const s = screen(lx, ly);
        hits.handleDoubleClick(s.x, s.y);
        dispatch({ type: "doubleClick", x: lx, y: ly });
      }}
      onScroll={(dy) => dispatch({ type: "scroll", deltaY: dy, x: 0, y: 0 })}
      onKeyDown={(key, mods) =>
        dispatch({
          type: "keyDown",
          key,
          shiftKey: mods.shift,
          ctrlKey: mods.ctrl,
          altKey: mods.alt,
          metaKey: mods.meta,
        })
      }
    />
  );
}
