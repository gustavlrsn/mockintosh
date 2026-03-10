import lilSource from "../../reference/Decker/js/lil.js?raw";

export interface DeckerRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DeckerImageLike {
  size: { x: number; y: number };
  pix: Uint8Array;
}

export interface DeckerRuntimeObject {
  n?: string;
  t?: string;
  k?: unknown[];
  v?: unknown[];
  size?: { x: number; y: number };
  pix?: Uint8Array;
  [key: string]: unknown;
}

export type DeckerValue = unknown;
export type DeckerDeck = DeckerRuntimeObject;
export type DeckerCard = DeckerRuntimeObject;
export type DeckerWidget = DeckerRuntimeObject;
export type DeckerDict = DeckerRuntimeObject;

interface DeckerRuntimeExports {
  deck_read: (source: string) => DeckerDeck;
  deck_write: (deck: DeckerDeck, html?: boolean) => string;
  ifield: (obj: DeckerRuntimeObject, key: string) => DeckerValue;
  iwrite: (
    obj: DeckerRuntimeObject,
    key: DeckerValue,
    value: DeckerValue
  ) => DeckerValue;
  dget: (dict: DeckerDict, key: DeckerValue) => DeckerValue;
  lmn: (value: number) => DeckerValue;
  lms: (value: string) => DeckerValue;
  ls: (value: DeckerValue) => string;
  ln: (value: DeckerValue) => number;
  lb: (value: DeckerValue) => boolean;
  getpair: (value: DeckerValue) => DeckerRect;
  getrect: (value: DeckerValue) => DeckerRect;
  make_pair: (value: DeckerValue[]) => DeckerValue;
  image_is: (value: DeckerValue) => boolean;
  button_is: (value: DeckerValue) => boolean;
  field_is: (value: DeckerValue) => boolean;
  slider_is: (value: DeckerValue) => boolean;
  grid_is: (value: DeckerValue) => boolean;
  canvas_is: (value: DeckerValue) => boolean;
  contraption_is: (value: DeckerValue) => boolean;
  card_is: (value: DeckerValue) => boolean;
  deck_is: (value: DeckerValue) => boolean;
  widget_is: (value: DeckerValue) => boolean;
  prototype_is: (value: DeckerValue) => boolean;
  font_is: (value: DeckerValue) => boolean;
  font_write: (font: DeckerValue) => string;
  invoke_event_sync: (
    target: DeckerRuntimeObject,
    name: string,
    args: DeckerValue[]
  ) => DeckerValue;
  fire_event_async: (
    target: DeckerRuntimeObject,
    name: string,
    arg: DeckerValue
  ) => void;
  n_event: (target: DeckerRuntimeObject, args: DeckerValue[]) => DeckerValue;
  tick: (quota?: number) => boolean;
  NIL: DeckerValue;
  COLORS: number[];
  pal_pat: (
    palette: Uint8Array,
    pattern: number,
    x: number,
    y: number
  ) => number;
}

