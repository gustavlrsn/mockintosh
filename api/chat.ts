import { MOCKINTOSH_CHAT_CONTEXT } from "./mockintosh-context";
import {
  AGENT_BRIEF,
  HTTP_TOOLS,
  completeFromLLMChoice,
  parseChatRequest,
  parseClientTools,
  type ChatMessage,
} from "../src/shared/chatProtocol";

const LLM_API_URL =
  process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";
const LLM_API_KEY = process.env.LLM_API_KEY || "";
const LLM_MODEL = process.env.LLM_MODEL || "gpt-5.6-sol";

const SYSTEM_PROMPT = `You are ChatGippity, a friendly and witty AI assistant living inside Mockintosh, a 1-bit Macintosh simulator running in the browser. Keep your responses concise and conversational. You can help with general questions, creative writing, brainstorming, coding advice, casual chat, and building Mockintosh apps. You have a retro personality that fits the Mac aesthetic — think 1984, think different.

You have the ability to generate images. Use the generate_image tool whenever the user asks you to draw, generate, create, or show an image of something.

When users ask about Mockintosh (what it is, how it works), the @mockintosh/sdk, how to develop apps for it, or who built it, you can:
1. Use the summary below for quick answers, or
2. Call the get_mockintosh_repo_file tool to fetch the latest docs from the GitHub repo (e.g. ARCHITECTURE.md, README.md, packages/sdk/docs/APP_DEV_GUIDE.md) for detailed or up-to-date answers. Prefer the tool when the user wants specifics, code examples, or current docs.
Keep answers accurate and point to the repo (https://github.com/gustavlrsn/mockintosh) or doc paths when helpful.

${AGENT_BRIEF}
${MOCKINTOSH_CHAT_CONTEXT}`;

function toLLMMessages(messages: ChatMessage[]): object[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
      .filter((m) => m.role !== "system")
      .map((m) => {
        const out: Record<string, unknown> = { role: m.role, content: m.content ?? "" };
        if (m.tool_call_id) out.tool_call_id = m.tool_call_id;
        if (m.name) out.name = m.name;
        if (m.tool_calls) out.tool_calls = m.tool_calls;
        return out;
      }),
  ];
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!LLM_API_KEY) {
    return new Response(
      JSON.stringify({
        message:
          "Hi! I'm ChatGippity. The LLM API key isn't configured yet, so I can't chat for real. Set LLM_API_KEY in your environment to enable me!",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.json();
  const parsed = parseChatRequest(body);
  if (!parsed) {
    return new Response(JSON.stringify({ error: "Missing prompt" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const tools = parseClientTools(body) ?? HTTP_TOOLS;

  try {
    const payload: Record<string, unknown> = {
      model: LLM_MODEL,
      messages: toLLMMessages(parsed),
    };
    // GPT-5+ / o-series use completion-token caps and reject sampling params.
    if (/^gpt-5/i.test(LLM_MODEL) || /^o\d/i.test(LLM_MODEL)) {
      payload.max_completion_tokens = 4096;
    } else {
      payload.max_tokens = 2048;
      payload.temperature = 0.7;
    }
    if (tools.length) {
      payload.tools = tools;
      payload.tool_choice = "auto";
    }
    const resp = await fetch(LLM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`LLM API error: ${err}`);
    }
    const data = await resp.json();
    const result = completeFromLLMChoice(data.choices?.[0]);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = { runtime: "edge" };
