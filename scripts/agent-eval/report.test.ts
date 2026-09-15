import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ChatMessage } from "@mockintosh/protocol";
import {
  formatHistogram,
  formatScoreRow,
  inspectNames,
  lastBuildSucceeded,
  lastDiagnostics,
  lastToolResult,
  newAppIds,
  parseTaskFilter,
  toolHistogram,
  writeTaskReport,
} from "./report";

describe("parseTaskFilter", () => {
  it("returns undefined when no --task is given", () => {
    expect(parseTaskFilter(["--other"])).toBeUndefined();
  });

  it("accepts --task, --task=, and comma lists", () => {
    expect(parseTaskFilter(["--task", "notes"])).toEqual(["notes"]);
    expect(parseTaskFilter(["--task=drawing"])).toEqual(["drawing"]);
    expect(parseTaskFilter(["--task", "notes,counter", "--task", "notes"])).toEqual(["notes", "counter"]);
  });

  it("rejects unknown ids", () => {
    expect(() => parseTaskFilter(["--task", "paint"])).toThrow(/Unknown task/);
  });
});

describe("transcript helpers", () => {
  const messages: ChatMessage[] = [
    { role: "assistant", tool_calls: [{ id: "1", type: "function", function: { name: "write", arguments: "{}" } }] },
    { role: "assistant", tool_calls: [{ id: "2", type: "function", function: { name: "search", arguments: "{}" } }] },
    { role: "assistant", tool_calls: [{ id: "3", type: "function", function: { name: "write", arguments: "{}" } }] },
    { role: "tool", tool_call_id: "4", name: "project_check", content: "{\"diagnostics\":[]}" },
    { role: "tool", tool_call_id: "5", name: "build_submit", content: "{\"state\":\"failed\"}" },
    { role: "tool", tool_call_id: "6", name: "build_submit", content: "{\"state\":\"succeeded\"}" },
  ];

  it("counts assistant tool calls", () => {
    expect(toolHistogram(messages)).toEqual({ write: 2, search: 1 });
    expect(formatHistogram({ write: 2, search: 1 })).toBe("2\twrite\n1\tsearch");
  });

  it("returns the last tool result of a name", () => {
    expect(lastToolResult(messages, "build_submit")).toEqual({ state: "succeeded" });
    expect(lastToolResult(messages, "project_check")).toEqual({ diagnostics: [] });
    expect(lastToolResult(messages, "logs")).toBeUndefined();
  });

  it("scores compiled from the last build_submit, not from the budget", () => {
    expect(lastBuildSucceeded(messages)).toBe(true);
    expect(lastBuildSucceeded(messages.slice(0, 5))).toBe(false);
    expect(lastBuildSucceeded([])).toBe(false);
  });

  it("finds typecheck diagnostics appended to write/edit results", () => {
    const withWrite: ChatMessage[] = [
      ...messages,
      { role: "tool", tool_call_id: "7", name: "edit", content: "{\"write\":{},\"diagnostics\":[{\"message\":\"boom\"}]}" },
      { role: "tool", tool_call_id: "8", name: "inspect", content: "[]" },
    ];
    expect(lastDiagnostics(withWrite)).toEqual([{ message: "boom" }]);
    expect(lastDiagnostics(messages)).toEqual([]);
    expect(lastDiagnostics([])).toBeUndefined();
  });

  it("reports only app ids the run registered", () => {
    expect(newAppIds([{ id: "finder" }, { id: "safari" }], [{ id: "safari" }, { id: "notes" }, { id: "finder" }])).toEqual(["notes"]);
    expect(newAppIds([{ id: "finder" }], [{ id: "finder" }])).toEqual([]);
  });

  it("prints n/a for painted when the task has no drag step", () => {
    const row = formatScoreRow("notes", { compiled: true, installed: false, named: false, painted: null }, 3, 10, "out");
    expect(row).toContain("painted=n/a");
    expect(formatScoreRow("drawing", { compiled: true, installed: true, named: true, painted: true }, 3, 10, "out")).toContain("painted=true");
  });

  it("collects unique inspect names", () => {
    expect(inspectNames([{ name: "note-save" }, { name: "note-save" }, {}, { name: "title" }])).toEqual([
      "note-save",
      "title",
    ]);
  });

  it("writes messages, summary, and histogram", async () => {
    const dir = await mkdtemp(join(tmpdir(), "agent-eval-"));
    await writeTaskReport(dir, {
      task: "notes",
      prompt: "Build a notes app",
      reply: "budget",
      budgetExceeded: true,
      cancelled: false,
      steps: 80,
      historyChars: 12,
      score: { compiled: false, installed: false, named: false, painted: null },
      tools: { write: 2 },
      last: {},
      installedApps: [],
      inspectNames: [],
      disk: [],
      desktop: [],
    }, messages);
    expect(JSON.parse(await readFile(join(dir, "messages.json"), "utf8"))).toHaveLength(messages.length);
    expect(JSON.parse(await readFile(join(dir, "summary.json"), "utf8")).task).toBe("notes");
    expect(await readFile(join(dir, "histogram.txt"), "utf8")).toContain("write");
  });
});
