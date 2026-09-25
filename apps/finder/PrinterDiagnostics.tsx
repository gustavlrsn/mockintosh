/**
 * Printer Diagnostics — tests and questions for one printer, for setting up a
 * printer nobody has written a driver for yet: what it reports about itself,
 * which commands it obeys (cuts, density, status, vendor queries), its true
 * width and heat, and saving what was learnt as a driver file. A
 * Finder-hosted window opened from the Chooser.
 */
import { For, Show, createSignal, type Accessor, type Setter } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { Button, Select, TextInput, useApp } from "@mockintosh/sdk";
import {
  ESCPOS_CUT_COMMANDS,
  ESCPOS_TUNING_PRESETS,
  PRINTER_DENSITY_SCALES,
  densityLevelName,
  describePrinterIdentity,
  describePrinterStatus,
  describeProbeResults,
  type PrinterDensityControl,
} from "@mockintosh/print";
import { useOS, type OSServices } from "../../src/os/context";
import type { SystemPrinterEntry, SystemPrinters } from "../../src/os/printers/manager";
import type { PrinterDevice } from "../../src/os/printers/device";
import { FINDER_APP_ID } from "../../src/os/state";
import { openSystemWindow } from "../../src/os/systemWindows";
import {
  Divider,
  LABEL_W,
  PAD,
  Report,
  Row,
  Section,
  connectionLabel,
  mm,
  usePrinterActions,
  type PrinterActions,
} from "./printerUi";

export const PRINTER_DIAGNOSTICS_TITLE = "Printer Diagnostics";

const SIZE = { width: 360, height: 380 };
/** About 12 mm of paper. */
const FEED_DOTS = 96;

/** Which printer the window shows, per printer list, so the Chooser can point an open window elsewhere. */
const targets = new WeakMap<SystemPrinters, [Accessor<string | null>, Setter<string | null>]>();

function targetOf(printers: SystemPrinters) {
  let target = targets.get(printers);
  if (!target) {
    target = createSignal<string | null>(null);
    targets.set(printers, target);
  }
  return target;
}

export function PrinterDiagnostics(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const printers = useOS().printers;
  const win = app.window;
  const actions = usePrinterActions();
  const textWidth = () => win.width() - PAD * 2;
  const noteWidth = () => textWidth() - LABEL_W - 6;

  return (
    <box
      width={win.width()}
      padding={PAD}
      flexDirection="column"
      gap={6}
      background={0}
      onLayout={({ width, height }) => win.setContentSize(width, height)}
    >
      <Show when={printers} fallback={<text font="body">This Macintosh has no way to reach a printer.</text>}>
        {(ps) => {
          const [targetId, setTargetId] = targetOf(ps());
          const entry = () => {
            const list = ps().list();
            return list.find((e) => e.id === targetId()) ?? ps().defaultPrinter() ?? list[0] ?? null;
          };
          return (
            <Show when={entry()} fallback={<text font="body">No printers yet. Add one in the Chooser.</text>}>
              {(e) => (
                <>
                  <Section label="Printer" noteWidth={noteWidth()}>
                    <Select
                      name="diagnostics-printer"
                      value={e().id}
                      width={noteWidth()}
                      disabled={actions.busy()}
                      options={ps()
                        .list()
                        .map((p) => ({ value: p.id, label: p.name }))}
                      onChange={(id) => {
                        setTargetId(id);
                        actions.setReport([]);
                      }}
                    />
                  </Section>
                  <DiagnosticsPanel
                    printers={ps()}
                    entry={e()}
                    actions={actions}
                    noteWidth={noteWidth()}
                  />
                  <Report name="diagnostics-report" lines={actions.report()} width={textWidth()} />
                </>
              )}
            </Show>
          );
        }}
      </Show>
    </box>
  );
}

