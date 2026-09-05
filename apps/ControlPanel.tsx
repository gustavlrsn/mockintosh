import { createSignal, type JSX } from "solid-js";
import { Button } from "@mockintosh/ui";
import { registerApp } from "../src/os/apps";
import { useOS } from "../src/os/context";
import { useWindow } from "../src/os/windowContext";
import { setColorMode, type ColorMode } from "../lib/canvas/ColorSystem";
import { DEFAULT_SYSTEM_PREFERENCES, saveSystemPreferences } from "../lib/canvas/SystemPreferences";
import type { GrafPort } from "@mockintosh/quickdraw";

export function ControlPanel(_props: Record<string, unknown>): JSX.Element {
  const os = useOS();
  const win = useWindow();
  const [mode, setMode] = createSignal<ColorMode>(
    DEFAULT_SYSTEM_PREFERENCES.colorMode ?? "monochrome"
  );
  const computer = os.sprites.get("icon/computer");

  function applyMode(next: ColorMode): void {
    setMode(next);
    setColorMode(next);
    DEFAULT_SYSTEM_PREFERENCES.colorMode = next;
    void saveSystemPreferences(DEFAULT_SYSTEM_PREFERENCES);
    os.scheduleRepaint();
  }

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
        <raster
          width={48}
          height={48}
          onPaint={(portUnknown, rect) => {
            const port = portUnknown as GrafPort;
            const { baseAddr, rowBytes, bounds } = port.portBits;
            for (let y = 0; y < rect.height; y++) {
              for (let x = 0; x < rect.width; x++) {
                const gx = rect.x + x;
                const gy = rect.y + y;
                baseAddr[(gy - bounds.top) * rowBytes + (gx - bounds.left)] =
                  ((x >> 1) + (y >> 1)) % 2;
              }
            }
          }}
        />
        <text font="body">Color mode</text>
        <box flexDirection="row" gap={8}>
          <Button
            label="monochrome"
            onClick={() => applyMode("monochrome")}
          />
          <Button label="colors" onClick={() => applyMode("colors")} />
        </box>
        <text font="body">{`Current: ${mode()}`}</text>
        <box flexDirection="row" gap={4}>
          <box width={14} height={14} background={2} borderColor={1} borderWidth={1} />
          <box width={14} height={14} background={3} borderColor={1} borderWidth={1} />
          <box width={14} height={14} background={4} borderColor={1} borderWidth={1} />
          <box width={14} height={14} background={7} borderColor={1} borderWidth={1} />
        </box>
      </box>
    </box>
  );
}

registerApp({
  id: "control_panel",
  title: "Control Panel",
  icon: "icon/computer",
  defaultSize: { width: 320, height: 200 },
  Component: ControlPanel,
});