export interface DeckerCore {
  readDeck(source: string): DeckerDeck;
  writeDeck(deck: DeckerDeck, html?: boolean): string;
  getField(target: DeckerRuntimeObject, key: string): DeckerValue;
  setField(
    target: DeckerRuntimeObject,
    key: string,
    value: DeckerValue
  ): DeckerValue;
  getString(value: DeckerValue): string;
  getNumber(value: DeckerValue): number;
  getBoolean(value: DeckerValue): boolean;
  makeNumber(value: number): DeckerValue;
  makeString(value: string): DeckerValue;
  getPair(value: DeckerValue): DeckerRect;
  getRect(value: DeckerValue): DeckerRect;
  makePair(x: number, y: number): DeckerValue;
  dictValues<T = DeckerRuntimeObject>(dict: DeckerValue): T[];
  dictKeys(dict: DeckerValue): string[];
  cards(deck: DeckerDeck): DeckerCard[];
  widgets(card: DeckerCard): DeckerWidget[];
  isImage(value: DeckerValue): value is DeckerImageLike;
  isButton(value: DeckerValue): value is DeckerWidget;
  isField(value: DeckerValue): value is DeckerWidget;
  isSlider(value: DeckerValue): value is DeckerWidget;
  isGrid(value: DeckerValue): value is DeckerWidget;
  isCanvas(value: DeckerValue): value is DeckerWidget;
  isContraption(value: DeckerValue): value is DeckerWidget;
  isCard(value: DeckerValue): value is DeckerCard;
  isDeck(value: DeckerValue): value is DeckerDeck;
  isWidget(value: DeckerValue): value is DeckerWidget;
  isPrototype(value: DeckerValue): value is DeckerRuntimeObject;
  isFont(value: DeckerValue): boolean;
  /** Encode a Lil font object to a %%FNT0/%%FNT1 string (for font registration). */
  writeFontEncoded(font: DeckerValue): string;
  fireEvent(target: DeckerRuntimeObject, name: string, arg?: DeckerValue): void;
  invokeEvent(
    target: DeckerRuntimeObject,
    name: string,
    args?: DeckerValue[]
  ): void;
  invokeEventSync(
    target: DeckerRuntimeObject,
    name: string,
    args?: DeckerValue[]
  ): DeckerValue;
  /** Run one frame of the VM (handles sleep, pending state). Returns true if more work or sleep pending. */
  tick(quota?: number): boolean;
  /** Queue an event to run asynchronously; use with tick() loop for scripts that use sleep[]. */
  fireEventAsync(
    target: DeckerRuntimeObject,
    name: string,
    arg?: DeckerValue
  ): void;
  /** Current card index on the deck (numeric .card). */
  getCardIndex(deck: DeckerDeck): number;
  colors: readonly number[];
  samplePattern(
    palette: Uint8Array,
    pattern: number,
    x: number,
    y: number
  ): number;
  /** Optional: set callback for go_notify(deck, destIndex, transition, url, delay). */
  setGoNotify?: (fn: GoNotifyCallback) => void;
  /** Set a grid cell value by column and row index (0-based). */
  setGridCell?(
    grid: DeckerRuntimeObject,
    colIndex: number,
    rowIndex: number,
    cellValue: string
  ): void;
  /** Optional: set host primitives for alert, open, save, show, print, play. */
  setHostPrimitives?: (opts: {
    alert?: HostAlertCallback;
    open?: HostOpenCallback;
    save?: HostSaveCallback;
    show?: HostShowCallback;
    print?: HostPrintCallback;
    play?: HostPlayCallback;
  }) => void;
}

export type GoNotifyCallback = (
  deck: DeckerDeck,
  destIndex: number,
  transition: DeckerValue,
  url: DeckerValue,
  delay: DeckerValue
) => void;

let singleton: DeckerCore | null = null;
export type HostAlertCallback = (args: DeckerValue[]) => void;
export type HostOpenCallback = (args: DeckerValue[]) => DeckerValue | undefined;
export type HostSaveCallback = (args: DeckerValue[]) => DeckerValue | undefined;
export type HostShowCallback = (args: DeckerValue[]) => void;
export type HostPrintCallback = (args: DeckerValue[]) => void;
export type HostPlayCallback = (args: DeckerValue[]) => void;

const hostCallbacks: {
  goNotify: GoNotifyCallback;
  alert: HostAlertCallback;
  open: HostOpenCallback;
  save: HostSaveCallback;
  show: HostShowCallback;
  print: HostPrintCallback;
  play: HostPlayCallback;
} = {
  goNotify: () => {},
  alert: () => {},
  open: () => undefined,
  save: () => undefined,
  // Default show/print log to console as a development aid.
  show: (a) => { if (a && a.length) console.log("[decker show]", a[0]); },
  print: (a) => { if (a && a.length) console.log("[decker print]", a[0]); },
  play: () => {},
};