function DiagnosticsPanel(props: {
  printers: SystemPrinters;
  entry: SystemPrinterEntry;
  actions: PrinterActions;
  noteWidth: number;
}): JSX.Element {
  const { busy, run } = props.actions;
  const ps = props.printers;
  const entry = () => props.entry;
  const device = () => entry().device;
  const [driverName, setDriverName] = createSignal<string | null>(null);

  async function saveDriver(): Promise<void> {
    const name = driverName()?.trim() ?? "";
    await run(
      () => ps.saveAsDriver(entry().id, name),
      (driver) => {
        setDriverName(null);
        return [`Saved "${driver.name}" in the Printer Drivers folder (System Folder, Extensions) and switched to it.`];
      },
    );
  }

  return (
    <>
      <Row label="Link" name="diagnostics-link" value={connectionLabel(entry())} />
      <Row label="Driver" name="diagnostics-driver" value={entry().driver.name} />
      <Show when={entry().identity}>
        {(identity) => (
          <Section label="Reports" noteWidth={props.noteWidth}>
            <For each={describePrinterIdentity(identity())}>
              {(line) => <text font="body" width={props.noteWidth}>{line}</text>}
            </For>
          </Section>
        )}
      </Show>
      <Show when={driverName() !== null}>
        <Section
          label="Save as"
          noteWidth={props.noteWidth}
          note="A driver file others can copy. It records this printer's width, its commands, and how to recognise it."
        >
          <box flexDirection="row" gap={6} alignItems="center">
            <TextInput
              name="diagnostics-driver-name"
              value={driverName() ?? ""}
              onChange={setDriverName}
              onSubmit={() => void saveDriver()}
              onCancel={() => setDriverName(null)}
              width={props.noteWidth - 60}
              autoFocus
              selectAllOnFocus
            />
            <Button label="Save" disabled={busy() || !driverName()?.trim()} onClick={() => void saveDriver()} />
          </box>
        </Section>
      </Show>
      <box flexDirection="row" gap={6} alignItems="center">
        <Show when={device() && !device()!.connected()}>
          <Button label="Connect" disabled={busy()} onClick={() => void run(() => device()!.connect())} />
        </Show>
        <box flexGrow={1} />
        <Button
          label="Identify"
          disabled={busy() || !device()}
          onClick={() =>
            void run(
              () => ps.identify(entry().id),
              (identity) => (identity ? ["Asked the printer about itself; see Reports above."] : []),
            )
          }
        />
        <Show when={!entry().fixed}>
          <Button
            label="Save as Driver…"
            disabled={busy() || driverName() !== null}
            onClick={() => setDriverName(`${entry().name} ${mm(entry().dots, entry().driver.dpi) > 60 ? "80" : "58"} mm`)}
          />
        </Show>
      </box>
      <Show when={device()}>
        {(d) => (
          <DeviceTests
            device={d()}
            entry={entry()}
            density={entry().driver.density}
            actions={props.actions}
            noteWidth={props.noteWidth}
          />
        )}
      </Show>
    </>
  );
}

/** Tests that send something to the printer. */
function DeviceTests(props: {
  device: PrinterDevice;
  entry: SystemPrinterEntry;
  density: PrinterDensityControl | undefined;
  actions: PrinterActions;
  noteWidth: number;
}): JSX.Element {
  const { busy, run } = props.actions;
  const p = () => props.device;
  const isEscPos = () => p().profile.dialect === "escpos";
  return (
    <>
      <Divider />
      <box flexDirection="row" gap={6} alignItems="center">
        <text font="body" nowrap>Test</text>
        <box flexGrow={1} />
        <Button
          label="Status"
          disabled={busy()}
          onClick={() => void run(() => p().status(), (r) => (r ? describePrinterStatus(r) : []))}
        />
        <Button
          label="Feed"
          disabled={busy()}
          onClick={() => void run(() => p().feed(FEED_DOTS), () => ["Sent a paper feed."])}
        />
        <Button
          label="Test Page"
          disabled={busy()}
          onClick={() => void run(() => p().printTestPage(), () => ["Sent the test page."])}
        />
      </box>
      <Section
        label="Width"
        noteWidth={props.noteWidth}
        note={`Printing ${props.entry.dots} dots wide. Width Test prints one strip per width; the widest whose black end blocks both print is right. Set it in the Chooser.`}
      >
        <box flexDirection="row" gap={6}>
          <Button
            label="Width Test"
            disabled={busy()}
            onClick={() => void run(() => p().printWidthTest(), () => ["Sent the width test. Which strips print both end blocks?"])}
          />
        </box>
      </Section>
      <box flexDirection="row" gap={6} alignItems="center">
        <text font="body" nowrap>Heat</text>
        <box flexGrow={1} />
        <Show when={isEscPos()}>
          <Button
            label="Self-Test (GS ( A)"
            disabled={busy()}
            onClick={() =>
              void run(
                () => p().printSelfTest(),
                () => ["Asked the printer for its own test page. It lists firmware, density and speed."],
              )
            }
          />
        </Show>
        <Button
          label="Load Test"
          disabled={busy()}
          onClick={() =>
            void run(
              () => p().printLoadTest(),
              () => ["Sent blocks at 25%, 50% and 100% width. If only the narrow ones are black, full lines get less heat."],
            )
          }
        />
      </box>
      <Show when={isEscPos()}>
        <box flexDirection="row" gap={6} alignItems="center">
          <text font="body" nowrap>Cut</text>
          <box flexGrow={1} />
          <Button
            label="Recover"
            disabled={busy()}
            onClick={() => void run(() => p().recover(), () => ["Sent DLE ENQ 2: clear error and buffers. Press Status to check."])}
          />
          <box width={6} />
          <For each={ESCPOS_CUT_COMMANDS}>
            {({ command, label }) => (
              <Button
                label={label}
                disabled={busy()}
                onClick={() => void run(() => p().testCut(command), () => [`Sent a slip ending in ${label}. Did it cut?`])}
              />
            )}
          </For>
        </box>
        <box flexDirection="row" gap={6} alignItems="center">
          <text font="body" nowrap>Probe</text>
          <box flexGrow={1} />
          <Button
            label="Identify (GS I)"
            disabled={busy()}
            onClick={() => void run(() => p().probe("id"), (r) => (r ? describeProbeResults(r) : []))}
          />
          <Button
            label="Settings (GS ( E)"
            disabled={busy()}
            onClick={() =>
              void run(() => p().probe("settings"), (r) => (r ? describeProbeResults(r, { collapseSilent: true }) : []))
            }
          />
          <Show when={props.density?.command === "masung-dc3"}>
            <Button
              label="Masung"
              disabled={busy()}
              onClick={() => void run(() => p().probe("masung"), (r) => (r ? describeProbeResults(r) : []))}
            />
          </Show>
        </box>
        <Section
          label="Quality"
          noteWidth={props.noteWidth}
          note="Prints a grey-scale strip with each setting, one after another. Compare them, then cut."
        >
          <For each={ESCPOS_TUNING_PRESETS}>
            {(preset) => (
              <Button
                label={preset.label}
                disabled={busy()}
                onClick={() => void run(() => p().testTuning(preset), () => [`Sent the "${preset.label}" sample.`])}
              />
            )}
          </For>
        </Section>
      </Show>
      <Show when={props.density}>
        {(control) => (
          <DensityTests
            device={p()}
            control={control()}
            actions={props.actions}
            noteWidth={props.noteWidth}
            selfTest={isEscPos()}
          />
        )}
      </Show>
    </>
  );
}

