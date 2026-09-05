import { measureText, type FontName } from "../fontAdapter";

const BLINK_INTERVAL_MS = 530;

export interface TextInputState {
  value: string;
  cursorPos: number;
  selectionStart: number;
  selectionEnd: number;
  focused: boolean;
  /** Timestamp of last user interaction — used to derive cursor blink phase. */
  _lastEditTime: number;
}

export function createTextInputState(initial: string = ""): TextInputState {
  return {
    value: initial,
    cursorPos: initial.length,
    selectionStart: 0,
    selectionEnd: 0,
    focused: false,
    _lastEditTime: Date.now(),
  };
}

function hasSelection(state: TextInputState): boolean {
  return state.selectionStart !== state.selectionEnd;
}

function getSelectionRange(state: TextInputState): [number, number] {
  return state.selectionStart <= state.selectionEnd
    ? [state.selectionStart, state.selectionEnd]
    : [state.selectionEnd, state.selectionStart];
}

function clearSelection(state: TextInputState) {
  state.selectionStart = state.cursorPos;
  state.selectionEnd = state.cursorPos;
}

function deleteSelection(state: TextInputState): boolean {
  if (!hasSelection(state)) return false;
  const [lo, hi] = getSelectionRange(state);
  state.value = state.value.slice(0, lo) + state.value.slice(hi);
  state.cursorPos = lo;
  clearSelection(state);
  return true;
}

function selectAll(state: TextInputState) {
  state.selectionStart = 0;
  state.selectionEnd = state.value.length;
  state.cursorPos = state.value.length;
}

function touchEditTime(state: TextInputState) {
  state._lastEditTime = Date.now();
}

function isCursorVisible(state: TextInputState): boolean {
  const elapsed = Date.now() - state._lastEditTime;
  return elapsed % (BLINK_INTERVAL_MS * 2) < BLINK_INTERVAL_MS;
}

function charIndexAtX(
  text: string,
  localX: number,
  font: FontName = "body"
): number {
  if (localX <= 0) return 0;
  for (let i = 1; i <= text.length; i++) {
    const w = measureText(text.substring(0, i), font);
    const prevW = i > 0 ? measureText(text.substring(0, i - 1), font) : 0;
    const midpoint = prevW + (w - prevW) / 2;
    if (localX < midpoint) return i - 1;
  }
  return text.length;
}

function findWordAt(text: string, pos: number): [number, number] {
  let start = pos;
  let end = pos;
  while (start > 0 && text[start - 1] !== " ") start--;
  while (end < text.length && text[end] !== " ") end++;
  return [start, end];
}

/**
 * Insert pasted text at the current cursor position, replacing any selection.
 * Returns true if the state changed.
 */
export function handleTextInputPaste(
  state: TextInputState,
  text: string
): boolean {
  if (!text) return false;
  touchEditTime(state);
  deleteSelection(state);
  state.value =
    state.value.slice(0, state.cursorPos) +
    text +
    state.value.slice(state.cursorPos);
  state.cursorPos += text.length;
  clearSelection(state);
  return true;
}

/**
 * Handle key events for a text input. Returns whether the state changed.
 */
