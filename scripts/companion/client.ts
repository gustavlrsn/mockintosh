import { encodeMessage, encodeHostRequest, decodeHostReply, liveSession, type HostReply, type LiveSession, type HostRequest } from "../../src/shared/companionProtocol";
import { parse, array } from "../../src/shared/schema";
export type { LiveSession } from "../../src/shared/companionProtocol";
import { randomUUID } from "node:crypto";
import type WebSocket from "ws";
import { WebSocket as Socket } from "./socket";
export class CompanionClient {
  private pending = new Map<string, {
    resolve(value: unknown): void;
    reject(error: unknown): void;
    timer: ReturnType<typeof setTimeout>;
    stream?: (channel: string, bytes: readonly number[]) => void;
  }>();
  private constructor(private socket: WebSocket) {
    socket.on("message", bytes => {
      let message: HostReply;
      try {
        message = decodeHostReply(bytes.toString());
      } catch {
        socket.close(1008, "Invalid companion message");
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) return;
      if ("type" in message && message.type === "stream") { pending.stream?.(message.channel, message.bytes); return; }
      if ("type" in message) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(Object.assign(new Error(message.error.message), message.error, {
        action: message.action
      })); else pending.resolve(message.result);
    });
    socket.on("close", () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer);
        pending.reject(Object.assign(new Error("Companion disconnected; dispatched mutation outcomes may be unknown"), {
          code: "disconnect"
        }));
      }
      this.pending.clear();
    });
  }
  static async connect(url: string, token: string) {
    const parsed = new URL(url);
    if (parsed.protocol !== "ws:" || !["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname)) throw new Error("Companion must use loopback ws://");
    const socket = new Socket(url),
      client = new CompanionClient(socket);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.close();
        reject(new Error("Companion connection timed out"));
      }, 5000);
      const fail = () => {
        clearTimeout(timer);
        reject(new Error("Companion authentication or connection failed"));
      };
      socket.once("error", fail);
      socket.once("close", fail);
      socket.on("open", () => socket.send(encodeMessage({
        type: "hello",
        role: "host",
        token
      })));
      const ready = (bytes: WebSocket.RawData) => {
        let message: HostReply;
        try { message = decodeHostReply(bytes.toString()); } catch { socket.close(1008, "Invalid companion message"); fail(); return; }
        if ("type" in message && message.type === "ready") {
          clearTimeout(timer);
          socket.off("message", ready);
          socket.off("close", fail);
          resolve();
        }
      };
      socket.on("message", ready);
    });
    return client;
  }
  request(type: HostRequest["type"], data: Record<string, unknown> = {}, timeout = 65000, stream?: (channel: string, bytes: readonly number[]) => void): Promise<unknown> {
    if (this.socket.readyState !== Socket.OPEN) return Promise.reject(Object.assign(new Error("Companion disconnected"), {
      code: "disconnect"
    }));
    const id = randomUUID();
    return new Promise((resolve, reject) => {
      const message = encodeHostRequest({ ...data, type, id });
      const timer = setTimeout(() => {
        this.pending.delete(id);
        if (typeof data.action === "string") this.socket.send(encodeMessage({
          type: "cancel",
          id: randomUUID(),
          action: data.action
        }));
        reject(Object.assign(new Error("Request timed out; outcome may be unknown. Reconcile by action id."), {
          code: "disconnect",
          action: data.action
        }));
      }, timeout);
      this.pending.set(id, {
        resolve,
        reject,
        timer, stream
      });
      this.socket.send(message);
    });
  }
  async list(): Promise<readonly LiveSession[]> {
    return parse(array(liveSession), await this.request("list"));
  }
  async select(session: string): Promise<LiveSession> {
    const found = (await this.list()).find(s => s.session === session);
    if (!found) throw new Error("Selected live boot is not connected");
    return found;
  }
  invoke(session: LiveSession, operation: string, args: Record<string, unknown>, action: string = randomUUID(), timeout = 65000, stream?: (channel: string, bytes: readonly number[]) => void) {
    return this.request("invoke", {
      target: session.session,
      instance: session.instance,
      generation: session.generation,
      operation,
      args,
      action
    }, timeout, stream);
  }
  cancel(action: string) {
    return this.request("cancel", {
      action
    });
  }
  close() {
    this.socket.close();
  }
}
