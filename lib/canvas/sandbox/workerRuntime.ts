/**
 * Runtime injected into Web Workers before user app code.
 * Provides a safe drawing API and hook-based state management.
 *
 * This string is turned into a Blob URL and prepended to the user's code.
 */
export const WORKER_RUNTIME = `
"use strict";

// Block dangerous globals
const _blocked = [
  'window','document','fetch','XMLHttpRequest','WebSocket',
  'localStorage','sessionStorage','indexedDB','navigator',
  'eval','Function','importScripts'
];

// Shadow them on the global scope
for (const name of _blocked) {
  try { Object.defineProperty(self, name, { value: undefined, writable: false, configurable: false }); } catch(e) {}
}

// --- Internal state ---
const _hooks = [];
let _hookIndex = 0;
const _effects = [];
let _effectIndex = 0;
const _eventHandlers = { mouseDown: [], mouseUp: [], mouseMove: [], keyDown: [], keyUp: [], doubleClick: [] };
let _commands = [];
let _size = { width: 200, height: 150 };
let _pendingOSRequests = {};
let _reqIdCounter = 0;

// --- API exposed to user apps ---
const api = {
  get width() { return _size.width; },
  get height() { return _size.height; },

  // Drawing
  clear(color) { _commands.push({ op: "clear", color: color ?? 0 }); },
  setPixel(x, y, color) { _commands.push({ op: "pixel", x, y, color: color ?? 1 }); },
  drawRect(x, y, w, h, color) { _commands.push({ op: "rect", x, y, w, h, color: color ?? 1 }); },
  fillRect(x, y, w, h, color) { _commands.push({ op: "fill", x, y, w, h, color: color ?? 1 }); },
  fillPattern(x, y, w, h, pattern) { _commands.push({ op: "fillPattern", x, y, w, h, pattern }); },
  drawHLine(x, y, w, color) { _commands.push({ op: "hline", x, y, w, color: color ?? 1 }); },
  drawVLine(x, y, h, color) { _commands.push({ op: "vline", x, y, h: h, color: color ?? 1 }); },
  drawDottedHLine(x, y, w, color) { _commands.push({ op: "dottedHLine", x, y, w, color: color ?? 1 }); },
  invertRect(x, y, w, h) { _commands.push({ op: "invert", x, y, w, h }); },
  bitmapText(text, x, y, opts) {
    _commands.push({
      op: "text", text, x, y,
      font: opts?.font, align: opts?.align, color: opts?.color
    });
  },
  textBlock(text, x, y, maxWidth, opts) {
    _commands.push({
      op: "textBlock", text, x, y, maxWidth,
      font: opts?.font, color: opts?.color, lineSpacing: opts?.lineSpacing
    });
  },
  drawImage(src, x, y, w, h) { _commands.push({ op: "img", src, x, y, w, h }); },

  // Hooks
  useState(initial) {
    const idx = _hookIndex++;
    if (_hooks[idx] === undefined) _hooks[idx] = initial;
    const setState = (value) => {
      const prev = _hooks[idx];
      const next = typeof value === "function" ? value(prev) : value;
      if (prev !== next) {
        _hooks[idx] = next;
        self.postMessage({ type: "stateChanged" });
      }
    };
    return [_hooks[idx], setState];
  },

  useEffect(fn, deps) {
    const idx = _effectIndex++;
    const prev = _effects[idx];
    const shouldRun = !prev || !deps || !prev.deps || !_depsEqual(prev.deps, deps);
    _effects[idx] = { fn, deps, cleanup: prev?.cleanup, shouldRun };
  },

  useRef(initial) {
    const idx = _hookIndex++;
    if (_hooks[idx] === undefined) _hooks[idx] = { current: initial };
    return _hooks[idx];
  },

  // Event handlers
  onMouseDown(fn) { _eventHandlers.mouseDown.push(fn); },
  onMouseUp(fn) { _eventHandlers.mouseUp.push(fn); },
  onMouseMove(fn) { _eventHandlers.mouseMove.push(fn); },
  onKeyDown(fn) { _eventHandlers.keyDown.push(fn); },
  onKeyUp(fn) { _eventHandlers.keyUp.push(fn); },
  onDoubleClick(fn) { _eventHandlers.doubleClick.push(fn); },

  // OS Services (async, proxied through main thread)
  os: {
    async callService(service, method, ...args) {
      const requestId = String(++_reqIdCounter);
      return new Promise((resolve) => {
        _pendingOSRequests[requestId] = resolve;
        self.postMessage({
          type: "osServiceRequest",
          requestId,
          service,
          method,
          args,
        });
      });
    },
    openWindow(appId, props) { return this.callService("os", "openWindow", appId, props); },
    showDialog(options) { return this.callService("os", "showDialog", options); },
    async storageRead(key) { return this.callService("storage", "read", key); },
    async storageWrite(key, value) { return this.callService("storage", "write", key, value); },
    playSound(src) { self.postMessage({ type: "osServiceRequest", requestId: "0", service: "audio", method: "play", args: [src] }); },
  }
};

function _depsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; }
  return true;
}

function _runEffects() {
  for (const eff of _effects) {
    if (eff && eff.shouldRun) {
      if (eff.cleanup) eff.cleanup();
      eff.cleanup = eff.fn() || undefined;
      eff.shouldRun = false;
    }
  }
}

function _resetForRender() {
  _hookIndex = 0;
  _effectIndex = 0;
  _commands = [];
  _eventHandlers.mouseDown = [];
  _eventHandlers.mouseUp = [];
  _eventHandlers.mouseMove = [];
  _eventHandlers.keyDown = [];
  _eventHandlers.keyUp = [];
  _eventHandlers.doubleClick = [];
}

// --- Message handler ---
self.onmessage = function(e) {
  const msg = e.data;

  if (msg.type === "init") {
    _size = msg.size;
  }

  if (msg.type === "render") {
    _resetForRender();
    try {
      if (typeof app === "function") app(api);
    } catch(err) {
      _commands = [
        { op: "fill", x: 0, y: 0, w: _size.width, h: _size.height, color: 0 },
        { op: "text", text: "Error: " + String(err).slice(0, 40), x: 4, y: 4, font: "Geneva9", color: 1 },
      ];
    }
    _runEffects();
    self.postMessage({ type: "draw", commands: _commands });
  }

  if (msg.type === "event") {
    const ev = msg.event;
    const handlers = _eventHandlers[ev.kind] || [];
    for (const fn of handlers) {
      try { fn(ev.x, ev.y, ev.key); } catch(err) { console.error(err); }
    }
  }

  if (msg.type === "osServiceResponse") {
    const resolve = _pendingOSRequests[msg.requestId];
    if (resolve) {
      resolve(msg.result);
      delete _pendingOSRequests[msg.requestId];
    }
  }
};

// --- User code is appended below this line ---
`;
