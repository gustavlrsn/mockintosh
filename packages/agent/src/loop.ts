import type { ChatMessage, CompleteResult, OpenAITool } from "@mockintosh/protocol";
import { activityLabel } from "./tools";
import {
  executeToolCall, isReadOnlyTool, type AgentHttp, type AgentInvoke, type AgentExecState, type ToolExecution,
} from "./execute";
import { errorCode, throwIfAborted, wait } from "./signal";

export type CompleteFn = (messages: ChatMessage[], tools: OpenAITool[]) => Promise<CompleteResult>;

export interface AgentBudget {
  steps: number;
  idleMs: number;
  /** @deprecated Use idleMs. Accepted for older callers. */
  ms?: number;
}

export const DEFAULT_BUDGET: AgentBudget = { steps: 80, idleMs: 900_000 };
const MAX_CONTINUATIONS = 3;
const AUTO_COMPACT_CHARS = 80_000;
const RESUME = "Resume directly — no apology, no recap.";

export interface AgentRun {
  messages: ChatMessage[];
  reply: string;
  steps: number;
  cancelled: boolean;
  budgetExceeded: boolean;
}

export interface RunAgentOptions {
  complete: CompleteFn;
  invoke: AgentInvoke;
  tools: OpenAITool[];
  messages: ChatMessage[];
  budget?: Partial<AgentBudget>;
  signal?: AbortSignal;
  http?: AgentHttp;
  onActivity?: (text: string) => void;
  onBeforeComplete?: (messages: ChatMessage[]) => Promise<void> | void;
}

function assistantToolMessage(result: CompleteResult): ChatMessage {
  return {
    role: "assistant",
    content: result.message ?? null,
    tool_calls: result.tool_calls?.map((call) => ({
      id: call.id,
      type: "function" as const,
      function: { name: call.name, arguments: JSON.stringify(call.arguments) },
    })),
  };
}

export async function runAgent(options: RunAgentOptions): Promise<AgentRun> {
  const idleMs = options.budget?.idleMs ?? options.budget?.ms ?? DEFAULT_BUDGET.idleMs;
  const budget: AgentBudget = { steps: options.budget?.steps ?? DEFAULT_BUDGET.steps, idleMs };
  const signal = options.signal;
  const messages = options.messages.map((m) => ({ ...m }));
  let deadline = Date.now() + budget.idleMs;
  let steps = 0;
  let continuations = 0;
  let cancelled = false;
  let budgetExceeded = false;
  const state: AgentExecState = { lastRead: new Map() };

  const finish = (reply: string): AgentRun => ({
    messages,
    reply,
    steps,
    cancelled,
    budgetExceeded,
  });

  while (true) {
    try {
      throwIfAborted(signal);
    } catch {
      cancelled = true;
      return finish("Stopped.");
    }
    if (steps >= budget.steps || Date.now() > deadline) {
      budgetExceeded = true;
      return finish("I hit my step or time budget before finishing. Ask me to continue if you want me to keep going.");
    }
    steps += 1;
    await injectReminders(messages, state, budget.steps - steps, options.invoke);

    let result: CompleteResult;
    try {
      await options.onBeforeComplete?.(messages);
      result = await wait(options.complete(messages, options.tools), signal);
    } catch (error) {
      if (errorCode(error) === "cancellation") {
        cancelled = true;
        return finish("Stopped.");
      }
      if (isContextLengthError(error) && await reactiveCompact(messages, options.complete, options.tools)) {
        continue;
      }
      throw error;
    }

    const calls = result.tool_calls ?? [];
    const truncated = result.finishReason === "length" || calls.some((call) => call.truncated);
    const runnable = calls.filter((call) => !call.truncated);

    if (!runnable.length && !truncated) {
      const reply = (result.message ?? "").trim() || "I couldn't process that.";
      messages.push({ role: "assistant", content: reply });
      return finish(reply);
    }

    if (runnable.length) messages.push(assistantToolMessage({ ...result, tool_calls: runnable }));
    try {
      await runCalls(runnable, options, signal, state, messages);
      deadline = Date.now() + budget.idleMs;
    } catch (error) {
      if (errorCode(error) === "cancellation") {
        cancelled = true;
        return finish("Stopped.");
      }
      throw error;
    }

    microcompact(messages);
    if (historyChars(messages) > AUTO_COMPACT_CHARS) await autoCompact(messages, options.complete, options.tools);

    if (truncated && continuations < MAX_CONTINUATIONS) {
      continuations += 1;
      messages.push({ role: "user", content: RESUME });
      continue;
    }
    if (!runnable.length && truncated && continuations >= MAX_CONTINUATIONS) {
      return finish("The model kept truncating a tool call. Try a smaller file or an edit.");
    }
  }
}

async function runCalls(
  calls: NonNullable<CompleteResult["tool_calls"]>,
  options: RunAgentOptions,
  signal: AbortSignal | undefined,
  state: AgentExecState,
  messages: ChatMessage[],
): Promise<void> {
  const results = new Array<ToolExecution>(calls.length);
  let index = 0;
  while (index < calls.length) {
    if (isReadOnlyTool(calls[index].name)) {
      let end = index + 1;
      while (end < calls.length && isReadOnlyTool(calls[end].name)) end += 1;
      const slice = calls.slice(index, end);
      const parts = await Promise.all(slice.map(async (call) => {
        throwIfAborted(signal);
        options.onActivity?.(activityLabel(call.name));
        return executeToolCall(call, options.invoke, signal, options.http, state);
      }));
      for (let i = 0; i < parts.length; i++) results[index + i] = parts[i];
      index = end;
    } else {
      throwIfAborted(signal);
      options.onActivity?.(activityLabel(calls[index].name));
      results[index] = await executeToolCall(calls[index], options.invoke, signal, options.http, state);
      index += 1;
    }
  }
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    const exec = results[i];
    messages.push({ role: "tool", tool_call_id: call.id, name: call.name, content: exec.content });
    options.onActivity?.(`${activityLabel(call.name)}: ${exec.content.length > 120 ? exec.content.slice(0, 117) + "…" : exec.content}`);
    if (exec.vision) messages.push({ role: "user", content: exec.vision });
  }
}

