import { MOCKINTOSH_CHAT_CONTEXT } from "./mockintosh-context";

const LLM_API_URL =
  process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";
const LLM_API_KEY = process.env.LLM_API_KEY || "";
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o-mini";
const IMAGE_API_URL = "https://api.openai.com/v1/images/generations";

const SYSTEM_PROMPT = `You are ChatGippity, a friendly and witty AI assistant living inside Mockintosh, a 1-bit Macintosh simulator running in the browser. Keep your responses concise and conversational. You can help with general questions, creative writing, brainstorming, coding advice, and casual chat. You have a retro personality that fits the Mac aesthetic — think 1984, think different.

You have the ability to generate images. Use the generate_image tool whenever the user asks you to draw, generate, create, or show an image of something.

When users ask about Mockintosh (what it is, how it works), the @mockintosh/sdk, how to develop apps for it, or who built it, you can:
1. Use the summary below for quick answers, or
2. Call the get_mockintosh_repo_file tool to fetch the latest docs from the GitHub repo (e.g. ARCHITECTURE.md, README.md, packages/sdk/docs/APP_DEV_GUIDE.md) for detailed or up-to-date answers. Prefer the tool when the user wants specifics, code examples, or current docs.
Keep answers accurate and point to the repo (https://github.com/gustavlrsn/mockintosh) or doc paths when helpful.
${MOCKINTOSH_CHAT_CONTEXT}`;

const GENERATE_IMAGE_TOOL = {
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
          description:
            "A detailed description of the image to generate. Be specific and descriptive for best results.",
        },
      },
      required: ["prompt"],
    },
  },
};

const GET_MOCKINTOSH_REPO_FILE_TOOL = {
  type: "function",
  function: {
    name: "get_mockintosh_repo_file",
    description:
      "Fetch the current content of a file from the Mockintosh GitHub repository (gustavlrsn/mockintosh). Use this when the user asks for detailed or up-to-date information about the OS, SDK, or app development. Good paths: ARCHITECTURE.md, README.md, packages/sdk/docs/APP_DEV_GUIDE.md.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Repository path to the file, e.g. ARCHITECTURE.md, README.md, packages/sdk/docs/APP_DEV_GUIDE.md",
        },
      },
      required: ["path"],
    },
  },
};

const CHAT_TOOLS = [GENERATE_IMAGE_TOOL, GET_MOCKINTOSH_REPO_FILE_TOOL];

async function callLLM(messages: object[], useTools: boolean): Promise<any> {
  const body: Record<string, unknown> = {
    model: LLM_MODEL,
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  };
  if (useTools) {
    body.tools = CHAT_TOOLS;
    body.tool_choice = "auto";
  }
  const resp = await fetch(LLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`LLM API error: ${err}`);
  }
  return resp.json();
}

const GITHUB_REPO = "gustavlrsn/mockintosh";
const GITHUB_RAW_MAX_CHARS = 14_000;

/**
 * Fetch raw file content from the Mockintosh GitHub repo. Returns truncated text if over limit.
 * Optional: set GITHUB_TOKEN in env for higher rate limits (5000/hr vs 60/hr unauthenticated).
 */
async function fetchMockintoshRepoFile(path: string): Promise<string> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURIComponent(
    path
  )}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
    "User-Agent": "Mockintosh-ChatGippity",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const resp = await fetch(url, { headers });
  if (!resp.ok) {
    const err = await resp.text();
    return `[Could not fetch ${path}: ${resp.status} ${err.slice(0, 200)}]`;
  }
  const text = await resp.text();
  if (text.length > GITHUB_RAW_MAX_CHARS) {
    return (
      text.slice(0, GITHUB_RAW_MAX_CHARS) +
      `\n\n[... truncated, ${text.length - GITHUB_RAW_MAX_CHARS} more chars]`
    );
  }
  return text;
}

async function generateImage(prompt: string): Promise<string | null> {
  const resp = await fetch(IMAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1.5",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "low",
    }),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data.data?.[0]?.b64_json ?? null;
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

  const { prompt, conversationHistory = [] } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Missing prompt" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages: object[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: prompt },
  ];

  try {
    // First call — LLM may respond with text or a tool call.
    const firstData = await callLLM(messages, true);
    const firstChoice = firstData.choices?.[0];
    const firstMessage = firstChoice?.message;

    // --- Tool calls (generate_image and/or get_mockintosh_repo_file) ---
    if (firstChoice?.finish_reason === "tool_calls") {
      const toolCalls = firstMessage?.tool_calls ?? [];
      const toolResults: {
        role: "tool";
        tool_call_id: string;
        content: string;
      }[] = [];
      let imageB64: string | null = null;
      let imagePrompt: string | null = null;

      for (const tc of toolCalls) {
        const name = tc.function?.name;
        let args: Record<string, string> = {};
        try {
          args = JSON.parse(tc.function?.arguments ?? "{}");
        } catch {
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: "[Invalid tool arguments]",
          });
          continue;
        }

        if (name === "generate_image" && args.prompt) {
          const b64 = await generateImage(args.prompt);
          if (b64) {
            imageB64 = b64;
            imagePrompt = args.prompt;
          }
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: imageB64
              ? "Image generated successfully."
              : "Image generation failed.",
          });
        } else if (name === "get_mockintosh_repo_file" && args.path) {
          const content = await fetchMockintoshRepoFile(args.path);
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content,
          });
        } else {
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: `[Unknown or invalid tool: ${name}]`,
          });
        }
      }

      const followUpMessages: object[] = [
        ...messages,
        firstMessage,
        ...toolResults,
      ];

      // One follow-up LLM call to turn tool results into a reply (no tools, so we get text only).
      const followUpData = await callLLM(followUpMessages, false);
      const reply =
        followUpData.choices?.[0]?.message?.content?.trim() ??
        "I couldn't process that.";

      if (imageB64 && imagePrompt) {
        return new Response(
          JSON.stringify({ message: reply, imagePrompt, b64: imageB64 }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // --- Normal text response ---
    const content = firstMessage?.content?.trim() ?? "";
    return new Response(JSON.stringify({ message: content }), {
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
