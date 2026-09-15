import { describe, expect, it } from "vitest";
import { executeToolCall } from "./execute";

describe("tool result spill", () => {
  it("writes overflow inspect results to a file instead of truncating silently", async () => {
    const written: Record<string, string> = {};
    const invoke = async (name: string, args: Record<string, unknown>) => {
      if (name === "inspect") return { tree: "x".repeat(9000) };
      if (name === "mkdir") return {};
      if (name === "write") {
        written[String(args.path)] = String(args.body);
        return { path: args.path, revision: 1 };
      }
      throw new Error(name);
    };
    const result = await executeToolCall({ id: "call-1", name: "inspect", arguments: {} }, invoke);
    expect(result.content).toContain("full result at");
    expect(Object.keys(written)[0]).toContain("tool-results/call-1.txt");
    expect(written[Object.keys(written)[0]].length).toBeGreaterThan(8000);
  });
});

describe("read-before-edit", () => {
  it("rejects edit of a file that was not read", async () => {
    const result = await executeToolCall(
      { id: "e1", name: "edit", arguments: { path: "/disk/a.ts", oldText: "a", newText: "b", expectedRevision: 1 } },
      async () => ({ revision: 1 }),
    );
    expect(JSON.parse(result.content)).toMatchObject({ error: "conflict" });
  });

  it("appends project_check after a successful write under a project", async () => {
    const calls: string[] = [];
    const result = await executeToolCall(
      { id: "w1", name: "write", arguments: { path: "/disk/Applications/X.app/src/index.tsx", body: "x" } },
      async (name, args) => {
        calls.push(name);
        if (name === "stat") {
          if (String(args.path).endsWith("mockintosh.json")) return { revision: 1 };
          throw new Error("missing");
        }
        if (name === "write") return { revision: 2 };
        if (name === "project_check") return { diagnostics: [{ message: "ok" }] };
        return {};
      },
    );
    expect(calls).toContain("project_check");
    expect(result.content).toContain("diagnostics");
  });
});
