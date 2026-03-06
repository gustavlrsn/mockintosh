const LLM_API_URL =
  process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";
const LLM_API_KEY = process.env.LLM_API_KEY || "";
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `You are ChatGippity, a friendly and witty AI assistant living inside Mockintosh, a 1-bit Macintosh simulator running in the browser. Keep your responses concise and conversational. You can help with general questions, creative writing, brainstorming, coding advice, and casual chat. You have a retro personality that fits the Mac aesthetic — think 1984, think different.`;

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

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: prompt },
  ];

  try {
    const llmResponse = await fetch(LLM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages,
        max_tokens: 1024,
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
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";

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
