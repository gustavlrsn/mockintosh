const GITHUB_REPO = "gustavlrsn/mockintosh";
const GITHUB_RAW_MAX_CHARS = 14_000;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let path = "";
  if (req.method === "GET") {
    path = new URL(req.url).searchParams.get("path") ?? "";
  } else {
    const body = await req.json().catch(() => ({}));
    path = typeof (body as { path?: string }).path === "string" ? (body as { path: string }).path : "";
  }
  if (!path.trim()) {
    return new Response(JSON.stringify({ error: "Missing path" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
    "User-Agent": "Mockintosh-ChatGippity",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const resp = await fetch(url, { headers });
    if (!resp.ok) {
      const err = await resp.text();
      return new Response(
        JSON.stringify({
          content: `[Could not fetch ${path}: ${resp.status} ${err.slice(0, 200)}]`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    const text = await resp.text();
    const content =
      text.length > GITHUB_RAW_MAX_CHARS
        ? `${text.slice(0, GITHUB_RAW_MAX_CHARS)}\n\n[... truncated, ${text.length - GITHUB_RAW_MAX_CHARS} more chars]`
        : text;
    return new Response(JSON.stringify({ content }), {
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