export function handleTextInputKey(
  state: TextInputState,
  key: string,
  code: string,
  shiftKey: boolean = false,
  metaKey: boolean = false,
  ctrlKey: boolean = false
): boolean {
  const cmdKey = metaKey || ctrlKey;

  touchEditTime(state);

  if (cmdKey && (key === "a" || key === "A")) {
    selectAll(state);
    return true;
  }

  if (cmdKey && (key === "c" || key === "C")) {
    return false;
  }

  if (cmdKey && (key === "x" || key === "X")) {
    return deleteSelection(state);
  }

  if (key === "Backspace") {
    if (hasSelection(state)) return deleteSelection(state);
    if (state.cursorPos > 0) {
      state.value =
        state.value.slice(0, state.cursorPos - 1) +
        state.value.slice(state.cursorPos);
      state.cursorPos--;
      clearSelection(state);
      return true;
    }
    return false;
  }

  if (key === "Delete") {
    if (hasSelection(state)) return deleteSelection(state);
    if (state.cursorPos < state.value.length) {
      state.value =
        state.value.slice(0, state.cursorPos) +
        state.value.slice(state.cursorPos + 1);
      clearSelection(state);
      return true;
    }
    return false;
  }

  if (key === "ArrowLeft") {
    if (cmdKey) {
      if (shiftKey) {
        state.selectionEnd = 0;
        state.cursorPos = 0;
      } else {
        state.cursorPos = 0;
        clearSelection(state);
      }
      return true;
    }
    if (shiftKey) {
      if (!hasSelection(state)) {
        state.selectionStart = state.cursorPos;
        state.selectionEnd = state.cursorPos;
      }
      if (state.cursorPos > 0) {
        state.cursorPos--;
        state.selectionEnd = state.cursorPos;
      }
      return true;
    }
    if (hasSelection(state)) {
      const [lo] = getSelectionRange(state);
      state.cursorPos = lo;
      clearSelection(state);
      return true;
    }
    if (state.cursorPos > 0) {
      state.cursorPos--;
      clearSelection(state);
      return true;
    }
    return false;
  }

  if (key === "ArrowRight") {
    if (cmdKey) {
      if (shiftKey) {
        state.selectionEnd = state.value.length;
        state.cursorPos = state.value.length;
      } else {
        state.cursorPos = state.value.length;
        clearSelection(state);
      }
      return true;
    }
    if (shiftKey) {
      if (!hasSelection(state)) {
        state.selectionStart = state.cursorPos;
        state.selectionEnd = state.cursorPos;
      }
      if (state.cursorPos < state.value.length) {
        state.cursorPos++;
        state.selectionEnd = state.cursorPos;
      }
      return true;
    }
    if (hasSelection(state)) {
      const [, hi] = getSelectionRange(state);
      state.cursorPos = hi;
      clearSelection(state);
      return true;
    }
    if (state.cursorPos < state.value.length) {
      state.cursorPos++;
      clearSelection(state);
      return true;
    }
    return false;
  }

  if (key === "Home") {
    if (shiftKey) {
      if (!hasSelection(state)) {
        state.selectionStart = state.cursorPos;
        state.selectionEnd = state.cursorPos;
      }
      state.cursorPos = 0;
      state.selectionEnd = 0;
      return true;
    }
    state.cursorPos = 0;
    clearSelection(state);
    return true;
  }

  if (key === "End") {
    if (shiftKey) {
      if (!hasSelection(state)) {
        state.selectionStart = state.cursorPos;
        state.selectionEnd = state.cursorPos;
      }
      state.cursorPos = state.value.length;
      state.selectionEnd = state.value.length;
      return true;
    }
    state.cursorPos = state.value.length;
    clearSelection(state);
    return true;
  }

  if (key.length === 1 && !cmdKey) {
    deleteSelection(state);
    state.value =
      state.value.slice(0, state.cursorPos) +
      key +
      state.value.slice(state.cursorPos);
    state.cursorPos++;
    clearSelection(state);
    return true;
  }

  return false;
}

/**
 * Handle a mouse click inside the text input.
 * `localX` is the x offset relative to the text input's left edge.
 */
export function handleTextInputClick(
  state: TextInputState,
  localX: number,
  shiftKey: boolean = false
): boolean {
  touchEditTime(state);
  const textLocalX = localX - 3;
  const idx = charIndexAtX(state.value, textLocalX);

  if (shiftKey) {
    if (!hasSelection(state)) {
      state.selectionStart = state.cursorPos;
    }
    state.selectionEnd = idx;
    state.cursorPos = idx;
  } else {
    state.cursorPos = idx;
    clearSelection(state);
  }
  return true;
}

/**
 * Handle a double-click to select the word at the click position.
 */
export function handleTextInputDoubleClick(
  state: TextInputState,
  localX: number
): boolean {
  touchEditTime(state);
  const textLocalX = localX - 3;
  const idx = charIndexAtX(state.value, textLocalX);
  const [start, end] = findWordAt(state.value, idx);
  state.selectionStart = start;
  state.selectionEnd = end;
  state.cursorPos = end;
  return true;
}

/**
 * Handle mouse drag to extend the selection.
 * `localX` is the x offset relative to the text input's left edge.
 */
export function handleTextInputDrag(
  state: TextInputState,
  localX: number
): boolean {
  const textLocalX = localX - 3;
  const idx = charIndexAtX(state.value, textLocalX);
  if (idx !== state.selectionEnd) {
    state.selectionEnd = idx;
    state.cursorPos = idx;
    return true;
  }
  return false;
}

export function textInputHitTest(
  x: number,
  y: number,
  inputX: number,
  inputY: number,
  width: number,
  height: number = 16
): boolean {
  return (
    x >= inputX && x < inputX + width && y >= inputY && y < inputY + height
  );
}

/**
 * The blink interval in ms, exported so main.tsx can drive a global
 * re-render timer at the same cadence.
 */
export const TEXT_CURSOR_BLINK_MS = BLINK_INTERVAL_MS;
