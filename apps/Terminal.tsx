import { createSignal, onCleanup, type JSX } from "solid-js";
import { TextInput } from "@mockintosh/ui";
import { defineApp, useApp } from "@mockintosh/sdk";
import { useOS } from "../src/os/context";
import { Cancellation } from "../src/os/kernel/cancellation";
function Terminal(): JSX.Element {
  const os = useOS(),
    app = useApp(),
    kernel = os.kernel!;
  const caller = kernel.createSession();
  const shell = os.shell!;
  const session = shell.open(caller, undefined, {keepAlive: true});
  let cwd = "/disk";
  const [input, setInput] = createSignal(""),
    [scrollback, setScrollback] = createSignal("Mockintosh shell S1. Type help.\n"),
    [busy, setBusy] = createSignal(false);
  const history: string[] = [];
  let index = 0,
    token: Cancellation | undefined,
    closed = false;
  const append = (text: string) => {
    if (!closed) setScrollback(old => (old + text).slice(-16384));
  };
  async function submit(command: string) {
    if (busy()) return;
    history.push(command);
    index = history.length;
    setInput("");
    setBusy(true);
    append(`${cwd}> ${command}\n`);
    token = new Cancellation();
    try {
      const result = await shell.run(caller, command, {
        session,
        cancellation: token,
        stdout: bytes => append(new TextDecoder().decode(bytes)),
        stderr: bytes => append(new TextDecoder().decode(bytes))
      });
      cwd = result.cwd;
      if (result.truncated.stdout || result.truncated.stderr) append("[output truncated]\n");
    } finally {
      if (!closed) setBusy(false);
    }
  }
  onCleanup(() => {
    closed = true;
    kernel.revokeSession(caller.id);
  });
  return <box width={app.window.width()} height={app.window.height()} padding={6} gap={4} background={0}>
    <box height={Math.max(0, app.window.height() - 32)} overflow="scroll" scrollOffset={Math.max(0, scrollback().split("\n").length * 14 - app.window.height() + 50)}>
      <text font="mono" wrap>{scrollback()}</text>
    </box>
    <TextInput name="terminal-command" value={input()} onChange={value => {
      if (!busy()) setInput(value);
    }} onSubmit={value => {
      void submit(value);
    }} width={app.window.width() - 12} autoFocus onInterrupt={() => token?.cancel()} onHistory={direction => {
      index = Math.max(0, Math.min(history.length, index + direction));
      setInput(history[index] ?? "");
    }} />
  </box>;
}
export default defineApp({
  id: "terminal",
  title: "Terminal",
  icon: "icon/computer",
  defaultSize: {
    width: 460,
    height: 260
  },
  singleInstance: false,
  scrollable: false,
  Component: Terminal
});
