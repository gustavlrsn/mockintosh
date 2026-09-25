/**
 * Chooser — the list of printers and which one is the default: add USB and
 * Bluetooth printers, and pick each one's driver, width, speed and density.
 * Tests and questions for a printer live in Printer Diagnostics, opened from
 * here. A Finder-hosted window like the Control Panel, opened from the Apple menu.
 */
import { For, Show, createSignal } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { Button, RadioGroup, Select, useApp } from "@mockintosh/sdk";
import {
  PRINTER_DENSITY_SCALES,
  PRINTER_SPEEDS,
  WIDTH_TEST_DOTS,
  densityLevelName,
  type PrinterDensityControl,
  type PrinterLinkKind,
  type PrinterSpeed,
  type PrinterSpeedLevel,
} from "@mockintosh/print";
import { useOS, type OSServices } from "../../src/os/context";
import type { SystemPrinterEntry, SystemPrinters } from "../../src/os/printers/manager";
import { FINDER_APP_ID } from "../../src/os/state";
import { openSystemWindow } from "../../src/os/systemWindows";
import { openPrinterDiagnostics } from "./PrinterDiagnostics";
import {
  Divider,
  LABEL_W,
  LINK_LABEL,
  PAD,
  Report,
  Row,
  Section,
  connectionLabel,
  mm,
  usePrinterActions,
} from "./printerUi";

export const CHOOSER_TITLE = "Chooser";

const SIZE = { width: 340, height: 300 };
const SPEED_LABELS: Record<PrinterSpeed, string> = { low: "Low", normal: "Normal", high: "High" };
/** The speed menu's choice before one has been stored from here. */
const PRINTER_OWN_SPEED = "printer";
/** The width menu's "as the driver says" choice. */
const DRIVER_WIDTH = "driver";
/** The density menu's choice before one has been stored from here. */
const DENSITY_UNKNOWN = "unknown";

