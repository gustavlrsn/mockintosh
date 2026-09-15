import { createSignal, createEffect, createMemo, onCleanup, onMount, type JSX } from "solid-js";
import { Show } from "solid-js";
import { getFocusManager } from "../focusContext";
import { useUIServices } from "../services";
import { measureText } from "../fonts/bridge";
import type { CanvasNode, Modifiers } from "../nodes";

export interface TextInputProps {
  name?: string;
  onHistory?: (direction: -1 | 1) => void;
  onInterrupt?: () => void;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  font?: string;
  width?: number;
  height?: number;
  /** Inner padding; also used for click→caret mapping. Default 2. */
  padding?: number;
  /** Omit the field border (e.g. inline rename over a label). */
  borderless?: boolean;
  disabled?: boolean;
  password?: boolean;
  autoFocus?: boolean;
  selectAllOnFocus?: boolean;
  /**
   * Caret index on mount (e.g. from a click on a label entering edit mode).
   * When set, overrides the default end-of-text caret and disables the first
   * `selectAllOnFocus` pass (so the click position wins).
   */
  initialCaretIndex?: number;
}

export function TextInput(props: TextInputProps): JSX.Element {
  let rootNode: CanvasNode | null = null;

  // Capture focus manager at init time — useContext only works during
  // component initialization, not inside event callbacks.
  const focusManager = getFocusManager();
  const { clipboard } = useUIServices();

  const initialLen = props.value.length;
  const initialCaret =
    props.initialCaretIndex !== undefined
      ? Math.max(0, Math.min(initialLen, Math.floor(props.initialCaretIndex)))
      : initialLen;
  const [cursorPos, setCursorPos] = createSignal(initialCaret);
  const [selStart, setSelStart] = createSignal<number | null>(null);
  const [selEnd, setSelEnd] = createSignal<number | null>(null);
  const [cursorVisible, setCursorVisible] = createSignal(true);
  const [isFocused, setIsFocused] = createSignal(false);

  const fontName = () => props.font ?? "body";
  const pad = () => props.padding ?? 2;
  const bordered = () => !props.borderless;
  const borderW = () => (bordered() ? 1 : 0);
  const fieldWidth = () => props.width ?? 120;
  const fieldHeight = () => props.height ?? 16;
  const innerTextH = () => Math.max(1, fieldHeight() - (pad() + borderW()) * 2);
  const contentWidth = () => Math.max(1, fieldWidth() - (pad() + borderW()) * 2);
  /** Pointer x (border-box local) → x within the content box. */
  const localToContentX = (lx: number) => lx - borderW() - pad();
  /** Horizontal pan so the caret stays inside the clipped content box. */
  const [scrollX, setScrollX] = createSignal(0);

  // --- Focus management ---
  let isInitialFocus = true;

  /** Caret index where the current pointer gesture started (mousedown). */
  let dragAnchorIndex = 0;
  /** True after onDrag — suppresses onClick so it does not clear a drag selection. */
  let didPointerDrag = false;

  function handleFocus(): void {
    setIsFocused(true);
    setCursorVisible(true);
    if (props.selectAllOnFocus && isInitialFocus) {
      isInitialFocus = false;
      if (props.initialCaretIndex === undefined) {
        setSelStart(0);
        setSelEnd(props.value.length);
        setCursorPos(props.value.length);
      }
    }
  }

  function handleBlur(): void {
    setIsFocused(false);
    props.onBlur?.();
  }

  onMount(() => {
    if (props.autoFocus) {
      Promise.resolve().then(() => {
        if (rootNode) focusManager.focus(rootNode);
      });
    }
  });

  // Cursor blink — the signal update triggers setProperty in the renderer,
  // which calls the repaint hook automatically. No explicit scheduleRender needed.
  createEffect(() => {
    if (!isFocused()) return;
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    onCleanup(() => clearInterval(id));
  });

  const resetBlink = () => setCursorVisible(true);

  /**
   * Parents may replace `value` without remounting (ChatGippity send,
   * Terminal submit). The caret is local state — clamp it so Backspace
   * still deletes instead of walking phantom positions past the end.
   */
  createEffect(() => {
    const len = props.value.length;
    if (cursorPos() > len) setCursorPos(len);
    const ss = selStart();
    const se = selEnd();
    if (ss === null || se === null) return;
    if (Math.min(ss, se) >= len || ss === se) {
      setSelStart(null);
      setSelEnd(null);
      return;
    }
    if (ss > len) setSelStart(len);
    if (se > len) setSelEnd(len);
  });

  // --- Display text ---
  const displayValue = () =>
    props.password ? "\u2022".repeat(props.value.length) : props.value;

  // --- Pixel offset helpers ---
  function charOffsetToPixels(index: number): number {
    const sub = displayValue().slice(0, index);
    return measureText(sub, fontName());
  }

  function pixelsToCharIndex(px: number): number {
    const text = displayValue();
    let accumulated = 0;
    for (let i = 0; i < text.length; i++) {
      const cw = measureText(text[i], fontName());
      if (px < accumulated + cw / 2) return i;
      accumulated += cw;
    }
    return text.length;
  }

  function selectWordAtIndex(idx: number): void {
    const text = props.value;
    let start = idx;
    let end = idx;
    while (start > 0 && /\S/.test(text[start - 1])) start--;
    while (end < text.length && /\S/.test(text[end])) end++;
    setSelStart(start);
    setSelEnd(end);
    setCursorPos(end);
  }

  // --- Text insertion ---
  function insertText(chars: string): void {
    if (props.disabled) return;
    resetBlink();
    const text = props.value;
    const cur = cursorPos();
    const ss = selStart();
    const se = selEnd();

    if (ss !== null && se !== null) {
      const lo = Math.min(ss, se), hi = Math.max(ss, se);
      props.onChange(text.slice(0, lo) + chars + text.slice(hi));
      setCursorPos(lo + chars.length);
      setSelStart(null); setSelEnd(null);
    } else {
      props.onChange(text.slice(0, cur) + chars + text.slice(cur));
      setCursorPos(cur + chars.length);
    }
  }

  // --- Keyboard ---
  function handleKeyDown(key: string, mod: Modifiers): void {
    if (props.onInterrupt && mod.ctrl && key.toLowerCase() === "c") { props.onInterrupt(); return; }
    if (!props.disabled && props.onHistory && (key === "ArrowUp" || key === "ArrowDown")) { props.onHistory(key === "ArrowUp" ? -1 : 1); setCursorPos(props.value.length); setSelStart(null); setSelEnd(null); resetBlink(); return; }
    if (props.disabled) return;
    resetBlink();
    const text = props.value;
    const cur = cursorPos();
    const ss = selStart();
    const se = selEnd();

    if (key === "ArrowLeft") {
      if (mod.shift) {
        const anchor = ss ?? cur;
        const newCur = Math.max(0, cur - 1);
        if (newCur < anchor) { setSelStart(newCur); setSelEnd(anchor); }
        else { setSelStart(anchor); setSelEnd(newCur); }
        setCursorPos(newCur);
      } else {
        setSelStart(null); setSelEnd(null);
        setCursorPos(ss !== null ? Math.min(ss, se ?? ss) : Math.max(0, cur - 1));
      }
      return;
    }
    if (key === "ArrowRight") {
      if (mod.shift) {
        const anchor = ss ?? cur;
        const newCur = Math.min(text.length, cur + 1);
        if (newCur > anchor) { setSelStart(anchor); setSelEnd(newCur); }
        else { setSelStart(newCur); setSelEnd(anchor); }
        setCursorPos(newCur);
      } else {
        setSelStart(null); setSelEnd(null);
        setCursorPos(se !== null ? Math.max(ss ?? se, se) : Math.min(text.length, cur + 1));
      }
      return;
    }
    if (key === "Home") {
      setSelStart(null); setSelEnd(null); setCursorPos(0);
      return;
    }
    if (key === "End") {
      setSelStart(null); setSelEnd(null); setCursorPos(text.length);
      return;
    }
    if (key === "Backspace") {
      if (ss !== null && se !== null) {
        const lo = Math.min(ss, se), hi = Math.max(ss, se);
        props.onChange(text.slice(0, lo) + text.slice(hi));
        setCursorPos(lo);
        setSelStart(null); setSelEnd(null);
      } else if (cur > 0) {
        props.onChange(text.slice(0, cur - 1) + text.slice(cur));
        setCursorPos(cur - 1);
      }
      return;
    }
    if (key === "Delete") {
      if (ss !== null && se !== null) {
        const lo = Math.min(ss, se), hi = Math.max(ss, se);
        props.onChange(text.slice(0, lo) + text.slice(hi));
        setCursorPos(lo);
        setSelStart(null); setSelEnd(null);
      } else if (cur < text.length) {
        props.onChange(text.slice(0, cur) + text.slice(cur + 1));
      }
      return;
    }
    if ((mod.ctrl || mod.meta) && key.toLowerCase() === "a") {
      setSelStart(0); setSelEnd(text.length); setCursorPos(text.length);
      return;
    }
    if ((mod.ctrl || mod.meta) && key.toLowerCase() === "c") {
      if (ss !== null && se !== null) {
        const lo = Math.min(ss, se), hi = Math.max(ss, se);
        clipboard?.writeText(text.slice(lo, hi)).catch(() => {});
      }
      return;
    }

    if (key === "Enter" || key === "Return") {
      props.onSubmit?.(props.value);
      return;
    }
    if (key === "Escape") {
      props.onCancel?.();
      return;
    }

    // Skip modifier-key combos (Ctrl+X, Meta+X, etc.)
    if (mod.ctrl || mod.meta) return;

    // Printable characters: host sends `keypress` after `keydown` (see solidMain);
    // insert only there so each key yields one character.
  }

  function handleKeyPress(char: string): void {
    if (props.disabled) return;
    if (char.length !== 1) return;
    insertText(char);
  }

  // --- Mouse ---
  function indexAtPointer(lx: number): number {
    return pixelsToCharIndex(localToContentX(lx) + scrollX());
  }

  function handleMouseDown(lx: number, _ly: number): void {
    if (props.disabled) return;
    didPointerDrag = false;
    if (rootNode) focusManager.focus(rootNode);
    const idx = indexAtPointer(lx);
    dragAnchorIndex = idx;
    setCursorPos(idx);
    setSelStart(null);
    setSelEnd(null);
  }

  function handleClick(lx: number): void {
    if (didPointerDrag) {
      didPointerDrag = false;
      return;
    }
    if (rootNode) focusManager.focus(rootNode);
    const idx = indexAtPointer(lx);
    setCursorPos(idx);
    setSelStart(null); setSelEnd(null);
  }

  function handleDoubleClick(lx: number): void {
    if (rootNode) focusManager.focus(rootNode);
    const idx = indexAtPointer(lx);
    selectWordAtIndex(idx);
  }

  function handleDrag(lx: number): void {
    didPointerDrag = true;
    const idx = indexAtPointer(lx);
    const lo = Math.min(dragAnchorIndex, idx);
    const hi = Math.max(dragAnchorIndex, idx);
    if (lo === hi) {
      setSelStart(null);
      setSelEnd(null);
    } else {
      setSelStart(lo);
      setSelEnd(hi);
    }
    setCursorPos(idx);
  }

  // Keep the insertion point inside the clipped content box.
  createEffect(() => {
    const caret = charOffsetToPixels(cursorPos());
    const view = contentWidth();
    const maxScroll = Math.max(0, charOffsetToPixels(displayValue().length) - view);
    setScrollX((prev) => {
      let next = Math.min(prev, maxScroll);
      if (caret < next) next = caret;
      if (caret + 1 > next + view) next = caret + 1 - view;
      return Math.max(0, Math.min(maxScroll, next));
    });
  });

  // --- Computed pixel positions ---
  // Nudge 1px left so the bar sits in the gap between glyphs (metrics skew it right).
  const cursorPixelX = () =>
    Math.max(pad(), charOffsetToPixels(cursorPos()) + pad() - 1) - scrollX();
  const selPixelStart = () => {
    const ss = selStart(), se = selEnd();
    if (ss === null || se === null) return 0;
    return charOffsetToPixels(Math.min(ss, se)) + pad() - scrollX();
  };
  const selPixelWidth = () => {
    const ss = selStart(), se = selEnd();
    if (ss === null || se === null) return 0;
    const lo = Math.min(ss, se), hi = Math.max(ss, se);
    return charOffsetToPixels(hi) - charOffsetToPixels(lo);
  };

  const showPlaceholder = () => !props.value && !isFocused() && !!props.placeholder;

  /** Non-empty character range when the user has an active selection. */
  const selectionRange = createMemo((): { lo: number; hi: number } | null => {
    const ss = selStart(), se = selEnd();
    if (ss === null || se === null) return null;
    const lo = Math.min(ss, se);
    const hi = Math.max(ss, se);
    if (lo >= hi) return null;
    return { lo, hi };
  });

  // Own memos — `<Show when>{(v) => …}</Show>` runs the callback untracked,
  // so a slice captured on the first drag tick would never grow.
  const selectedSlice = createMemo(() => {
    const r = selectionRange();
    return r ? displayValue().slice(r.lo, r.hi) : "";
  });
  const selectedSliceLeft = createMemo(() => {
    const r = selectionRange();
    return r ? pad() + charOffsetToPixels(r.lo) - scrollX() : 0;
  });

  return (
    <box
      semantic={{ name: props.name, role: "textbox", value: props.value, password: props.password, enabled: !props.disabled }}
      ref={(el: CanvasNode) => { rootNode = el; }}
      width={fieldWidth()}
      height={fieldHeight()}
      background={0}
      borderColor={bordered() ? 1 : undefined}
      borderStyle={bordered() ? "solid" : undefined}
      borderWidth={bordered() ? 1 : 0}
      padding={pad()}
      justifyContent="center"
      overflow="hidden"
      tabIndex={props.disabled ? undefined : 0}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={(x: number, y: number) => handleMouseDown(x, y)}
      onClick={(x: number) => handleClick(x)}
      onDoubleClick={(x: number) => handleDoubleClick(x)}
      onDrag={(lx) => handleDrag(lx)}
      onKeyDown={(key: string, mod: Modifiers) => handleKeyDown(key, mod)}
      onKeyPress={(char: string) => handleKeyPress(char)}
    >
      <Show when={selStart() !== null}>
        <box
          position="absolute"
          left={selPixelStart()}
          top={pad()}
          width={selPixelWidth()}
          height={innerTextH()}
          background={1}
        />
      </Show>

      <Show when={!!displayValue()}>
        <text
          position="absolute"
          left={pad() - scrollX()}
          top={pad()}
          height={innerTextH()}
          font={fontName()}
          color={1}
          verticalAlign="middle"
        >
          {displayValue()}
        </text>
      </Show>

      {/* Selected slice in white so it stays visible on the black highlight bar */}
      <Show when={selectedSlice()}>
        <text
          position="absolute"
          left={selectedSliceLeft()}
          top={pad()}
          height={innerTextH()}
          font={fontName()}
          color={0}
          verticalAlign="middle"
        >
          {selectedSlice()}
        </text>
      </Show>

      <Show when={isFocused() && cursorVisible() && selStart() === null}>
        <box
          position="absolute"
          left={cursorPixelX()}
          top={pad()}
          width={1}
          height={innerTextH()}
          background={1}
        />
      </Show>

      <Show when={showPlaceholder()}>
        <text
          position="absolute"
          left={pad()}
          top={pad()}
          height={innerTextH()}
          font={fontName()}
          color={1}
          verticalAlign="middle"
        >
          {props.placeholder}
        </text>
      </Show>
    </box>
  );
}
