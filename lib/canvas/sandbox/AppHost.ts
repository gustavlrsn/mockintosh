import { AppContext } from "../AppContext";
import { BLACK, WHITE } from "../BitCanvas";
import { SpriteRegistry } from "../SpriteRegistry";
import { OSServices } from "../OSServices";
import {
  DrawCommand,
  MainToWorkerMessage,
  WorkerToMainMessage,
} from "./protocol";
import { WORKER_RUNTIME } from "./workerRuntime";

export interface SandboxedApp {
  id: string;
  code: string;
  title: string;
  icon: string;
  defaultSize: { width: number; height: number };
}

interface RunningWorkerApp {
  worker: Worker;
  appId: string;
  lastCommands: DrawCommand[];
  blobUrl: string;
  watchdogTimer: ReturnType<typeof setTimeout> | null;
  pendingRender: boolean;
  permissions: Set<string>;
}

const WATCHDOG_TIMEOUT_MS = 2000;

const ALLOWED_OPS = new Set([
  "clear",
  "rect",
  "fill",
  "fillPattern",
  "hline",
  "vline",
  "text",
  "textBlock",
  "img",
  "invert",
  "pixel",
  "dottedHLine",
]);

export class AppHost {
  private running: Map<string, RunningWorkerApp> = new Map();
  private sprites: SpriteRegistry;
  private osServices: OSServices;
  private onNeedsRender: () => void;

  constructor(
    sprites: SpriteRegistry,
    osServices: OSServices,
    onNeedsRender: () => void
  ) {
    this.sprites = sprites;
    this.osServices = osServices;
    this.onNeedsRender = onNeedsRender;
  }

  spawn(windowId: string, app: SandboxedApp): boolean {
    if (this.running.has(windowId)) return false;

    const fullCode = WORKER_RUNTIME + "\n" + app.code;
    const blob = new Blob([fullCode], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);

    let worker: Worker;
    try {
      worker = new Worker(blobUrl);
    } catch (e) {
      console.error("Failed to create worker:", e);
      URL.revokeObjectURL(blobUrl);
      return false;
    }

    const entry: RunningWorkerApp = {
      worker,
      appId: app.id,
      lastCommands: [],
      blobUrl,
      watchdogTimer: null,
      pendingRender: false,
      permissions: new Set(),
    };

    worker.onmessage = (e: MessageEvent<WorkerToMainMessage>) => {
      this._handleWorkerMessage(windowId, e.data);
    };

    worker.onerror = (e) => {
      console.error("Worker error:", e);
    };

    this.running.set(windowId, entry);

    // Send init
    const msg: MainToWorkerMessage = {
      type: "init",
      appId: app.id,
      size: app.defaultSize,
    };
    worker.postMessage(msg);

    // Request first render
    this.requestRender(windowId);

    return true;
  }

  terminate(windowId: string) {
    const entry = this.running.get(windowId);
    if (!entry) return;

    if (entry.watchdogTimer) clearTimeout(entry.watchdogTimer);
    entry.worker.terminate();
    URL.revokeObjectURL(entry.blobUrl);
    this.running.delete(windowId);
  }

  requestRender(windowId: string) {
    const entry = this.running.get(windowId);
    if (!entry || entry.pendingRender) return;

    entry.pendingRender = true;
    entry.worker.postMessage({ type: "render" } as MainToWorkerMessage);

    // Watchdog
    entry.watchdogTimer = setTimeout(() => {
      console.warn(`Worker ${windowId} timed out, terminating`);
      this.terminate(windowId);
    }, WATCHDOG_TIMEOUT_MS);
  }

  sendEvent(
    windowId: string,
    event: { kind: string; x?: number; y?: number; key?: string; code?: string }
  ) {
    const entry = this.running.get(windowId);
    if (!entry) return;

    const msg: MainToWorkerMessage = { type: "event", event: event as any };
    entry.worker.postMessage(msg);
  }

