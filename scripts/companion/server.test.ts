import { afterEach, describe, expect, it } from "vitest";
import { once } from "node:events";
import { WebSocket } from "./socket";
import { startCompanion } from "./server";
import { CompanionClient } from "./client";
const cleanup: Array<() => Promise<unknown> | void> = [];
afterEach(async () => {
  for (const dispose of cleanup.reverse()) await dispose();
  cleanup.length = 0;
});
async function setup(retention = {}) {
  const companion = startCompanion({
    ...retention,
    port: 0,
    origin: "http://localhost:5173",
    token: "test-token"
  });
  cleanup.push(() => companion.close());
  await once(companion.server, "listening");
  const address = companion.server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  const url = `ws://127.0.0.1:${address.port}`;
  async function browser(instance: string, generation = 1) {
    const socket = new WebSocket(url, {
      origin: "http://localhost:5173"
    });
    cleanup.push(() => socket.close());
    await once(socket, "open");
    const ready = once(socket, "message");
    socket.send(JSON.stringify({
      type: "hello",
      role: "browser",
      token: "test-token",
      instance,
      generation,
      operations: []
    }));
    await ready;
    return socket;
  }
  async function host() {
    const client = await CompanionClient.connect(url, "test-token");
    cleanup.push(() => client.close());
    return client;
  }
  return {
    companion,
    url,
    browser,
    host
  };
}
describe("loopback companion protocol", () => {
  it("evicts old retained outcomes without changing delivered results", async () => {
    const {browser, host} = await setup({retention: {maxEntries: 1, maxBytes: 4096, ttlMs: 60000}});
    const socket = await browser("retained"), client = await host(), session = (await client.list())[0];
    for (const action of ["old", "new"]) {
      const received = once(socket, "message");
      const pending = client.invoke(session, "write", {}, action);
      await received;
      socket.send(JSON.stringify({type: "result", action, result: {revision: 2}}));
      expect(await pending).toEqual({revision: 2});
    }
    expect(await client.request("outcome", {action: "old"})).toEqual({status: "missing"});
    expect(await client.request("outcome", {action: "new"})).toMatchObject({status: "complete", result: {revision: 2}});
  });
  it("rejects bad authentication and foreign browser origins", async () => {
    const {
      url
    } = await setup();
    await expect(CompanionClient.connect(url, "wrong")).rejects.toThrow("authentication");
    const rejected = new WebSocket(url, {
      origin: "http://evil.example"
    });
    expect((await once(rejected, "close"))[0]).toBe(1008);
  });
  it("discovers multiple browsers and checks the complete boot target", async () => {
    const {
      browser,
      host
    } = await setup();
    await browser("a", 2);
    await browser("b", 3);
    const client = await host();
    const sessions = await client.list();
    expect(sessions.map(s => s.session).sort()).toEqual(["a:2", "b:3"]);
    await expect(client.invoke({
      ...sessions[0],
      generation: 99
    }, "write", {})).rejects.toMatchObject({
      code: "stale-reference"
    });
    await expect(client.invoke({
      ...sessions[0],
      session: "missing:1"
    }, "write", {})).rejects.toMatchObject({
      code: "disconnect"
    });
  });
  it("routes outcomes, rejects action replay, and marks disconnect outcomes unknown", async () => {
    const {
      browser,
      host
    } = await setup();
    const socket = await browser("a"),
      client = await host(),
      session = (await client.list())[0];
    let received = once(socket, "message");
    const run = client.invoke(session, "write", {
      path: "/disk/a",
      body: "x"
    }, "first");
    const message = JSON.parse((await received)[0].toString());
    expect(message.args.body).toBe("x");
    socket.send(JSON.stringify({
      type: "result",
      action: message.action,
      result: {
        revision: 2
      }
    }));
    expect(await run).toEqual({
      revision: 2
    });
    await expect(client.invoke(session, "write", {}, "first")).rejects.toMatchObject({
      code: "conflict"
    });
    received = once(socket, "message");
    const pending = client.invoke(session, "write", {}, "second");
    const rejected = expect(pending).rejects.toMatchObject({
      code: "disconnect",
      action: "second"
    });
    await received;
    socket.close();
    await rejected;
    expect(await client.request("outcome", {
      action: "second"
    })).toMatchObject({
      status: "unknown"
    });
  });
  it("streams output before completing a request", async () => {
    const { browser, host } = await setup();
    const socket = await browser("stream"), client = await host(), session = (await client.list())[0];
    const chunks: string[] = [];
    const received = once(socket, "message");
    const pending = client.invoke(session, "run_shell", { command: "echo first; sleep 1" }, "streamed", 65000, (channel, bytes) => chunks.push(channel + ":" + new TextDecoder().decode(new Uint8Array(bytes))));
    await received;
    socket.send(JSON.stringify({ type: "stream", action: "streamed", channel: "stdout", bytes: Array.from(new TextEncoder().encode("first\n")) }));
    for (let i = 0; !chunks.length && i < 50; i++) await new Promise(resolve => setTimeout(resolve, 1));
    expect(chunks).toEqual(["stdout:first\n"]);
    socket.send(JSON.stringify({ type: "result", action: "streamed", result: { exitCode: 0 } }));
    expect(await pending).toEqual({ exitCode: 0 });
  });
  it("rejects malformed browser streams before forwarding bytes", async () => {
    const {browser, host} = await setup();
    const socket = await browser("malformed"), client = await host(), session = (await client.list())[0];
    const chunks: unknown[] = [];
    const received = once(socket, "message");
    const run = client.invoke(session, "run_shell", {}, "malformed-stream", 65000, (_, bytes) => chunks.push(bytes));
    const rejected = expect(run).rejects.toMatchObject({code: "disconnect"});
    await received;
    const closed = once(socket, "close");
    socket.send(JSON.stringify({type: "stream", action: "malformed-stream", channel: "stdout", bytes: [256]}));
    expect((await closed)[0]).toBe(1008);
    await rejected;
    expect(chunks).toEqual([]);
  });
  it("validates dynamic host requests before sending without poisoning the connection", async () => {
    const {host} = await setup();
    const client = await host();
    await expect(client.request("invoke", {args: []})).rejects.toMatchObject({code: "invalid-argument"});
    expect(await client.list()).toEqual([]);
  });
  it("forwards cancellation only from the owning host", async () => {
    const {
      browser,
      host
    } = await setup();
    const socket = await browser("a"),
      client = await host(),
      session = (await client.list())[0];
    let received = once(socket, "message");
    const pending = client.invoke(session, "sleep", {}, "cancelled");
    await received;
    received = once(socket, "message");
    await client.cancel("cancelled");
    expect(JSON.parse((await received)[0].toString())).toMatchObject({
      type: "cancel",
      action: "cancelled"
    });
    socket.send(JSON.stringify({
      type: "result",
      action: "cancelled",
      error: {
        code: "cancellation",
        message: "cancelled"
      }
    }));
    await expect(pending).rejects.toMatchObject({
      code: "cancellation"
    });
  });
});
