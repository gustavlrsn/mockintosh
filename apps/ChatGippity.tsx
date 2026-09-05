import { For, createSignal, type JSX } from "solid-js";
import { Button, TextInput } from "@mockintosh/ui";
import { registerApp } from "../src/os/apps";
import { useWindow } from "../src/os/windowContext";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function ChatGippity(_props: Record<string, unknown>): JSX.Element {
  const win = useWindow();
  const [messages, setMessages] = createSignal<Msg[]>([]);
  const [draft, setDraft] = createSignal("");
  const [busy, setBusy] = createSignal(false);

  async function send(): Promise<void> {
    const text = draft().trim();
    if (!text || busy()) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages(), { role: "user", content: text }] }),
      });
      const data = await resp.json();
      const reply = data.content ?? data.message ?? JSON.stringify(data);
      setMessages((m) => [...m, { role: "assistant", content: String(reply) }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "(network error)" }]);
    }
    setBusy(false);
  }

  return (
    <box width={win.width()} height={win.height()} flexDirection="column" background={0}>
      <box overflow="scroll" flexGrow={1} padding={6} flexDirection="column" gap={4}>
        <For each={messages()}>
          {(msg) => (
            <text font="body" wrap>
              {`${msg.role === "user" ? "You" : "Gippity"}: ${msg.content}`}
            </text>
          )}
        </For>
      </box>
      <box height={22} flexDirection="row" gap={4} padding={2} borderColor={1} borderWidth={1}>
        <TextInput
          value={draft()}
          onChange={setDraft}
          onSubmit={() => void send()}
          width={win.width() - 70}
          placeholder="Message…"
        />
        <Button label={busy() ? "…" : "Send"} onClick={() => void send()} disabled={busy()} />
      </box>
    </box>
  );
}

registerApp({
  id: "chatgippity",
  title: "ChatGippity",
  icon: "icon/computer",
  defaultSize: { width: 320, height: 220 },
  Component: ChatGippity,
});
