const IMAGE_API_URL = "https://api.openai.com/v1/images/generations";
const LLM_API_KEY = process.env.LLM_API_KEY || "";

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
        error: "Image generation requires an LLM_API_KEY to be configured.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return new Response(JSON.stringify({ error: "Missing prompt" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const imgResponse = await fetch(IMAGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1.5",
        prompt: prompt.trim(),
        n: 1,
        size: "1024x1024",
        quality: "low",
      }),
    });

    if (!imgResponse.ok) {
      const err = await imgResponse.text();
      return new Response(
        JSON.stringify({ error: "Image API error", details: err }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await imgResponse.json();
    const b64 = data.data?.[0]?.b64_json ?? null;

    if (!b64) {
      return new Response(
        JSON.stringify({ error: "No image returned from API" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ b64 }), {
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
