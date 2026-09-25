import { parseHTML } from "linkedom";
import { Defuddle } from "defuddle/node";

const FETCH_TIMEOUT_MS = 10_000;

export interface BrowseResponse {
  title: string;
  markdown: string;
  url: string;
  domain: string;
}

export interface BrowseErrorResponse {
  error: string;
}

function normalizeUrl(raw: string): string {
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

/**
 * linkedom has no `getComputedStyle`. Defuddle's HTML-string entry polyfills
 * it; a raw `Document` does not, and extraction then keeps the whole page
 * (navigation and all) after `standardizeContent` throws.
 */
export function documentFromHtml(html: string, url: string): Document {
  const { document } = parseHTML(html);
  const view = document.defaultView as (Window & { getComputedStyle?: unknown }) | null;
  if (view && typeof view.getComputedStyle !== "function") {
    view.getComputedStyle = (() => ({ display: "" })) as typeof getComputedStyle;
  }
  const doc = document as Document & { styleSheets?: StyleSheetList; URL: string };
  if (!doc.styleSheets) doc.styleSheets = [] as unknown as StyleSheetList;
  doc.URL = url;
  return document;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let url: string;
  try {
    const body = await req.json();
    url = body?.url;
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const normalizedUrl = normalizeUrl(url.trim());

  let htmlText: string;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const resp = await fetch(normalizedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Upgrade-Insecure-Requests": "1",
        },
      });
      if (!resp.ok) {
        const hint =
          resp.status === 403 || resp.status === 401
            ? " (this site blocks automated access)"
            : resp.status === 404
            ? " (page not found)"
            : resp.status === 429
            ? " (rate limited — try again later)"
            : "";
        return new Response(
          JSON.stringify({
            error: `${resp.status} ${resp.statusText}${hint}`,
          }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
      htmlText = await resp.text();
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(err);
    return new Response(
      JSON.stringify({ error: `Could not fetch page: ${msg}` }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const document = documentFromHtml(htmlText, normalizedUrl);
    const result = await Defuddle(document, normalizedUrl, {
      markdown: true,
      useAsync: false,
      removeImages: false,
    });

    const payload: BrowseResponse = {
      title: result.title || "",
      markdown: (result.content as string) || "",
      url: normalizedUrl,
      domain: result.domain || "",
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: `Parse error: ${msg}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
