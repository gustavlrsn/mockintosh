import { For, Show, createContext, createEffect, createSignal, onCleanup, onSettled, useContext } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import type { CanvasNode } from "../nodes";
import { getFocusManager } from "../focusContext";

export type OverlaySide = "bottom" | "top";
export type OverlayAlign = "start" | "end";

export interface OverlayLayer {
  id: number;
  x: number;
  y: number;
  /** Inset from the host's right edge. Set when `align` is `"end"`. */
  right?: number;
  modal: boolean;
  role?: string;
  render: () => JSX.Element;
  onDismiss?: () => void;
  onKeyDown?: (key: string) => void;
}

export interface OverlayHostApi {
  show(layer: Omit<OverlayLayer, "id">): number;
  update(id: number, patch: Partial<Omit<OverlayLayer, "id">>): void;
  hide(id: number): void;
}

export const OverlayHostContext = createContext<OverlayHostApi | null>(null);

/** Root layer after the app tree so panels paint in screen space, not inside overflow:scroll. */
export function OverlayHost(props: { children?: JSX.Element }): JSX.Element {
  const [layers, setLayers] = createSignal<OverlayLayer[]>([]);
  let nextId = 1;

  const api: OverlayHostApi = {
    show(layer) {
      const id = nextId++;
      setLayers((prev) => [...prev, { ...layer, id }]);
      return id;
    },
    update(id, patch) {
      setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    },
    hide(id) {
      setLayers((prev) => prev.filter((l) => l.id !== id));
    },
  };

  const modalTop = () => {
    const list = layers();
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].modal) return list[i];
    }
    return undefined;
  };

  return (
    <OverlayHostContext value={api}>
      <box width="100%" height="100%">
        {props.children}
        <Show when={modalTop()}>
          <box
            semantic={{ name: "overlay-catcher", role: "presentation" }}
            position="absolute"
            left={0}
            top={0}
            width="100%"
            height="100%"
            onMouseDown={() => modalTop()?.onDismiss?.()}
          />
        </Show>
        <For each={layers()}>
          {(layer) => (
            <box
              semantic={{ name: "overlay-panel", role: layer.role ?? "dialog" }}
              position="absolute"
              left={layer.right === undefined ? layer.x : undefined}
              right={layer.right}
              top={layer.y}
              tabIndex={layer.modal ? 0 : undefined}
              onMouseDown={() => {}}
              onKeyDown={(key: string) => {
                if (key === "Escape") {
                  layer.onDismiss?.();
                  return;
                }
                layer.onKeyDown?.(key);
              }}
              ref={(el) => {
                if (!layer.modal) return;
                onSettled(() => {
                  try {
                    getFocusManager().focus(el);
                  } catch {
                    /* OverlayHost used outside createUI */
                  }
                });
              }}
            >
              {layer.render()}
            </box>
          )}
        </For>
      </box>
    </OverlayHostContext>
  );
}

export interface OverlayProps {
  open: boolean;
  onDismiss?: () => void;
  /** Outside click + Escape. Tooltip sets false. Default true. */
  modal?: boolean;
  side?: OverlaySide;
  /** Extra pixels away from the trigger on `side`. */
  offset?: number;
  /** `end` hangs the panel from the trigger's right edge. */
  align?: OverlayAlign;
  role?: string;
  onKeyDown?: (key: string) => void;
  trigger: JSX.Element;
  children?: JSX.Element;
}

function place(
  node: CanvasNode | null,
  side: OverlaySide,
  offset: number,
  align: OverlayAlign,
): { x: number; y: number; right?: number } {
  if (!node) return { x: 0, y: 0 };
  const y =
    side === "top" ? node.layout.y - offset : node.layout.y + node.layout.height + offset;
  if (align === "end") {
    let root: CanvasNode = node;
    while (root.parent) root = root.parent;
    const triggerRight = node.layout.x + node.layout.width;
    return { x: node.layout.x, y, right: Math.max(0, root.layout.width - triggerRight) };
  }
  return { x: node.layout.x, y };
}

/**
 * Anchored in-window layer. createUI installs OverlayHost so the panel is a
 * sibling of the app tree (escapes overflow:scroll). Without a host, the
 * panel is a local absolute child of the trigger.
 */
export function Overlay(props: OverlayProps): JSX.Element {
  const host = useContext(OverlayHostContext);
  let triggerNode: CanvasNode | null = null;
  let triggerHeight = 0;
  let layerId = 0;

  const side = () => props.side ?? "bottom";
  const offset = () => props.offset ?? 0;
  const modal = () => props.modal !== false;

  createEffect(
    () => ({
      open: props.open,
      modal: props.modal !== false,
      side: props.side ?? "bottom",
      offset: props.offset ?? 0,
      align: props.align ?? "start",
      role: props.role,
      children: props.children,
      onDismiss: props.onDismiss,
      onKeyDown: props.onKeyDown,
    }),
    (snap) => {
      if (!host) return;
      if (!snap.open) {
        if (layerId !== 0) {
          host.hide(layerId);
          layerId = 0;
        }
        return;
      }
      const next = {
        ...place(triggerNode, snap.side, snap.offset, snap.align),
        modal: snap.modal,
        role: snap.role,
        render: () => snap.children,
        onDismiss: () => snap.onDismiss?.(),
        onKeyDown: snap.onKeyDown,
      };
      if (layerId === 0) layerId = host.show(next);
      else host.update(layerId, next);
    },
  );

  onCleanup(() => {
    if (host && layerId !== 0) host.hide(layerId);
    layerId = 0;
  });

  return (
    <box
      ref={(el) => {
        triggerNode = el;
        triggerHeight = el.layout.height;
      }}
      alignSelf="flex-start"
      position="relative"
    >
      {props.trigger}
      <Show when={props.open && !host}>
        <box
          semantic={{ name: "overlay-panel", role: props.role ?? "dialog" }}
          position="absolute"
          left={0}
          top={side() === "top" ? undefined : triggerHeight + offset()}
          bottom={side() === "top" ? offset() : undefined}
          tabIndex={modal() ? 0 : undefined}
          onKeyDown={(key: string) => {
            if (key === "Escape") {
              props.onDismiss?.();
              return;
            }
            props.onKeyDown?.(key);
          }}
        >
          {props.children}
        </box>
      </Show>
    </box>
  );
}