  /**
   * Execute the last received draw commands onto an AppContext.
   */
  executeCommands(windowId: string, ctx: AppContext) {
    const entry = this.running.get(windowId);
    if (!entry) return;

    for (const cmd of entry.lastCommands) {
      if (!ALLOWED_OPS.has(cmd.op)) continue;

      switch (cmd.op) {
        case "clear":
          ctx.clear(cmd.color ?? WHITE);
          break;
        case "pixel":
          ctx.setPixel(cmd.x ?? 0, cmd.y ?? 0, cmd.color ?? BLACK);
          break;
        case "rect":
          ctx.drawRect(
            cmd.x ?? 0,
            cmd.y ?? 0,
            cmd.w ?? 0,
            cmd.h ?? 0,
            cmd.color ?? BLACK
          );
          break;
        case "fill":
          ctx.fillRect(
            cmd.x ?? 0,
            cmd.y ?? 0,
            cmd.w ?? 0,
            cmd.h ?? 0,
            cmd.color ?? BLACK
          );
          break;
        case "fillPattern":
          if (cmd.pattern) {
            ctx.fillPattern(
              cmd.x ?? 0,
              cmd.y ?? 0,
              cmd.w ?? 0,
              cmd.h ?? 0,
              cmd.pattern as any
            );
          }
          break;
        case "hline":
          ctx.drawHLine(cmd.x ?? 0, cmd.y ?? 0, cmd.w ?? 0, cmd.color ?? BLACK);
          break;
        case "vline":
          ctx.drawVLine(cmd.x ?? 0, cmd.y ?? 0, cmd.h ?? 0, cmd.color ?? BLACK);
          break;
        case "dottedHLine":
          ctx.drawDottedHLine(
            cmd.x ?? 0,
            cmd.y ?? 0,
            cmd.w ?? 0,
            cmd.color ?? BLACK
          );
          break;
        case "invert":
          ctx.invertRect(cmd.x ?? 0, cmd.y ?? 0, cmd.w ?? 0, cmd.h ?? 0);
          break;
        case "text":
          ctx.drawText(cmd.text ?? "", cmd.x ?? 0, cmd.y ?? 0, {
            font: (cmd.font as any) ?? "Geneva9",
            align: (cmd.align as any) ?? "left",
            color: cmd.color ?? BLACK,
          });
          break;
        case "textBlock":
          ctx.drawTextBlock({
            text: cmd.text ?? "",
            x: cmd.x ?? 0,
            y: cmd.y ?? 0,
            maxWidth: cmd.maxWidth ?? ctx.width,
            font: (cmd.font as any) ?? "Geneva9",
            color: cmd.color ?? BLACK,
            lineSpacing: cmd.lineSpacing ?? 0,
          });
          break;
        case "img": {
          const sprite = this.sprites.get(cmd.src ?? "");
          if (sprite) {
            ctx.blit(sprite, cmd.x ?? 0, cmd.y ?? 0);
          }
          break;
        }
      }
    }
  }

  isRunning(windowId: string): boolean {
    return this.running.has(windowId);
  }

  private _handleWorkerMessage(windowId: string, msg: WorkerToMainMessage) {
    const entry = this.running.get(windowId);
    if (!entry) return;

    switch (msg.type) {
      case "draw":
        if (entry.watchdogTimer) {
          clearTimeout(entry.watchdogTimer);
          entry.watchdogTimer = null;
        }
        entry.pendingRender = false;
        entry.lastCommands = msg.commands ?? [];
        this.onNeedsRender();
        break;

      case "stateChanged":
        this.requestRender(windowId);
        break;

      case "osServiceRequest":
        this._handleOSServiceRequest(windowId, msg as any);
        break;
    }
  }

  private async _handleOSServiceRequest(
    windowId: string,
    msg: { requestId: string; service: string; method: string; args: any[] }
  ) {
    const entry = this.running.get(windowId);
    if (!entry) return;

    let result: any = null;

    try {
      switch (msg.service) {
        case "audio":
          if (msg.method === "play") this.osServices.audio.play(msg.args[0]);
          break;
        case "storage":
          if (msg.method === "read")
            result = await this.osServices.storage.read(msg.args[0]);
          if (msg.method === "write")
            await this.osServices.storage.write(msg.args[0], msg.args[1]);
          if (msg.method === "list")
            result = await this.osServices.storage.list();
          break;
        case "os":
          if (msg.method === "openWindow")
            this.osServices.openWindow(msg.args[0], msg.args[1]);
          if (msg.method === "showDialog")
            result = await this.osServices.showDialog(msg.args[0]);
          break;
      }
    } catch (e) {
      console.error("OS service error:", e);
    }

    entry.worker.postMessage({
      type: "osServiceResponse",
      requestId: msg.requestId,
      result,
    } as MainToWorkerMessage);
  }
}
