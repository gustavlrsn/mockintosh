import { jobSchema, parse, ValidationError } from "@mockintosh/protocol";
import type { AgentToolCall } from "@mockintosh/protocol";
import { AGENT_TRAP_SET, HTTP_TOOL_NAMES } from "./tools";
import { delay, errorCode, throwIfAborted } from "./signal";

export const TOOL_RESULT_MAX = 4000;

export type AgentInvoke = (
  name: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
) => Promise<unknown>;

export interface AgentHttp {
  generateImage?(prompt: string): Promise<string>;
  fetchRepoFile?(path: string): Promise<string>;
}

export function truncateToolResult(value: unknown): string {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (text.length <= TOOL_RESULT_MAX) return text;
  return `${text.slice(0, TOOL_RESULT_MAX)}\n\n[... truncated, ${text.length - TOOL_RESULT_MAX} more chars]`;
}

export function formatToolError(error: unknown): string {
  if (error instanceof ValidationError) {
    return JSON.stringify({ error: error.code, message: error.message });
  }
  const code = errorCode(error);
  if (code && error instanceof Error) {
    return JSON.stringify({ error: code, message: error.message });
  }
  return JSON.stringify({ error: "failed", message: error instanceof Error ? error.message : String(error) });
}

export async function pollBuild(
  invoke: AgentInvoke,
  id: string,
  signal?: AbortSignal,
): Promise<unknown> {
  let job = parse(jobSchema, await invoke("build_status", { id }, signal));
  while (job.state === "building") {
    try {
      await delay(100, signal);
    } catch (error) {
      if (errorCode(error) === "cancellation") {
        try { await invoke("build_cancel", { id }); } catch { /* already gone */ }
      }
      throw error;
    }
    job = parse(jobSchema, await invoke("build_status", { id }, signal));
  }
  return job;
}

export async function executeToolCall(
  call: AgentToolCall,
  invoke: AgentInvoke,
  signal?: AbortSignal,
  http: AgentHttp = {},
): Promise<string> {
  throwIfAborted(signal);
  if (call.name === "generate_image") {
    const prompt = typeof call.arguments.prompt === "string" ? call.arguments.prompt : "";
    if (!prompt) return JSON.stringify({ error: "Missing prompt" });
    if (!http.generateImage) return JSON.stringify({ error: "Image generation is unavailable" });
    return truncateToolResult(await http.generateImage(prompt));
  }
  if (call.name === "get_mockintosh_repo_file") {
    const path = typeof call.arguments.path === "string" ? call.arguments.path : "";
    if (!path) return JSON.stringify({ error: "Missing path" });
    if (!http.fetchRepoFile) return JSON.stringify({ error: "Repo fetch is unavailable" });
    return truncateToolResult(await http.fetchRepoFile(path));
  }
  if (!AGENT_TRAP_SET.has(call.name)) {
    return JSON.stringify({ error: "unsupported-operation", message: `Unknown tool: ${call.name}` });
  }
  try {
    if (call.name === "build_submit") {
      const submitted = parse(jobSchema, await invoke("build_submit", call.arguments, signal));
      if (submitted.state !== "building") return truncateToolResult(submitted);
      return truncateToolResult(await pollBuild(invoke, submitted.id, signal));
    }
    return truncateToolResult(await invoke(call.name, call.arguments, signal));
  } catch (error) {
    if (errorCode(error) === "cancellation") throw error;
    return formatToolError(error);
  }
}

export function isHttpTool(name: string): boolean {
  return HTTP_TOOL_NAMES.has(name);
}
