/**
 * ChatGippity ↔ `/api/chat` wire types. The gateway is one LLM turn:
 * messages (and optional tools) in, a text reply or tool_calls out.
 * The live OS executes tools; this module has no kernel dependency.
 */

export interface OpenAIToolParameter {
  type: string;
  description?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
  items?: unknown;
  enum?: unknown[];
}

export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: OpenAIToolParameter;
  };
}

export interface OpenAIToolCall {
  id: string;
  type?: "function";
  function: { name: string; arguments: string };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: OpenAIToolCall[];
}

export interface AgentToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface CompleteResult {
  message?: string;
  tool_calls?: AgentToolCall[];
}

export const HTTP_TOOLS: OpenAITool[] = [
  {
    type: "function",
    function: {
      name: "generate_image",
      description:
        "Generate an image based on a descriptive prompt. Use this when the user asks to see, draw, create, or show an image of something.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "A detailed description of the image to generate.",
          },
        },
        required: ["prompt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_mockintosh_repo_file",
      description:
        "Fetch the current content of a file from the Mockintosh GitHub repository (gustavlrsn/mockintosh). Good paths: ARCHITECTURE.md, README.md, packages/sdk/docs/APP_DEV_GUIDE.md.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Repository path to the file.",
          },
        },
        required: ["path"],
      },
    },
  },
];

const ROLES = new Set(["system", "user", "assistant", "tool"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function parseToolCalls(value: unknown): OpenAIToolCall[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const calls: OpenAIToolCall[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== "string") continue;
    const fn = item.function;
    if (!isRecord(fn) || typeof fn.name !== "string") continue;
    const args = typeof fn.arguments === "string" ? fn.arguments : JSON.stringify(fn.arguments ?? {});
    calls.push({
      id: item.id,
      type: "function",
      function: { name: fn.name, arguments: args },
    });
  }
  return calls.length ? calls : undefined;
}

export function parseChatMessage(value: unknown): ChatMessage | null {
  if (!isRecord(value) || typeof value.role !== "string" || !ROLES.has(value.role)) return null;
  const role = value.role as ChatMessage["role"];
  const tool_calls = parseToolCalls(value.tool_calls);
  const content =
    value.content === undefined || value.content === null
      ? role === "assistant" && tool_calls
        ? null
        : ""
      : typeof value.content === "string"
        ? value.content
        : null;
  if (role !== "assistant" && role !== "tool" && typeof content !== "string") return null;
  if (role === "user" && !(content && content.trim())) return null;
  if (role === "tool" && typeof value.tool_call_id !== "string") return null;
  return {
    role,
    content,
    name: typeof value.name === "string" ? value.name : undefined,
    tool_call_id: typeof value.tool_call_id === "string" ? value.tool_call_id : undefined,
    tool_calls,
  };
}

/** `{ messages }` (required). Legacy `{ prompt, conversationHistory }` is also accepted. */
export function parseChatRequest(body: unknown): ChatMessage[] | null {
  if (!isRecord(body)) return null;
  if (Array.isArray(body.messages)) {
    const messages = body.messages.map(parseChatMessage).filter((m): m is ChatMessage => !!m);
    if (!messages.some((m) => m.role === "user")) return null;
    return messages;
  }
  if (typeof body.prompt === "string" && body.prompt.trim()) {
    const history = Array.isArray(body.conversationHistory)
      ? body.conversationHistory.map(parseChatMessage).filter((m): m is ChatMessage => !!m)
      : [];
    return [...history, { role: "user", content: body.prompt.trim() }];
  }
  return null;
}

export function parseClientTools(body: unknown): OpenAITool[] | undefined {
  if (!isRecord(body) || !Array.isArray(body.tools)) return undefined;
  const tools: OpenAITool[] = [];
  for (const item of body.tools) {
    if (!isRecord(item) || item.type !== "function" || !isRecord(item.function)) continue;
    const name = item.function.name;
    const description = item.function.description;
    const parameters = item.function.parameters;
    if (typeof name !== "string" || typeof description !== "string" || !isRecord(parameters)) continue;
    tools.push({
      type: "function",
      function: {
        name,
        description,
        parameters: parameters as unknown as OpenAIToolParameter,
      },
    });
  }
  return tools.length ? tools : undefined;
}

export function parseArguments(raw: string): Record<string, unknown> {
  try {
    const value = JSON.parse(raw || "{}");
    return isRecord(value) ? value : {};
  } catch {
    return {};
  }
}

/** Map one OpenAI chat-completion choice to the client complete result. */
export function completeFromLLMChoice(choice: unknown): CompleteResult {
  if (!isRecord(choice)) return { message: "" };
  const message = isRecord(choice.message) ? choice.message : {};
  const rawCalls = parseToolCalls(message.tool_calls);
  if (rawCalls?.length || choice.finish_reason === "tool_calls") {
    return {
      tool_calls: (rawCalls ?? []).map((call) => ({
        id: call.id,
        name: call.function.name,
        arguments: parseArguments(call.function.arguments),
      })),
    };
  }
  const content = message.content;
  return { message: typeof content === "string" ? content.trim() : "" };
}

export const AGENT_BRIEF = `You can operate this Mockintosh through tools that call the same OS traps as Terminal and Source Editor.

When the user asks you to build, create, or make an app:
1. Call project_create with path /disk/Applications/<Title>.app, a unique id (lowercase, underscores), and a title.
2. write src/index.tsx as SDK 2 Solid source: import { createSignal } from "solid-js", { defineApp } from "@mockintosh/sdk", components from "@mockintosh/ui". Put semantic={{name: "..."}} on values and Button name="..." on controls so you can inspect and click them (e.g. counter-value, counter-increment). For a drawing surface use <bitmap pixels={buf} width height> (1 byte/pixel, 0=white); replace the array to repaint; put onMouseDown/onDrag on the bitmap; leave room below it for chrome. Use <raster onPaint revision> only for camera/video. Never call browser globals (alert, document, window, fetch, localStorage); use useApp().os.showDialog, storage, fs, and fetch.
3. build_submit the project path; the tool waits until the compile finishes. If it failed, read diagnostics, write a fix, and build again.
4. app_install with the successful build id, then inspect and click to verify the app. open if you need the window again.

Generated apps share this computer's JavaScript realm. A runaway app requires a reload. Do not invent trap names. Prefer tools over guessing source that is already on disk — read it first.
`;
