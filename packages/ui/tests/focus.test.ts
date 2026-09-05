/**
 * Focus system unit tests.
 */

import { describe, it, expect, vi } from "vitest";
import { createFocusManager, applyAutoFocus } from "../src/focus";
import { createNode } from "../src/nodes";

function makeFocusableNode(tabIndex: number) {
  const node = createNode("box");
  node._eventHandlers.tabIndex = tabIndex;
  return node;
}

const MOD = { shift: false, ctrl: false, alt: false, meta: false };

describe("FocusManager — focus / blur", () => {
  it("focus() sets the focused node", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    root.children = [a];
    a.parent = root;

    const mgr = createFocusManager(root);
    mgr.focus(a);
    expect(mgr.focused).toBe(a);
  });

  it("blur() clears focused node", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    root.children = [a];
    a.parent = root;

    const mgr = createFocusManager(root);
    mgr.focus(a);
    mgr.blur();
    expect(mgr.focused).toBeNull();
  });

  it("onFocus fires when focused", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    const onFocus = vi.fn();
    a._eventHandlers.onFocus = onFocus;
    root.children = [a];
    a.parent = root;

    const mgr = createFocusManager(root);
    mgr.focus(a);
    expect(onFocus).toHaveBeenCalledOnce();
  });

  it("onBlur fires on old node when focus changes", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    const b = makeFocusableNode(1);
    const onBlur = vi.fn();
    a._eventHandlers.onBlur = onBlur;
    root.children = [a, b];
    a.parent = root;
    b.parent = root;

    const mgr = createFocusManager(root);
    mgr.focus(a);
    mgr.focus(b);
    expect(onBlur).toHaveBeenCalledOnce();
  });
});

describe("FocusManager — Tab navigation", () => {
  it("Tab moves focus to next element in tabIndex order", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    const b = makeFocusableNode(1);
    root.children = [a, b];
    a.parent = root;
    b.parent = root;

    const mgr = createFocusManager(root);
    mgr.focus(a);
    mgr.dispatchKeyboard("keydown", "Tab", MOD);
    expect(mgr.focused).toBe(b);
  });

  it("Tab wraps around from last to first", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    const b = makeFocusableNode(1);
    root.children = [a, b];
    a.parent = root;
    b.parent = root;

    const mgr = createFocusManager(root);
    mgr.focus(b);
    mgr.dispatchKeyboard("keydown", "Tab", MOD);
    expect(mgr.focused).toBe(a);
  });

  it("Shift+Tab moves backwards", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    const b = makeFocusableNode(1);
    root.children = [a, b];
    a.parent = root;
    b.parent = root;

    const mgr = createFocusManager(root);
    mgr.focus(b);
    mgr.dispatchKeyboard("keydown", "Tab", { ...MOD, shift: true });
    expect(mgr.focused).toBe(a);
  });

  it("non-focusable nodes are skipped", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    const notFocusable = createNode("box"); // no tabIndex
    const b = makeFocusableNode(1);
    root.children = [a, notFocusable, b];
    a.parent = root;
    notFocusable.parent = root;
    b.parent = root;

    const mgr = createFocusManager(root);
    mgr.focus(a);
    mgr.dispatchKeyboard("keydown", "Tab", MOD);
    expect(mgr.focused).toBe(b);
  });
});

describe("FocusManager — keyboard dispatch", () => {
  it("routes keydown to focused element", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    const handler = vi.fn();
    a._eventHandlers.onKeyDown = handler;
    root.children = [a];
    a.parent = root;

    const mgr = createFocusManager(root);
    mgr.focus(a);
    mgr.dispatchKeyboard("keydown", "Enter", MOD);
    expect(handler).toHaveBeenCalledWith("Enter", MOD);
  });

  it("does not dispatch when no element is focused", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    const handler = vi.fn();
    a._eventHandlers.onKeyDown = handler;
    root.children = [a];
    a.parent = root;

    const mgr = createFocusManager(root);
    // No focus call
    mgr.dispatchKeyboard("keydown", "Enter", MOD);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("applyAutoFocus", () => {
  it("focuses the first element with autoFocus", () => {
    const root = createNode("_root");
    const a = makeFocusableNode(0);
    const b = makeFocusableNode(1);
    b._eventHandlers.autoFocus = true;
    root.children = [a, b];
    a.parent = root;
    b.parent = root;

    const mgr = createFocusManager(root);
    applyAutoFocus(root, mgr);
    expect(mgr.focused).toBe(b);
  });
});
