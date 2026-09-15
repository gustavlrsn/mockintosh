import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ChatMessage } from "@mockintosh/protocol";

export const EVAL_TASK_IDS = ["counter", "drawing", "notes"] as const;
export type EvalTaskId = (typeof EVAL_TASK_IDS)[number];

export const EVAL_OUT_DIR = "scripts/agent-eval-out";

export function parseTaskFilter(argv: string[]): EvalTaskId[] | undefined {
  const requested: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--task" || arg === "-t") {
      const value = argv[i + 1];
      if (!value || value.startsWith("-")) throw new Error("`--task` needs a task id (counter, drawing, notes)");
      requested.push(...value.split(","));
      i += 1;
      continue;
    }
    if (arg.startsWith("--task=")) requested.push(...arg.slice("--task=".length).split(","));
  }
  if (!requested.length) return undefined;
  const ids: EvalTaskId[] = [];
  for (const raw of requested) {
    const id = raw.trim();
    if (!EVAL_TASK_IDS.includes(id as EvalTaskId)) {
      throw new Error(`Unknown task "${id}". Expected ${EVAL_TASK_IDS.join(", ")}`);
    }
    if (!ids.includes(id as EvalTaskId)) ids.push(id as EvalTaskId);
  }
  return ids;
}

export function toolHistogram(messages: ChatMessage[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const message of messages) {
    if (message.role !== "assistant" || !message.tool_calls) continue;
    for (const call of message.tool_calls) {
      counts[call.function.name] = (counts[call.function.name] ?? 0) + 1;
    }
  }
  return counts;
}

export function formatHistogram(counts: Record<string, number>): string {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, n]) => `${n}\t${name}`)
    .join("\n");
}

export function lastToolResult(messages: ChatMessage[], name: string): unknown {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "tool" || message.name !== name || message.content == null) continue;
    const text = typeof message.content === "string" ? message.content : JSON.stringify(message.content);
    try { return JSON.parse(text); } catch { return text; }
  }
  return undefined;
}

export function inspectNames(nodes: { name?: string }[]): string[] {
  return [...new Set(nodes.map((node) => node.name).filter((name): name is string => !!name))].sort();
}

/** Did the last `build_submit` in the transcript produce an installable artifact? */
export function lastBuildSucceeded(messages: ChatMessage[]): boolean {
  const job = lastToolResult(messages, "build_submit");
  return !!job && typeof job === "object" && (job as { state?: string }).state === "succeeded";
}

/**
 * The most recent typecheck diagnostics the agent saw. The agent layer appends
 * `project_check` output to `write`/`edit` results, so it is not a separate
 * tool message unless the model called `project_check` itself.
 */
export function lastDiagnostics(messages: ChatMessage[]): unknown {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "tool" || message.content == null) continue;
    if (message.name !== "write" && message.name !== "edit" && message.name !== "project_check") continue;
    const text = typeof message.content === "string" ? message.content : JSON.stringify(message.content);
    try {
      const value = JSON.parse(text) as { diagnostics?: unknown };
      if (value && typeof value === "object" && "diagnostics" in value) return value.diagnostics;
    } catch { /* not JSON */ }
  }
  return undefined;
}

/** App ids registered after the run that were not registered before it. */
export function newAppIds(before: { id: string }[], after: { id: string }[]): string[] {
  const seen = new Set(before.map((app) => app.id));
  return after.map((app) => app.id).filter((id) => !seen.has(id)).sort();
}

export interface EvalScore {
  /** The last `build_submit` succeeded. */
  compiled: boolean;
  /** At least one new app id was registered by the run. */
  installed: boolean;
  /** Every control name the task requires is in the final `inspect` tree. */
  named: boolean;
  /** A drag changed the screenshot; `null` when the task has no drag step. */
  painted: boolean | null;
}

export interface EvalTaskReport {
  task: string;
  prompt: string;
  reply: string;
  budgetExceeded: boolean;
  cancelled: boolean;
  steps: number;
  historyChars: number;
  score: EvalScore;
  tools: Record<string, number>;
  last: {
    diagnostics?: unknown;
    build_submit?: unknown;
  };
  installedApps: string[];
  inspectNames: string[];
  disk: unknown;
  desktop: unknown;
}

export function formatScoreRow(task: string, score: EvalScore, steps: number, chars: number, dir: string): string {
  const painted = score.painted === null ? "n/a" : String(score.painted);
  return `${task}\tcompiled=${score.compiled}\tinstalled=${score.installed}\tnamed=${score.named}\tpainted=${painted}\tsteps=${steps}\tchars=${chars}\tout=${dir}`;
}

export async function writeTaskReport(dir: string, report: EvalTaskReport, messages: ChatMessage[]): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "messages.json"), JSON.stringify(messages, null, 2));
  await writeFile(join(dir, "summary.json"), JSON.stringify(report, null, 2));
  await writeFile(join(dir, "histogram.txt"), formatHistogram(report.tools) + "\n");
}