export function Chooser(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const os = useOS();
  const printers = os.printers;
  const win = app.window;
  const { busy, report, run } = usePrinterActions();
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const textWidth = () => win.width() - PAD * 2;
  const noteWidth = () => textWidth() - LABEL_W - 6;

  const selected = (ps: SystemPrinters): SystemPrinterEntry | null => {
    const list = ps.list();
    return list.find((e) => e.id === selectedId()) ?? ps.defaultPrinter() ?? list[0] ?? null;
  };

  function describeAdded(ps: SystemPrinters, entry: SystemPrinterEntry | null): string[] {
    if (!entry) return [];
    setSelectedId(entry.id);
    const best = ps.candidates(entry.id).find((c) => c.driver.id === entry.driver.id);
    const why = best && best.reasons.length > 0 ? ` (${best.reasons.join(", ")})` : " (no closer match; pick one below)";
    return [`Added "${entry.name}" with the ${entry.driver.name} driver${why}.`];
  }

  const addLabel = (kind: PrinterLinkKind) => (kind === "usb" ? "Add USB…" : "Add Bluetooth…");

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
        {(ps) => (
          <>
            <Show when={ps().problem()}>{(problem) => <text font="body" width={textWidth()}>{problem()}</text>}</Show>
            <Show
              when={ps().list().length > 0}
              fallback={
                <text font="body" width={textWidth()}>
                  No printers yet. Switch your printer on, then add it. Only devices that could be printers are
                  listed; pick the one named after your printer, often "Printer", "POS" or the maker's name.
                </text>
              }
            >
              <RadioGroup
                name="chooser-printers"
                value={selected(ps())?.id ?? ""}
                onChange={setSelectedId}
                options={ps()
                  .list()
                  .map((e) => ({
                    value: e.id,
                    label: `${e.name} (${LINK_LABEL[e.link]}${e.isDefault ? ", default" : ""})`,
                  }))}
              />
            </Show>
            <box flexDirection="row" gap={6} alignItems="center">
              <box flexGrow={1} />
              <For each={ps().linkKinds}>
                {(kind) => (
                  <Button
                    label={addLabel(kind)}
                    disabled={busy()}
                    onClick={() => void run(() => ps().add(kind), (entry) => describeAdded(ps(), entry))}
                  />
                )}
              </For>
            </box>
            <Show when={selected(ps())}>{(entry) => <PrinterSetupPanel ps={ps()} entry={entry()} />}</Show>
            <Report name="chooser-report" lines={report()} width={textWidth()} />
          </>
        )}
      </Show>
    </box>
  );

  /** The selected printer's setup: link, driver, width, speed and density. */
  function PrinterSetupPanel(props: { ps: SystemPrinters; entry: SystemPrinterEntry }): JSX.Element {
    const ps = props.ps;
    const entry = () => props.entry;
    const device = () => entry().device;

    const driverOptions = () => {
      const e = entry();
      const candidates = e.fixed ? [] : ps.candidates(e.id);
      const top = candidates[0];
      return candidates.map((c) => ({
        value: c.driver.id,
        label: `${c.driver.name}${c === top && c.score > 0 ? " (matches)" : ""}`,
      }));
    };

    const widthLabel = (dots: number) => `${dots} dots, ${mm(dots, entry().driver.dpi)} mm`;
    const widthOptions = () => {
      const e = entry();
      const widths = new Set<number>(WIDTH_TEST_DOTS);
      if (e.dotsOverridden) widths.add(e.dots);
      return [
        { value: DRIVER_WIDTH, label: `Driver's (${widthLabel(e.driver.dots)})` },
        ...[...widths]
          .filter((dots) => dots !== e.driver.dots)
          .sort((a, b) => a - b)
          .map((dots) => ({ value: String(dots), label: widthLabel(dots) })),
      ];
    };

    function chooseWidth(value: string): void {
      const dots = value === DRIVER_WIDTH ? null : Number(value);
      void run(
        () => ps.setDots(entry().id, dots),
        () => [`Printing ${widthLabel(dots ?? entry().driver.dots)} wide.`],
      );
    }

    const speedLevels = (): readonly PrinterSpeedLevel[] =>
      entry().driver.speed?.levels ?? PRINTER_SPEEDS.map((speed) => ({ speed, label: SPEED_LABELS[speed] }));

    /** The last speed stored from here, if the driver still offers it. */
    const storedSpeed = (): PrinterSpeed | null => {
      const speed = entry().speed;
      return speedLevels().some((l) => l.speed === speed) ? speed : null;
    };

    function chooseSpeed(value: string): void {
      const level = speedLevels().find((l) => l.speed === value);
      const d = device();
      if (!level || !d) return;
      void run(
        () => d.storeSpeed(level.speed),
        () => [`The printer now prints at ${level.label}.`],
      );
    }

    return (
      <>
        <Divider />
        <Row label="Link" name="chooser-link" value={connectionLabel(entry())} />
        <Show
          when={!entry().fixed}
          fallback={<Row label="Driver" name="chooser-driver" value={entry().driver.name} />}
        >
          <Section
            label="Driver"
            noteWidth={noteWidth()}
            note={entry().driverMissing ? "Its driver file is gone; using a generic one." : undefined}
          >
            <Select
              name="chooser-driver"
              value={entry().driver.id}
              width={noteWidth()}
              disabled={busy()}
              options={driverOptions()}
              onChange={(id) => void run(() => ps.setDriver(entry().id, id), () => [`Now using the ${entry().driver.name} driver.`])}
            />
          </Section>
        </Show>
        <Show
          when={!entry().fixed}
          fallback={<Row label="Width" name="chooser-width" value={widthLabel(entry().dots)} />}
        >
          <Section label="Width" noteWidth={noteWidth()}>
            <Select
              name="chooser-width"
              value={entry().dotsOverridden ? String(entry().dots) : DRIVER_WIDTH}
              width={noteWidth()}
              disabled={busy()}
              options={widthOptions()}
              onChange={chooseWidth}
            />
          </Section>
        </Show>
        <Show when={!entry().fixed && device() && entry().driver.speed}>
          <Section label="Speed" noteWidth={noteWidth()}>
            <Select
              name="chooser-speed"
              value={storedSpeed() ?? PRINTER_OWN_SPEED}
              width={noteWidth()}
              disabled={busy()}
              options={[
                ...(storedSpeed() === null ? [{ value: PRINTER_OWN_SPEED, label: "Printer's setting" }] : []),
                ...speedLevels().map((l) => ({ value: l.speed, label: l.label })),
              ]}
              onChange={chooseSpeed}
            />
          </Section>
        </Show>
        <Show when={!entry().fixed && device() && entry().driver.density}>
          {(control) => <DensitySetting control={control()} />}
        </Show>
        <Show when={device() && entry().driver.dialect === "escpos"}>
          <Section label="Check" noteWidth={noteWidth()} note="The printer's own page lists the density, speed and firmware it's using.">
            <box flexDirection="row">
              <Button
                label="Print Self-Test"
                disabled={busy()}
                onClick={() => void run(() => device()!.printSelfTest(), () => ["Sent the self-test."])}
              />
            </box>
          </Section>
        </Show>
        <box flexDirection="row" gap={6} alignItems="center">
          <Show when={device() && !device()!.connected()}>
            <Button label="Connect" disabled={busy()} onClick={() => void run(() => device()!.connect())} />
          </Show>
          <Show when={!entry().fixed}>
            <Button
              label="Remove"
              disabled={busy()}
              onClick={() => {
                const { id, name } = entry();
                setSelectedId(null);
                void run(() => ps.remove(id), () => [`Removed "${name}".`]);
              }}
            />
          </Show>
          <box flexGrow={1} />
          <Button label="Diagnostics…" onClick={() => openPrinterDiagnostics(os, entry().id)} />
          <Button
            label="Make Default"
            disabled={busy() || entry().isDefault}
            onClick={() => void run(() => ps.setDefault(entry().id), () => [`Apps now print to "${entry().name}".`])}
          />
        </box>
      </>
    );

    /** The printer keeps its density itself; this stores a new one and shows the last stored from here. */
    function DensitySetting(props: { control: PrinterDensityControl }): JSX.Element {
      const scale = () => PRINTER_DENSITY_SCALES[props.control.command];
      const options = () => {
        const stored = entry().density;
        const levels = [...scale().testLevels];
        const known = stored !== null && levels.includes(stored);
        return [
          ...(stored === null ? [{ value: DENSITY_UNKNOWN, label: "Printer's setting" }] : []),
          ...(stored !== null && !known ? [{ value: String(stored), label: `${densityLevelName(scale(), stored)} (${stored})` }] : []),
          ...levels.map((level) => ({
            value: String(level),
            label: `${densityLevelName(scale(), level)}${level === scale().standard ? " (standard)" : ""}`,
          })),
        ];
      };
      function chooseDensity(value: string): void {
        const level = Number(value);
        if (value === DENSITY_UNKNOWN || !Number.isInteger(level)) return;
        void run(
          () => device()!.storeDensity(level),
          () => [`The printer now prints at ${densityLevelName(scale(), level)} density.`],
        );
      }
      return (
        <Section label="Density" noteWidth={noteWidth()}>
          <Select
            name="chooser-density"
            value={entry().density === null ? DENSITY_UNKNOWN : String(entry().density)}
            width={noteWidth()}
            disabled={busy()}
            options={options()}
            onChange={chooseDensity}
          />
        </Section>
      );
    }
  }
}

/** Open the Chooser, or bring the open one to the front. */
export function openChooser(os: OSServices): string {
  return openSystemWindow(os, FINDER_APP_ID, {
    title: CHOOSER_TITLE,
    kind: "document",
    size: SIZE,
    scrollable: true,
    Component: Chooser,
  });
}
