import type { JSX } from "solid-js";
import type { Ink } from "@mockintosh/ui";
import { defineApp, useApp } from "@mockintosh/sdk";

function ControlPanel(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
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
        <raster
          width={48}
          height={48}
          onPaint={({ rect, setPixel }) => {
            for (let y = 0; y < rect.height; y++) {
              for (let x = 0; x < rect.width; x++) {
                setPixel(x, y, (((x >> 1) + (y >> 1)) % 2) as Ink);
              }
            }
          }}
        />
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