function createRuntime(): DeckerRuntimeExports {
  // Host primitives expected by lil.js primitives() — normally provided by decker.js.
  // go_notify invokes the host callback so the app can run transitions, etc.
  const hostPrimitives = `
const go_notify = (deck, dest, t, url, delay) => { hostCallbacks.goNotify(deck, dest, t, url, delay); };
const n_show = (a) => {
  if (!a || !a.length) return undefined;
  // Show listener output — forward to host callback so the app can surface it.
  hostCallbacks.show(a);
  a[0] = a[0] ?? null;
  return a[0];
};
const n_print = (a) => {
  if (!a || !a.length) return undefined;
  hostCallbacks.print(a);
  return a[0];
};
const n_panic = (a) => { if (!a || !a.length) return undefined; return a[0]; };
const n_play = (a) => { if (!a || !a.length) return undefined; hostCallbacks.play(a); return a[0]; };
const n_alert = (a) => { hostCallbacks.alert(a); return a && a.length ? a[0] : NIL; };
const n_open = (a) => { const r = hostCallbacks.open(a); return r !== undefined ? r : NIL; };
const n_save = (a) => { const r = hostCallbacks.save(a); return r !== undefined ? r : NIL; };
const field_notify = (field) => {};
`;
  const factory = new Function(
    "hostCallbacks",
    `${hostPrimitives}
${lilSource}
const invoke_event_sync = (target, name, args) => {
  const root = lmenv();
  primitives(root, parent_deck(target));
  constants(root);
  const block = lmblk();
  blk_op(block, op.DROP);
  blk_cat(block, event_invoke(target, name, lml(args), null, 1));
  pushstate(root);
  issue(root, block);
  let quota = 10000;
  while (running() && quota-- > 0) runop();
  const result = running() ? NIL : arg();
  popstate();
  return result;
};
const tick = (quota) => {
  if (typeof quota !== 'number' || quota <= 0) quota = 5000;
  if (sleep_frames > 0) { sleep_frames--; return true; }
  if (!running() && pending_popstate) { popstate(); pending_popstate = 0; }
  while (running() && quota > 0) {
    runop();
    quota--;
    if (sleep_frames > 0) return true;
  }
  // fire_async(..., nest=1) sets pending_popstate; pop after script finishes (matches decker.js interpret loop).
  if (!running() && pending_popstate) { popstate(); pending_popstate = 0; }
  return running() || sleep_frames > 0;
};
return { deck_read, deck_write, ifield, iwrite, dget, lmn, lms, ls, ln, lb, getpair, getrect, make_pair: (value) => lml(value), image_is, button_is, field_is, slider_is, grid_is, canvas_is, contraption_is, card_is, deck_is, widget_is, prototype_is, font_is, font_write, invoke_event_sync, fire_event_async, n_event, tick, NIL, COLORS, pal_pat };`
  ) as (cb: { goNotify: GoNotifyCallback }) => DeckerRuntimeExports;
  return factory(hostCallbacks);
}

function asDict(value: DeckerValue): DeckerDict | null {
  if (!value || typeof value !== "object") return null;
  const maybe = value as DeckerRuntimeObject;
  return Array.isArray(maybe.v) ? (maybe as DeckerDict) : null;
}

