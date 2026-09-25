/**
 * Control Panel — a Finder-hosted window opened from the Apple menu.
 * Desktop pattern is the System 6 control: an 8×8 fat-bits editor, and a
 * miniature desktop whose arrows step through System `PAT#` 0. The clock
 * and date read the host time.
 */
import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { Radio, useApp } from "@mockintosh/sdk";
import { desktopPatternName } from "../../src/os/kernel/settings";
import { useOS, type OSServices } from "../../src/os/context";
import type { HostDisplay } from "../../src/platform/types";
import { FINDER_APP_ID } from "../../src/os/state";
import { openSystemWindow } from "../../src/os/systemWindows";
import {
  desktopFill,
  desktopPatternBytes,
  desktopPatternToken,
  patternBytes,
  patternHex,
  systemPatterns,
} from "../../src/os/resourceCatalog/catalog";

export const CONTROL_PANEL_TITLE = "Control Panel";

const PANEL_W = 280;
const CELL = 7;
const EDITOR = CELL * 8 + 9;

const STOCK = systemPatterns();

function stockIndex(value: string): number {
  const hex = patternHex(desktopPatternBytes(value));
  return STOCK.findIndex((p) => p.pat === hex);
}

function Group(props: { title: string; children: JSX.Element }): JSX.Element {
  return (
    <box flexDirection="column" gap={3} padding={4} borderColor={1} borderWidth={1} alignItems="center">
      <text font="body" nowrap>{props.title}</text>
      {props.children}
    </box>
  );
}

function PatternEditor(props: { bytes: () => Uint8Array; onToggle: (x: number, y: number) => void }): JSX.Element {
  const rows = () => {
    const bytes = props.bytes();
    return Array.from({ length: 8 }, (_, y) =>
      Array.from({ length: 8 }, (_, x) => ((bytes[y] >> (7 - x)) & 1) as 0 | 1),
    );
  };
  return (
    <box
      semantic={{ name: `${desktopPatternName}-editor`, role: "group" }}
      width={EDITOR}
      height={EDITOR}
      padding={1}
      gap={1}
      flexDirection="column"
      background={1}
      cursor="pointer"
      onClick={(x, y) => {
        const cx = Math.min(7, Math.max(0, Math.floor((x - 1) / (CELL + 1))));
        const cy = Math.min(7, Math.max(0, Math.floor((y - 1) / (CELL + 1))));
        props.onToggle(cx, cy);
      }}
    >
      <For each={rows()}>
        {(row, y) => (
          <box flexDirection="row" height={CELL} gap={1}>
            <For each={row}>
              {(bit, x) => (
                <box
                  semantic={{ name: `${desktopPatternName}-cell-${x()}-${y()}`, role: "button" }}
                  width={CELL}
                  height={CELL}
                  background={bit}
                  cursor="pointer"
                  onClick={() => props.onToggle(x(), y())}
                />
              )}
            </For>
          </box>
        )}
      </For>
    </box>
  );
}

function PatternBrowser(props: { fill: () => ReturnType<typeof desktopFill>; onStep: (delta: number) => void }): JSX.Element {
  return (
    <box width={84} flexDirection="column" borderColor={1} borderWidth={1}>
      <box height={18} flexDirection="row" borderColor={1} borderWidth={1}>
        <box
          semantic={{ name: `${desktopPatternName}-prev`, role: "button" }}
          flexGrow={1}
          height={16}
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          onClick={() => props.onStep(-1)}
        >
          <text font="body" nowrap>{"<"}</text>
        </box>
        <box
          semantic={{ name: `${desktopPatternName}-next`, role: "button" }}
          flexGrow={1}
          height={16}
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          onClick={() => props.onStep(1)}
        >
          <text font="body" nowrap>{">"}</text>
        </box>
      </box>
      <box
        semantic={{ name: `${desktopPatternName}-preview`, role: "preview" }}
        height={EDITOR - 20}
        background={props.fill()}
      />
    </box>
  );
}

