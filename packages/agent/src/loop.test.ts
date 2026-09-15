import { describe, expect, it } from "vitest";
import { injectReminders, microcompact, runAgent, type CompleteFn } from "./loop";
import type { ChatMessage } from "@mockintosh/protocol";

function call(id: string, name: string, args: Record<string, unknown> = {}) {
  return { tool_calls: [{ id, name, arguments: args }] };
}

describe("runAgent ceilings", () => {
  it("continues when a tool call is truncated by length", async () => {
    let n = 0;
    const complete: CompleteFn = async () => {
      n += 1;
      if (n === 1) {
        return { finishReason: "length", tool_calls: [{ id: "1", name: "write", arguments: {}, truncated: true, rawArguments: "{\"path\"" }] };
      }
      return { message: "Wrote the file." };
    };
    const result = await runAgent({
      complete,
      invoke: async () => ({}),
      tools: [],
      messages: [{ role: "user", content: "write a big file" }],
      budget: { steps: 8, idleMs: 10_000 },
    });
    expect(result.reply).toContain("Wrote");
    expect(result.messages.some((m) => m.role === "user" && m.content === "Resume directly — no apology, no recap.")).toBe(true);
  });

  it("resets the idle deadline after a tool result", async () => {
    let n = 0;
    const complete: CompleteFn = async () => {
      n += 1;
      if (n < 3) {
        await new Promise((resolve) => setTimeout(resolve, 30));
        return call(String(n), "apps");
      }
      return { message: "done" };
    };
    const result = await runAgent({
      complete,
      invoke: async () => [],
      tools: [],
      messages: [{ role: "user", content: "go" }],
      budget: { steps: 8, idleMs: 80 },
    });
    expect(result.budgetExceeded).toBe(false);
    expect(result.reply).toBe("done");
  });
});

describe("microcompact", () => {
  it("keeps the latest write and stubs old inspect results", () => {
    const messages: ChatMessage[] = [
      { role: "assistant", tool_calls: [{ id: "w0", type: "function", function: { name: "write", arguments: JSON.stringify({ path: "/z", body: "zero" }) } }] },
      { role: "tool", tool_call_id: "w0", name: "write", content: "{}" },
      { role: "assistant", tool_calls: [{ id: "w1", type: "function", function: { name: "write", arguments: JSON.stringify({ path: "/a", body: "one\nline" }) } }] },
      { role: "tool", tool_call_id: "w1", name: "write", content: "{}" },
      { role: "assistant", tool_calls: [{ id: "w2", type: "function", function: { name: "write", arguments: JSON.stringify({ path: "/b", body: "two" }) } }] },
      { role: "tool", tool_call_id: "w2", name: "write", content: "{}" },
      { role: "tool", tool_call_id: "i1", name: "inspect", content: "huge tree" },
      { role: "tool", tool_call_id: "i2", name: "inspect", content: "latest" },
    ];
    microcompact(messages);
    expect(messages[0].tool_calls![0].function.arguments).toContain("summary");
    expect(messages[4].tool_calls![0].function.arguments).toContain("/b");
    expect(messages[6].content).toBe("[stubbed inspect]");
    expect(messages[7].content).toBe("latest");
  });

  it("keeps the last read of each file", () => {
    const messages: ChatMessage[] = [
      { role: "assistant", tool_calls: [{ id: "r1", type: "function", function: { name: "read", arguments: JSON.stringify({ path: "/a" }) } }] },
      { role: "tool", tool_call_id: "r1", name: "read", content: "old a" },
      { role: "assistant", tool_calls: [{ id: "r2", type: "function", function: { name: "read", arguments: JSON.stringify({ path: "/a" }) } }] },
      { role: "tool", tool_call_id: "r2", name: "read", content: "new a" },
      { role: "assistant", tool_calls: [{ id: "r3", type: "function", function: { name: "read_lines", arguments: JSON.stringify({ path: "/b" }) } }] },
      { role: "tool", tool_call_id: "r3", name: "read_lines", content: "only b" },
    ];
    microcompact(messages);
    expect(messages[1].content).toBe("[stubbed read]");
    expect(messages[3].content).toBe("new a");
    expect(messages[5].content).toBe("only b");
  });
});

describe("injectReminders", () => {
  it("warns when an install was not verified and when 12 steps remain", async () => {
    const messages: ChatMessage[] = [{ role: "user", content: "go" }];
    await injectReminders(messages, { lastRead: new Map(), installed: true, verified: false }, 12);
    expect(messages.at(-1)?.content).toContain("12 steps remain");
    expect(messages.at(-1)?.content).toContain("screenshot");
  });

  it("warns when a read file changed on disk", async () => {
    const messages: ChatMessage[] = [{ role: "user", content: "go" }];
    await injectReminders(
      messages,
      { lastRead: new Map([["/disk/a.ts", 1]]) },
      40,
      async () => ({ revision: 2 }),
    );
    expect(messages.at(-1)?.content).toContain("/disk/a.ts changed on disk");
  });
});

describe("read/write partitioning", () => {
  it("runs a read-only slice concurrently and mutating calls serially", async () => {
    const order: string[] = [];
    let started = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const complete: CompleteFn = async () => {
      if (order.includes("end:write")) return { message: "done" };
      return {
        tool_calls: [
          { id: "1", name: "read", arguments: { path: "/a" } },
          { id: "2", name: "stat", arguments: { path: "/b" } },
          { id: "3", name: "write", arguments: { path: "/c", body: "x" } },
        ],
      };
    };
    await runAgent({
      complete,
      invoke: async (name, args) => {
        order.push(`start:${name}`);
        if (name === "read" || (name === "stat" && (args.path === "/a" || args.path === "/b"))) {
          started += 1;
          if (started === 2) release();
          await gate;
          order.push(`end:${name}`);
          return name === "stat" ? { revision: 1 } : "ok";
        }
        order.push(`end:${name}`);
        if (name === "stat") throw new Error("missing");
        return name === "write" ? { revision: 1 } : "ok";
      },
      tools: [],
      messages: [{ role: "user", content: "go" }],
      budget: { steps: 6, idleMs: 10_000 },
    });
    const writeStart = order.indexOf("start:write");
    expect(order.indexOf("start:read")).toBeLessThan(writeStart);
    expect(order.indexOf("start:stat")).toBeLessThan(writeStart);
    expect(order.indexOf("end:read")).toBeLessThan(writeStart);
    expect(order.indexOf("end:stat")).toBeLessThan(writeStart);
  });
});