export function getDeckerCore(): DeckerCore {
  if (singleton) return singleton;

  const runtime = createRuntime();

  singleton = {
    readDeck(source) {
      return runtime.deck_read(source);
    },

    writeDeck(deck, html) {
      return runtime.deck_write(deck, html);
    },

    getField(target, key) {
      return runtime.ifield(target, key);
    },

    setField(target, key, value) {
      return runtime.iwrite(target, runtime.lms(key), value);
    },

    getString(value) {
      return runtime.ls(value);
    },

    getNumber(value) {
      return runtime.ln(value);
    },

    getBoolean(value) {
      return runtime.lb(value);
    },

    makeNumber(value) {
      return runtime.lmn(value);
    },

    makeString(value) {
      return runtime.lms(value);
    },

    getPair(value) {
      return runtime.getpair(value);
    },

    getRect(value) {
      return runtime.getrect(value);
    },

    makePair(x, y) {
      return runtime.make_pair([runtime.lmn(x), runtime.lmn(y)]);
    },

    dictValues<T = DeckerRuntimeObject>(dict) {
      const runtimeDict = asDict(dict);
      return runtimeDict ? (runtimeDict.v as T[]) : [];
    },

    dictKeys(dict) {
      const runtimeDict = asDict(dict);
      return runtimeDict
        ? runtimeDict.k?.map((key) => runtime.ls(key)) ?? []
        : [];
    },

    cards(deck) {
      return this.dictValues(runtime.ifield(deck, "cards")) as DeckerCard[];
    },

    widgets(card) {
      return this.dictValues(runtime.ifield(card, "widgets")) as DeckerWidget[];
    },

    isImage(value): value is DeckerImageLike {
      return runtime.image_is(value);
    },

    isButton(value): value is DeckerWidget {
      return runtime.button_is(value);
    },

    isField(value): value is DeckerWidget {
      return runtime.field_is(value);
    },

    isSlider(value): value is DeckerWidget {
      return runtime.slider_is(value);
    },

    isGrid(value): value is DeckerWidget {
      return runtime.grid_is(value);
    },

    isCanvas(value): value is DeckerWidget {
      return runtime.canvas_is(value);
    },

    isContraption(value): value is DeckerWidget {
      return runtime.contraption_is(value);
    },

    isCard(value): value is DeckerCard {
      return runtime.card_is(value);
    },

    isDeck(value): value is DeckerDeck {
      return runtime.deck_is(value);
    },

    isWidget(value): value is DeckerWidget {
      return runtime.widget_is(value);
    },

    isPrototype(value): value is DeckerRuntimeObject {
      return runtime.prototype_is(value);
    },

    isFont(value) {
      return runtime.font_is(value);
    },

    writeFontEncoded(font) {
      return runtime.font_write(font);
    },

    fireEvent(target, name, arg) {
      runtime.fire_event_async(target, name, arg ?? runtime.lms(""));
    },

    invokeEvent(target, name, args = []) {
      runtime.n_event(target, [runtime.lms(name), ...args]);
    },

    invokeEventSync(target, name, args = []) {
      return runtime.invoke_event_sync(target, name, args);
    },

    tick(quota?: number) {
      return runtime.tick(quota);
    },

    fireEventAsync(target, name, arg?: DeckerValue) {
      const r = runtime as DeckerRuntimeExports & { NIL?: DeckerValue };
      runtime.fire_event_async(target, name, arg ?? r.NIL);
    },

    getCardIndex(deck) {
      // Lil stores the current card index on `deck.card` as a JS number (see deck_read / n_go in lil.js).
      // `ifield(deck, "card")` returns the resolved card object, not the index — do not use that here.
      const d = deck as DeckerRuntimeObject & { card?: DeckerValue };
      const raw = d.card;
      if (raw != null) {
        if (typeof raw === "number" && Number.isFinite(raw)) {
          return Math.max(0, Math.floor(raw));
        }
        if (
          typeof raw === "object" &&
          (raw as { t?: string }).t === "num"
        ) {
          const n = this.getNumber(raw);
          return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
        }
      }
      const cur = this.getField(deck, "card");
      const list = this.cards(deck);
      const ix = list.findIndex((c) => c === cur);
      return ix >= 0 ? ix : 0;
    },

    colors: runtime.COLORS,

    samplePattern(palette, pattern, x, y) {
      return runtime.pal_pat(palette, pattern, x, y);
    },

    setGoNotify(fn) {
      hostCallbacks.goNotify = fn;
    },

    setGridCell(grid, colIndex, rowIndex, cellValue: string) {
      const value = runtime.ifield(grid, "value");
      const dict = asDict(value);
      if (!dict?.v || colIndex < 0 || colIndex >= dict.v.length) return;
      const colList = dict.v[colIndex] as DeckerRuntimeObject | undefined;
      if (!colList || typeof colList !== "object") return;
      runtime.iwrite(
        colList,
        runtime.lmn(rowIndex),
        runtime.lms(String(cellValue))
      );
    },

    setHostPrimitives(opts: {
      alert?: HostAlertCallback;
      open?: HostOpenCallback;
      save?: HostSaveCallback;
      show?: HostShowCallback;
      print?: HostPrintCallback;
      play?: HostPlayCallback;
    }) {
      if (opts.alert) hostCallbacks.alert = opts.alert;
      if (opts.open) hostCallbacks.open = opts.open;
      if (opts.save) hostCallbacks.save = opts.save;
      if (opts.show) hostCallbacks.show = opts.show;
      if (opts.print) hostCallbacks.print = opts.print;
      if (opts.play) hostCallbacks.play = opts.play;
    },
  };

  return singleton;
}