function HostPane(props: { display: HostDisplay }): JSX.Element {
  const [tick, setTick] = createSignal(0);
  const stop = props.display.subscribe(() => setTick((n) => n + 1));
  onCleanup(stop);
  const state = () => {
    tick();
    return props.display.state();
  };
  const scales = () => {
    const current = state();
    const selected = typeof current.scale === "number" ? current.scale : 1;
    const choices: { value: string; label: string }[] = [{ value: "auto", label: "Auto" }];
    for (let zoom = 1; zoom <= Math.max(current.maxScale, selected); zoom++) {
      choices.push({ value: String(zoom), label: `${zoom}x` });
    }
    return choices;
  };
  return (
    <Group title="Host">
      <box flexDirection="column" gap={4} alignItems="flex-start">
        <text font="body" nowrap>Resolution</text>
        <For each={props.display.resolutions}>
          {(item) => (
            <Radio
              name={`host-resolution-${item.id}`}
              checked={state().resolution === item.id}
              label={item.label}
              onChange={() => props.display.setResolution(item.id)}
            />
          )}
        </For>
        <text font="body" nowrap>Scaling</text>
        <For each={scales()}>
          {(item) => (
            <Radio
              name={`host-scale-${item.value}`}
              checked={String(state().scale) === item.value}
              label={item.label}
              onChange={() => props.display.setScale(item.value === "auto" ? "auto" : Number(item.value))}
            />
          )}
        </For>
      </box>
    </Group>
  );
}

export function ControlPanel(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;
  const os = useOS();
  const settings = os.desktopSettings!;
  const [error, setError] = createSignal("");
  const [hours, setHours] = createSignal("12");
  const [browse, setBrowse] = createSignal(Math.max(0, stockIndex(settings.pattern())));
  const [now, setNow] = createSignal(new Date());
  let pendingSteps = 0;
  createEffect(
    () => settings.pattern(),
    (value) => {
      const index = stockIndex(value);
      if (pendingSteps === 0 && index >= 0) setBrowse(index);
    },
  );
  const timer = setInterval(() => setNow(new Date()), 1000);
  onCleanup(() => clearInterval(timer));

  const bytes = () => desktopPatternBytes(settings.pattern());
  const apply = (value: string) => {
    void settings.set(value).then(
      () => setError(""),
      (e) => setError(String(e)),
    );
  };
  const step = (delta: number) => {
    const index = (browse() + delta + STOCK.length) % STOCK.length;
    pendingSteps++;
    setBrowse(index);
    void settings.set(desktopPatternToken(patternBytes(STOCK[index].pat))).then(
      () => setError(""),
      (e) => setError(String(e)),
    ).finally(() => {
      pendingSteps--;
    });
  };
  const toggle = (x: number, y: number) => {
    const next = new Uint8Array(bytes());
    next[y] ^= 0x80 >> x;
    apply(desktopPatternToken(next));
  };
  const clock = () => {
    const date = now();
    const h24 = date.getHours();
    const h = hours() === "24" ? h24 : h24 % 12 || 12;
    const suffix = hours() === "24" ? "" : h24 < 12 ? " AM" : " PM";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${h}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${suffix}`;
  };
  const dateLabel = () => {
    const date = now();
    return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(2)}`;
  };

  return (
    <box
      width={Math.max(win.width(), PANEL_W)}
      padding={6}
      flexDirection="column"
      gap={6}
      background={0}
      onLayout={({ width, height }) => win.setContentSize(width, height)}
    >
      <Group title="Desktop Pattern">
        <box flexDirection="row" gap={8} alignItems="center">
          <PatternEditor bytes={bytes} onToggle={toggle} />
          <PatternBrowser fill={() => desktopFill(settings.pattern())} onStep={step} />
        </box>
        <Show when={error()}>
          <text font="body" nowrap>{error()}</text>
        </Show>
      </Group>
      <box flexDirection="row" gap={6}>
        <Group title="Time">
          <text font="body" nowrap semantic={{ name: "control-panel-time", role: "status" }}>{clock()}</text>
          <box flexDirection="row" gap={8}>
            <Radio name="time-12" checked={hours() === "12"} label="12hr." onChange={() => setHours("12")} />
            <Radio name="time-24" checked={hours() === "24"} label="24hr." onChange={() => setHours("24")} />
          </box>
        </Group>
        <Group title="Date">
          <text font="body" nowrap semantic={{ name: "control-panel-date", role: "status" }}>{dateLabel()}</text>
        </Group>
      </box>
      <Show when={os.hostDisplay}>
        {(display) => <HostPane display={display()} />}
      </Show>
    </box>
  );
}

/** Open the Control Panel, or bring the open one to the front. */
export function openControlPanel(os: OSServices): string {
  return openSystemWindow(os, FINDER_APP_ID, {
    title: CONTROL_PANEL_TITLE,
    kind: "document",
    size: { width: PANEL_W, height: 400 },
    minSize: { width: 220, height: 140 },
    resizable: true,
    scrollable: true,
    Component: ControlPanel,
  });
}
