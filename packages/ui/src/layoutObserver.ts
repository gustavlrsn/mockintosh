/**
 * `<box onLayout>` delivery. After each layout pass, boxes whose measured
 * size differs from the last one reported get their callback — deferred to
 * a microtask so a callback that writes signals never runs mid-layout.
 */
import type { CanvasNode, LayoutChangeFn, LayoutSize } from "./nodes";

const lastReported = new WeakMap<CanvasNode, LayoutSize>();

export function notifyLayoutChanges(root: CanvasNode): void {
  const pending: Array<{ onLayout: LayoutChangeFn; size: LayoutSize }> = [];
  collect(root, pending);
  if (pending.length === 0) return;
  queueMicrotask(() => {
    for (const { onLayout, size } of pending) onLayout(size);
  });
}

function collect(node: CanvasNode, pending: Array<{ onLayout: LayoutChangeFn; size: LayoutSize }>): void {
  const onLayout = node.props["onLayout"] as LayoutChangeFn | undefined;
  if (onLayout) {
    const { width, height } = node.layout;
    const prev = lastReported.get(node);
    if (!prev || prev.width !== width || prev.height !== height) {
      const size = { width, height };
      lastReported.set(node, size);
      pending.push({ onLayout, size });
    }
  }
  for (const child of node.children) collect(child, pending);
}
