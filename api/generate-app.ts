import { API_REFERENCE } from "../lib/canvas/sandbox/API_REFERENCE";

const LLM_API_URL =
  process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";
const LLM_API_KEY = process.env.LLM_API_KEY || "";
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `You are a code generator for Mockintosh, a 1-bit black-and-white Macintosh simulator.

${API_REFERENCE}

IMPORTANT RULES:
1. Output ONLY the JavaScript code for the app function. No markdown, no explanation, no backticks.
2. The code must define a function called \`app\` that takes an \`api\` parameter.
3. Keep it simple — the screen is tiny (usually 120-300px wide).
4. Every pixel is black or white. No colors, no gradients.
5. Use api.useState for all mutable state.
6. Use api.onMouseDown for button interactions.
7. Test your hit-test coordinates carefully.`;

function getSampleApp(): string {
  return `function app(api) {
  const [count, setCount] = api.useState(0);

  api.clear();
  api.drawRect(0, 0, api.width, api.height);
  api.bitmapText("Counter", api.width / 2, 8, { font: "ChiKareGo", align: "center" });
  api.drawHLine(0, 24, api.width);
  api.bitmapText(String(count), api.width / 2, 44, { font: "ChiKareGo", align: "center" });

  api.drawRect(20, 70, 40, 24);
  api.bitmapText("-", 40, 74, { font: "ChiKareGo", align: "center" });

  api.drawRect(api.width - 60, 70, 40, 24);
  api.bitmapText("+", api.width - 40, 74, { font: "ChiKareGo", align: "center" });

  api.onMouseDown((x, y) => {
    if (x >= 20 && x < 60 && y >= 70 && y < 94) setCount(count - 1);
    if (x >= api.width - 60 && x < api.width - 20 && y >= 70 && y < 94) setCount(count + 1);
  });
}`;
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
        error: "LLM_API_KEY not configured",
        code: getSampleApp(),
        explanation:
          "API key not configured. Here's a sample counter app instead.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    prompt,
    conversationHistory = [],
    stream: doStream,
  } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Missing prompt" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: prompt },
  ];

  try {
    if (doStream) {
      return await handleStreaming(messages);
    }
    return await handleNonStreaming(messages);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleStreaming(messages: any[]): Promise<Response> {
  const llmResponse = await fetch(LLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!llmResponse.ok) {
    const err = await llmResponse.text();
    return new Response(
      JSON.stringify({ error: "LLM API error", details: err }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const readable = new ReadableStream({
    async start(controller) {
      const reader = llmResponse.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop()!;

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const payload = trimmed.slice(6);
            if (payload === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              break;
            }
            try {
              const json = JSON.parse(payload);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ token: delta })}\n\n`
                  )
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function handleNonStreaming(messages: any[]): Promise<Response> {
  const llmResponse = await fetch(LLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!llmResponse.ok) {
    const err = await llmResponse.text();
    return new Response(
      JSON.stringify({ error: "LLM API error", details: err }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = await llmResponse.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  let code = content.trim();
  if (code.startsWith("```")) {
    code = code.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
  }

  return new Response(
    JSON.stringify({
      code,
      explanation: "App generated successfully. Click Preview to try it!",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export const config = { runtime: "edge" };
