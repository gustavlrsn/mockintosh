import { createSignal } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { Button, TextInput } from "@mockintosh/ui";
import { useApp, defineApp } from "@mockintosh/sdk";

type Mode = "markdown" | "stream" | "textweb";

function Safari(props: Record<string, unknown>): JSX.Element {
  const win = useApp().window;
  const fetch = useApp().fetch!; // present: the app requires "network"
  const [url, setUrl] = createSignal((props.url as string) ?? "https://example.com");
  const [body, setBody] = createSignal("Enter a URL and press Go.");
  const [mode, setMode] = createSignal<Mode>((props.mode as Mode) || "markdown");
  const [busy, setBusy] = createSignal(false);

  async function go(): Promise<void> {
    const target = url().trim();
    if (!target) return;
    setBusy(true);
    try {
      const resp = await fetch("/api/browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target, mode: mode() }),
      });
      const text = await resp.text();
      setBody(text.slice(0, 8000) || "(empty)");
    } catch {
      setBody("Failed to load page.");
    }
    setBusy(false);
  }

  return (
    <box width={win.width()} height={win.height()} flexDirection="column" background={0}>
      <box height={20} flexDirection="row" gap={4} padding={2} alignItems="center">
        <TextInput value={url()} onChange={setUrl} onSubmit={() => void go()} width={win.width() - 80} />
        <Button label={busy() ? "…" : "Go"} onClick={() => void go()} disabled={busy()} />
      </box>
      <box height={16} flexDirection="row" gap={4} padding={2}>
        <Button label="MD" onClick={() => setMode("markdown")} />
        <Button label="Stream" onClick={() => setMode("stream")} />
        <Button label="Textweb" onClick={() => setMode("textweb")} />
        <text font="body">{mode()}</text>
      </box>
      <box overflow="scroll" flexGrow={1} padding={6}>
        <text font="body" wrap>
          {body()}
        </text>
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
  Component: (p) => <Safari {...p} mode="stream" />,
});

export const SafariTextweb = defineApp({
  id: "safari-textweb",
  requires: ["network"],
  title: "Safari Textweb",
  icon: "icon/safari",
  defaultSize: { width: 400, height: 240 },
  Component: (p) => <Safari {...p} mode="textweb" />,
});
