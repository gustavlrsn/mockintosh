import type { JSX } from "solid-js";
import { MIME } from "@mockintosh/fs";
import { registerApp } from "../src/os/apps";
import { LegacyAppHost } from "../src/os/legacy/LegacyAppHost.solid";
import { DeckerApp } from "../lib/decker/systemApp";

export function Decker(_props: Record<string, unknown>): JSX.Element {
  return <LegacyAppHost app={DeckerApp} />;
}

registerApp({
  id: "decker",
  title: DeckerApp.title,
  icon: DeckerApp.icon,
  defaultSize: DeckerApp.defaultSize,
  windowKind: DeckerApp.windowKind as "presentation" | undefined,
  scrollable: DeckerApp.scrollable,
  resizable: DeckerApp.resizable,
  minSize: DeckerApp.minSize,
  fileTypes: [MIME.deck, MIME.html],
  Component: Decker,
});
