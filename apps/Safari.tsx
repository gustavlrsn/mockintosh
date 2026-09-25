import { Show, createEffect, createSignal } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { Button, TextInput } from "@mockintosh/ui";
import { Markdown, useApp, defineApp } from "@mockintosh/sdk";

interface Page {
  title: string;
  markdown: string;
}

function normalizeUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[^\s]+\.[^\s]+$/.test(s)) return `https://${s}`;
  return null;
}

function Safari(props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;
  const fetch = app.fetch!; // present: the app requires "network"
  createEffect(() => true, () => {
    app.setMenus([
      { label: "File", items: [{ label: "Quit", shortcut: "Q", onClick: () => app.quit() }] },
    ]);
  });
  const [url, setUrl] = createSignal((props.url as string) ?? "https://example.com");
  const [page, setPage] = createSignal<Page | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [busy, setBusy] = createSignal(false);

  async function go(next?: string): Promise<void> {
    const target = normalizeUrl(next ?? url());
    if (!target) {
      setError("Enter a web address.");
      return;
    }
    setUrl(target);
    setBusy(true);
    setError(null);
    try {
      const resp = await fetch("/api/browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = (await resp.json()) as Page & { error?: string };
      if (!resp.ok || data.error || !data.markdown) {
        setPage(null);
        setError(data.error || `Could not load page (${resp.status})`);
        return;
      }
      setPage({ title: data.title || target, markdown: data.markdown });
      win.setTitle(data.title || "Safari");
    } catch {
      setPage(null);
      setError("Failed to load page.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <box width={win.width()} height={win.height()} flexDirection="column" background={0}>
      <box height={20} flexDirection="row" gap={4} padding={2} alignItems="center">
        <TextInput value={url()} onChange={setUrl} onSubmit={() => void go()} width={win.width() - 80} />
        <Button label={busy() ? "…" : "Go"} onClick={() => void go()} disabled={busy()} />
      </box>
      <box overflow="scroll" flexGrow={1} padding={6}>
        <Show when={error()}>
          {(message) => <text font="body" wrap>{message()}</text>}
        </Show>
        <Show when={!page() && !error() && !busy()}>
          <text font="body" wrap>Enter a URL and press Go.</text>
        </Show>
        <Show when={busy() && !page()}>
          <text font="body">Loading…</text>
        </Show>
        <Show when={page()}>
          {(loaded) => (
            <box flexDirection="column" gap={6} width="100%">
              <text font="menu" wrap>{loaded().title}</text>
              <Markdown text={loaded().markdown} />
            </box>
          )}
        </Show>
      </box>
    </box>
  );
}

export default defineApp({
  id: "safari",
  requires: ["network"],
  title: "Safari",
  icon: "icon/safari",
  defaultSize: { width: 400, height: 240 },
  scrollable: true,
  Component: Safari,
});

export const SafariStream = defineApp({
  id: "safari-stream",
  requires: ["network"],
  title: "Safari Stream",
  icon: "icon/safari",
  defaultSize: { width: 400, height: 240 },
  Component: Safari,
});

export const SafariTextweb = defineApp({
  id: "safari-textweb",
  requires: ["network"],
  title: "Safari Textweb",
  icon: "icon/safari",
  defaultSize: { width: 400, height: 240 },
  Component: Safari,
});
