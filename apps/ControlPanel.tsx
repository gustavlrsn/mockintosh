import { desktopPatternName } from "../src/os/kernel/settings";
import { createSignal, For, type JSX } from "solid-js";
import { Checkbox } from "@mockintosh/ui";
import { useOS } from "../src/os/context";
import { defineApp, useApp } from "@mockintosh/sdk";

function ControlPanel(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const settings = useOS().desktopSettings!;
  const [error, setError] = createSignal("");
  const win = app.window;
  const computer = app.getSprite("icon/computer");

  return (
    <box width={win.width()} height={win.height()} flexDirection="row" background={0}>
      <box width={64} height="100%" padding={4} flexDirection="column" alignItems="center" gap={4} background={1}>
        {computer && (
          <image
            width={32}
            height={32}
            src={{ width: computer.width, height: computer.height, data: computer.data, mask: computer.mask }}
            mode="inverted"
          />
        )}
        <text font="body" color={0} align="center">
          General
        </text>
      </box>
      <box width={1} background={1} />
      <box padding={8} flexGrow={1} flexDirection="column" gap={8}>
        <text font="body">Desktop pattern</text>
        <box semantic={{ name: `${desktopPatternName}-preview`, role: "preview" }} width={48} height={48}
          background={settings.pattern() === "white" ? 0 : settings.pattern() === "black" ? 1 : "checker"} borderColor={1} />
        <For each={["checker", "white", "black"]}>{pattern =>
          <Checkbox name={`${desktopPatternName}-${pattern}`} label={pattern} checked={settings.pattern() === pattern}
            onChange={() => { void settings.set(pattern).then(() => setError(""), e => setError(String(e))); }} />
        }</For>
        <text>{error()}</text>
      </box>
    </box>
  );
}

export default defineApp({
  id: "control_panel",
  title: "Control Panel",
  icon: "icon/computer",
  defaultSize: { width: 320, height: 200 },
  Component: ControlPanel,
});
