/**
 * Pieces shared by the Chooser and Printer Diagnostics windows: label rows,
 * labelled sections, and running a printer action with a busy flag, a
 * report of what happened, and an alert when it fails.
 */
import { For, Show, createSignal, type Accessor } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { useApp } from "@mockintosh/sdk";
import type { SystemPrinterEntry } from "../../src/os/printers/manager";

export const PAD = 8;
export const LABEL_W = 48;

export const LINK_LABEL: Record<SystemPrinterEntry["link"], string> = {
  usb: "USB",
  bluetooth: "Bluetooth",
  fixed: "Built in",
};

export const mm = (dots: number, dpi: number) => Math.round((dots / dpi) * 25.4);

/** "USB, connected to …", for a printer's Link row. */
export function connectionLabel(entry: SystemPrinterEntry): string {
  const d = entry.device;
  if (!d) return `${LINK_LABEL[entry.link]}, can't be reached here`;
  return `${LINK_LABEL[entry.link]}, ${d.connected() ? `connected to "${d.deviceName()}"` : "not connected"}`;
}

/** A label, then a value; `name` makes the value findable as `{prefix}-{name}`. */
export function Row(props: { label: string; name: string; value: string }): JSX.Element {
  return (
    <box flexDirection="row" gap={4}>
      <box width={LABEL_W}>
        <text font="body" nowrap>{props.label}</text>
      </box>
      <text font="body" nowrap semantic={{ name: props.name, role: "status" }}>
        {props.value}
      </text>
    </box>
  );
}

/** A label column, then controls that wrap under an optional explanation. */
export function Section(props: { label: string; note?: string; noteWidth: number; children?: JSX.Element }): JSX.Element {
  return (
    <box flexDirection="row" gap={6}>
      <box width={LABEL_W}>
        <text font="body" nowrap>{props.label}</text>
      </box>
      <box flexDirection="column" gap={4} flexGrow={1}>
        <Show when={props.note}>
          <text font="body" width={props.noteWidth}>{props.note}</text>
        </Show>
        {props.children}
      </box>
    </box>
  );
}

export const Divider = () => <box height={1} background={1} />;

export interface PrinterActions {
  busy: Accessor<boolean>;
  /** Lines describing the last action's outcome. */
  report: Accessor<string[]>;
  setReport(lines: string[]): void;
  /** Run a printer action; `describe` turns its result into report lines. Failures get a stop alert. */
  run<T>(step: () => Promise<T>, describe?: (result: T) => string[]): Promise<void>;
}

export function usePrinterActions(): PrinterActions {
  const app = useApp();
  const [busy, setBusy] = createSignal(false);
  const [report, setReport] = createSignal<string[]>([]);

  async function run<T>(step: () => Promise<T>, describe: (result: T) => string[] = () => []): Promise<void> {
    setBusy(true);
    setReport(["Working…"]);
    let failure: string | null = null;
    try {
      setReport(describe(await step()));
    } catch (err) {
      failure = err instanceof Error ? err.message : String(err);
      setReport([]);
    } finally {
      setBusy(false);
    }
    if (failure !== null) await app.os.showDialog({ message: failure, buttons: ["OK"], variant: "stop" });
  }

  return { busy, report, setReport, run };
}

/** The report lines, at the bottom of a window. */
export function Report(props: { name: string; lines: string[]; width: number }): JSX.Element {
  return (
    <box flexDirection="column" gap={2} semantic={{ name: props.name, role: "status" }}>
      <For each={props.lines}>{(line) => <text font="body" width={props.width}>{line}</text>}</For>
    </box>
  );
}