export async function injectReminders(
  messages: ChatMessage[],
  state: AgentExecState,
  remaining: number,
  invoke?: AgentInvoke,
): Promise<void> {
  const notes: string[] = [];
  if (remaining === 12) notes.push("12 steps remain.");
  if (state.installed && !state.verified) {
    notes.push("You installed but have not dragged on the canvas or taken a screenshot.");
  }
  if (state.repeatDiagnostic) {
    notes.push("The same typecheck diagnostic repeated. Read the failing file and logs.");
  }
  if (invoke) {
    for (const [path, revision] of state.lastRead) {
      try {
        const stat = await invoke("stat", { path }) as { revision: number };
        if (stat.revision !== revision) notes.push(`${path} changed on disk since you last read it.`);
      } catch { /* gone */ }
    }
  }
  if (!notes.length) return;
  const text = `<system-reminder>\n${notes.join("\n")}\n</system-reminder>`;
  const last = messages[messages.length - 1];
  if (last?.role === "user" && typeof last.content === "string" && last.content.includes("<system-reminder>")) return;
  messages.push({ role: "user", content: text });
}

export function microcompact(messages: ChatMessage[]): void {
  const writeIds = messages
    .filter((m) => m.role === "assistant" && m.tool_calls?.some((c) => c.function.name === "write" || c.function.name === "edit"))
    .flatMap((m) => (m.tool_calls ?? []).map((c) => c.id));
  const keep = new Set(writeIds.slice(-2));
  for (const message of messages) {
    if (message.role !== "assistant" || !message.tool_calls) continue;
    for (const call of message.tool_calls) {
      if ((call.function.name === "write" || call.function.name === "edit") && !keep.has(call.id)) {
        const args = safeJson(call.function.arguments);
        const path = typeof args.path === "string" ? args.path : "file";
        const body = typeof args.body === "string" ? args.body : typeof args.newText === "string" ? args.newText : "";
        const lines = body.split("\n").length;
        const rev = typeof args.expectedRevision === "number" ? `, rev ${args.expectedRevision}` : "";
        call.function.arguments = JSON.stringify({ path, summary: `[wrote ${path}, ${lines} lines${rev}]` });
      }
    }
  }
  const inspectIds = messages
    .filter((m) => m.role === "tool" && (m.name === "inspect" || m.name === "screenshot"))
    .map((m) => m.tool_call_id)
    .filter((id): id is string => !!id);
  const keepInspect = new Set(inspectIds.slice(-1));
  for (const message of messages) {
    if (message.role === "tool" && (message.name === "inspect" || message.name === "screenshot") && message.tool_call_id && !keepInspect.has(message.tool_call_id)) {
      message.content = `[stubbed ${message.name}]`;
    }
  }
  stubOldReads(messages);
}

function stubOldReads(messages: ChatMessage[]): void {
  const pathByCall = new Map<string, string>();
  for (const message of messages) {
    if (message.role !== "assistant" || !message.tool_calls) continue;
    for (const call of message.tool_calls) {
      if (call.function.name !== "read" && call.function.name !== "read_lines") continue;
      const path = safeJson(call.function.arguments).path;
      if (typeof path === "string") pathByCall.set(call.id, path);
    }
  }
  const lastByPath = new Map<string, string>();
  for (const message of messages) {
    if (message.role !== "tool" || (message.name !== "read" && message.name !== "read_lines") || !message.tool_call_id) continue;
    const path = pathByCall.get(message.tool_call_id);
    if (path) lastByPath.set(path, message.tool_call_id);
  }
  const keep = new Set(lastByPath.values());
  for (const message of messages) {
    if (message.role === "tool" && (message.name === "read" || message.name === "read_lines") && message.tool_call_id && !keep.has(message.tool_call_id)) {
      message.content = `[stubbed ${message.name}]`;
    }
  }
}

async function autoCompact(messages: ChatMessage[], complete: CompleteFn, tools: OpenAITool[]): Promise<void> {
  const summary = await complete([
    ...messages,
    { role: "user", content: "Summarise this build so far in under 200 words. Keep the user's request, current files, and last diagnostics." },
  ], tools);
  const text = summary.message?.trim();
  if (!text) return;
  const user = messages.find((m) => m.role === "user");
  messages.splice(0, messages.length, user ?? { role: "user", content: "Continue." }, { role: "assistant", content: text });
}

async function reactiveCompact(messages: ChatMessage[], complete: CompleteFn, tools: OpenAITool[]): Promise<boolean> {
  try {
    await autoCompact(messages, complete, tools);
    return true;
  } catch {
    return false;
  }
}

function historyChars(messages: ChatMessage[]): number {
  return JSON.stringify(messages).length;
}

function isContextLengthError(error: unknown): boolean {
  const text = error instanceof Error ? error.message : String(error);
  return /context length|too many tokens|maximum context/i.test(text);
}

function safeJson(raw: string): Record<string, unknown> {
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" ? value as Record<string, unknown> : {};
  } catch {
    return {};
  }
}
