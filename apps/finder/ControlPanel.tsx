/**
 * Control Panel — a Finder-hosted window, as in System 7 (the Control Panel
 * desk accessory of System 6 was retired). Opened from the Apple menu.
 */
import { createEffect, createMemo, createSignal, For } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { WindowHeader, useApp } from "@mockintosh/sdk";
import type { Fill } from "@mockintosh/ui";
import { desktopPatternName } from "../../src/os/kernel/settings";
import { useOS, type OSServices } from "../../src/os/context";
import { FINDER_APP_ID } from "../../src/os/state";
import { openSystemWindow } from "../../src/os/systemWindows";
import {
  catalogPatternValue,
  desktopFill,
  desktopPatterns,
  patternBytes,
} from "../../src/os/resourceCatalog/catalog";

export const CONTROL_PANEL_TITLE = "Control Panel";

const CELL = 32;
const CELL_PAD = 1;
const TILE = CELL + CELL_PAD * 2;
const GAP = 2;
const PAD = 6;
const PREVIEW = 48;
const HEADER_H = PAD * 2 + PREVIEW;

interface PatternChoice {
  value: string;
  name: string;
  fill: Fill;
}

const NAMED_CHOICES: PatternChoice[] = [
  { value: "checker", name: "checker", fill: "checker" },
  { value: "white", name: "white", fill: 0 },
  { value: "black", name: "black", fill: 1 },
];

const CATALOG_CHOICES: PatternChoice[] = desktopPatterns().map((p) => ({
  value: catalogPatternValue(p.id),
  name: `ppat-${p.id}`,
  fill: patternBytes(p.pat),
}));

const CHOICES: PatternChoice[] = [...NAMED_CHOICES, ...CATALOG_CHOICES];

export function ControlPanel(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const settings = useOS().desktopSettings!;
  const [error, setError] = createSignal("");
  const win = app.window;

  const columns = createMemo(() =>
    Math.max(1, Math.floor((win.width() - PAD * 2 + GAP) / (TILE + GAP))),
  );
  const rows = createMemo(() => {
    const cols = columns();
    const out: PatternChoice[][] = [];
    for (let i = 0; i < CHOICES.length; i += cols) out.push(CHOICES.slice(i, i + cols));
    return out;
  });
  const contentHeight = createMemo(() => {
    const n = rows().length;
    return n === 0 ? 0 : PAD * 2 + n * TILE + (n - 1) * GAP;
  });

  createEffect(
    () => ({ width: win.width(), height: contentHeight() }),
    ({ width, height }) => win.setContentSize(width, height),
  );

  const apply = (value: string) => {
    void settings.set(value).then(
      () => setError(""),
      (e) => setError(String(e)),
    );
  };

  return (
    <>
      <WindowHeader height={HEADER_H}>
        <box height={HEADER_H} padding={PAD} flexDirection="row" gap={8} alignItems="center" background={0}>
          <box
            semantic={{ name: `${desktopPatternName}-preview`, role: "preview" }}
            width={PREVIEW}
            height={PREVIEW}
            background={desktopFill(settings.pattern())}
            borderColor={1}
          />
          <box flexDirection="column" gap={2} flexGrow={1}>
            <text font="body" nowrap>Desktop pattern</text>
            <text font="body" nowrap semantic={{ name: `${desktopPatternName}-value`, role: "status" }}>
              {settings.pattern()}
            </text>
            <text nowrap>{error()}</text>
          </box>
        </box>
      </WindowHeader>
      <box
        semantic={{ name: `${desktopPatternName}-grid`, role: "scrollbar" }}
        width={win.width()}
        height={contentHeight()}
        padding={PAD}
        flexDirection="column"
        gap={GAP}
        background={0}
      >
        <For each={rows()}>
          {(row) => (
            <box flexDirection="row" height={TILE} gap={GAP}>
              <For each={row}>
                {(choice) => {
                  const active = () => settings.pattern() === choice.value;
                  return (
                    <box
                      semantic={{ name: `${desktopPatternName}-${choice.name}`, role: "button" }}
                      width={TILE}
                      height={TILE}
                      padding={CELL_PAD}
                      background={active() ? 1 : 0}
                      onClick={() => apply(choice.value)}
                    >
                      <box width={CELL} height={CELL} background={choice.fill} borderColor={active() ? 0 : 1} />
                    </box>
                  );
                }}
              </For>
            </box>
          )}
        </For>
      </box>
    </>
  );
}

/** Open the Control Panel, or bring the open one to the front. */
export function openControlPanel(os: OSServices): string {
  return openSystemWindow(os, FINDER_APP_ID, {
    title: CONTROL_PANEL_TITLE,
    kind: "document",
    size: { width: 340, height: 240 },
    minSize: { width: 240, height: 120 },
    resizable: true,
    scrollable: true,
    Component: ControlPanel,
  });
}