/** Samples at each density step, and any level followed by the printer's own self-test. */
function DensityTests(props: {
  device: PrinterDevice;
  control: PrinterDensityControl;
  actions: PrinterActions;
  noteWidth: number;
  selfTest: boolean;
}): JSX.Element {
  const { busy, run } = props.actions;
  const scale = () => PRINTER_DENSITY_SCALES[props.control.command];
  const levelLabel = (level: number) => densityLevelName(scale(), level);
  const [custom, setCustom] = createSignal(String(scale().standard));
  const customLevel = () => {
    const text = custom().trim();
    const level = /^[+-]?\d+$/.test(text) ? Number(text) : NaN;
    return Number.isInteger(level) && level >= scale().min && level <= scale().max ? level : null;
  };
  const setCustomAndSelfTest = () => {
    const level = customLevel();
    if (level === null) return;
    void run(
      () => props.device.densitySelfTest(level),
      () => [`Sent density ${level}, then the self-test. What does its Print Density line say?`],
    );
  };
  return (
    <Section
      label="Density"
      noteWidth={props.noteWidth}
      note={`Stores each level in the printer (${scale().label}), then prints a sample. The last one sent stays.`}
    >
      <box flexDirection="row" gap={6}>
        <For each={scale().testLevels}>
          {(level) => (
            <Button
              label={levelLabel(level)}
              disabled={busy()}
              onClick={() =>
                void run(
                  () => props.device.testDensity(level),
                  () => [`Stored density ${levelLabel(level)} and sent a sample. Compare it with the others.`],
                )
              }
            />
          )}
        </For>
      </box>
      <Show when={props.selfTest}>
        <box flexDirection="row" gap={6} alignItems="center">
          <TextInput
            name="diagnostics-density-level"
            value={custom()}
            onChange={setCustom}
            onSubmit={setCustomAndSelfTest}
            width={48}
            selectAllOnFocus
          />
          <Button label="Set & Self-Test" disabled={busy() || customLevel() === null} onClick={setCustomAndSelfTest} />
          <text font="body" nowrap>{`${scale().min} to ${scale().max}`}</text>
        </box>
      </Show>
    </Section>
  );
}

/** Open Printer Diagnostics on `printerId` (the default printer when omitted), or bring it to the front there. */
export function openPrinterDiagnostics(os: OSServices, printerId?: string): string {
  if (os.printers && printerId) targetOf(os.printers)[1](printerId);
  return openSystemWindow(os, FINDER_APP_ID, {
    title: PRINTER_DIAGNOSTICS_TITLE,
    kind: "document",
    size: SIZE,
    scrollable: true,
    Component: PrinterDiagnostics,
  });
}
