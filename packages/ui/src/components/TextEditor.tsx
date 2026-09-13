import {createSignal, createMemo, createEffect, untrack, For, Show, type JSX} from "solid-js";
import {getFocusManager} from "../focusContext";
import {useUIServices} from "../services";
import {measureText} from "../fonts/bridge";
import type {CanvasNode, Modifiers} from "../nodes";

export interface TextEditorProps {
  name?: string; value: string; onChange(value: string): void;
  width: number; height: number; disabled?: boolean; line?: number;
}
/** Multiline text editing in the canvas renderer. The document owner controls
 * saving/revisions; this widget owns only selection, caret, and viewport. */
export function TextEditor(props: TextEditorProps): JSX.Element {
  const focus = getFocusManager(), {clipboard} = useUIServices();
  let node: CanvasNode;
  const [caret, setCaret] = createSignal(0), [anchor, setAnchor] = createSignal(0);
  const [top, setTop] = createSignal(0), [left, setLeft] = createSignal(0), [focused, setFocused] = createSignal(false);
  const charWidth = measureText("M", "mono"), lineHeight = 14;
  const rows = () => Math.max(1, Math.floor((props.height - 8) / lineHeight));
  const columns = () => Math.max(1, Math.floor((props.width - 8) / charWidth));
  const lines = createMemo(() => props.value.split("\n"));
  const offsets = createMemo(() => { let offset = 0; return lines().map(line => { const start = offset; offset += line.length + 1; return start; }); });
  const location = (index: number) => { const row = Math.max(0, offsets().findIndex((start, row) => index <= start + lines()[row].length)); return {row, column: index - offsets()[row]}; };
  const indexAt = (row: number, column: number) => { row = Math.max(0, Math.min(lines().length - 1, row)); return offsets()[row] + Math.max(0, Math.min(lines()[row].length, column)); };
  function move(index: number, extend = false) {
    index = Math.max(0, Math.min(props.value.length, index));
    setCaret(index); if (!extend) setAnchor(index);
    const {row, column} = location(index);
    setTop(t => Math.max(0, row < t ? row : row >= t + rows() ? row - rows() + 1 : t));
    setLeft(l => Math.max(0, column < l ? column : column >= l + columns() ? column - columns() + 1 : l));
  }
  createEffect(() => { props.value; if (caret() > props.value.length) move(props.value.length); });
  createEffect(() => { const line = props.line; if (line !== undefined) untrack(() => move(indexAt(line - 1, 0))); });
  const range = () => ({lo: Math.min(caret(), anchor()), hi: Math.max(caret(), anchor())});
  function insert(text: string) {
    if (props.disabled) return;
    const {lo, hi} = range();
    text = text.replace(/\r\n?/g, "\n").replace(/\t/g, "  ");
    props.onChange(props.value.slice(0, lo) + text + props.value.slice(hi));
    move(lo + text.length);
  }
  function key(key: string, mods: Modifiers) {
    if (props.disabled) return;
    const command = mods.meta || mods.ctrl, {lo, hi} = range(), at = location(caret());
    if (command) {
      if (key.toLowerCase() === "a") { setAnchor(0); move(props.value.length, true); }
      if (key.toLowerCase() === "c" || key.toLowerCase() === "x") {
        void clipboard?.writeText(props.value.slice(lo, hi)).catch(() => {});
        if (key.toLowerCase() === "x" && clipboard) insert("");
      }
      return;
    }
    if (key === "ArrowLeft") move(caret() - 1, mods.shift);
    else if (key === "ArrowRight") move(caret() + 1, mods.shift);
    else if (key === "ArrowUp") move(indexAt(at.row - 1, at.column), mods.shift);
    else if (key === "ArrowDown") move(indexAt(at.row + 1, at.column), mods.shift);
    else if (key === "Home") move(indexAt(at.row, 0), mods.shift);
    else if (key === "End") move(indexAt(at.row, lines()[at.row].length), mods.shift);
    else if (key === "Enter") insert("\n" + (lines()[at.row].match(/^ */)?.[0] ?? ""));
    else if (key === "Tab") insert("  ");
    else if (key === "Backspace" || key === "Delete") {
      if (lo === hi) setAnchor(key === "Backspace" ? Math.max(0, caret() - 1) : Math.min(props.value.length, caret() + 1));
      insert("");
    }
  }
  function pointer(x: number, y: number, extend = false) {
    focus.focus(node);
    move(indexAt(top() + Math.floor((y - 4) / lineHeight), left() + Math.round((x - 4) / charWidth)), extend);
  }
  return <box ref={n => node = n} semantic={{name: props.name, role: "textbox", value: props.value, enabled: !props.disabled}}
    width={props.width} height={props.height} borderWidth={1} borderColor={1} background={0} overflow="hidden" tabIndex={0}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    onMouseDown={(x, y) => pointer(x, y)} onDrag={(x, y) => pointer(x, y, true)}
    onScroll={delta => setTop(t => Math.max(0, Math.min(lines().length - rows(), t + Math.sign(delta) * 3)))}
    onKeyDown={key} onKeyPress={insert}>
    <For each={lines().slice(top(), top() + rows())}>{(line, row) => {
      const start = () => offsets()[top() + row()];
      const selectedStart = () => Math.max(left(), range().lo - start());
      const selectedEnd = () => Math.min(left() + columns(), line.length, range().hi - start());
      return <box position="absolute" left={4} top={4 + row() * lineHeight} width={props.width - 8} height={lineHeight}>
        <text font="mono">{line.slice(left(), left() + columns())}</text>
        <Show when={selectedEnd() > selectedStart()}>
          <box position="absolute" left={(selectedStart() - left()) * charWidth} top={0} width={(selectedEnd() - selectedStart()) * charWidth} height={lineHeight} background={1} />
          <text position="absolute" left={(selectedStart() - left()) * charWidth} top={0} font="mono" color={0}>{line.slice(selectedStart(), selectedEnd())}</text>
        </Show>
      </box>;
    }}</For>
    <Show when={focused()}><box position="absolute" left={4 + (location(caret()).column - left()) * charWidth} top={4 + (location(caret()).row - top()) * lineHeight} width={1} height={lineHeight} background={1} /></Show>
  </box>;
}
