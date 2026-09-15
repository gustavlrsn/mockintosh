import type { ChatMessage, CompleteResult, OpenAITool } from "@mockintosh/protocol";
import { activityLabel } from "./tools";
import { executeToolCall, type AgentHttp, type AgentInvoke } from "./execute";
import { errorCode, throwIfAborted, wait } from "./signal";

export type CompleteFn = (messages: ChatMessage[], tools: OpenAITool[]) => Promise<CompleteResult>;

export interface AgentBudget {
  steps: number;
  ms: number;
}

export const DEFAULT_BUDGET: AgentBudget = { steps: 16, ms: 120_000 };

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
  const budget: AgentBudget = { ...DEFAULT_BUDGET, ...options.budget };
  const signal = options.signal;
  const messages = options.messages.map((m) => ({ ...m }));
  const deadline = Date.now() + budget.ms;
  let steps = 0;
  let cancelled = false;
  let budgetExceeded = false;

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

    let result: CompleteResult;
    try {
      result = await wait(options.complete(messages, options.tools), signal);
    } catch (error) {
      if (errorCode(error) === "cancellation") {
        cancelled = true;
        return finish("Stopped.");
      }
      throw error;
    }

    const calls = result.tool_calls ?? [];
    if (!calls.length) {
      const reply = (result.message ?? "").trim() || "I couldn't process that.";
      messages.push({ role: "assistant", content: reply });
      return finish(reply);
    }

    messages.push(assistantToolMessage(result));
    for (const call of calls) {
      try {
        throwIfAborted(signal);
        options.onActivity?.(activityLabel(call.name));
        const content = await executeToolCall(call, options.invoke, signal, options.http);
        messages.push({ role: "tool", tool_call_id: call.id, name: call.name, content });
        options.onActivity?.(`${activityLabel(call.name)}: ${content.length > 120 ? content.slice(0, 117) + "…" : content}`);
      } catch (error) {
        if (errorCode(error) === "cancellation") {
          cancelled = true;
          return finish("Stopped.");
        }
        throw error;
      }
    }
  }
}
