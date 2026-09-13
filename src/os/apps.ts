/**
 * Solid app registry — every window content is a registered SolidApp.
 */

import type { Capability, SolidApp as SDKSolidApp } from "@mockintosh/sdk";
import { setAppMenus, type OSWindowKind } from "./state";

/**
 * A registered app. Same contract third-party apps declare with `defineApp`
 * (`@mockintosh/sdk`), widened for the shell: any window kind (the Finder's
 * folder windows). `menus` is the app-level menubar; apps whose menus change
 * at runtime call `useApp().setMenus` for the current window.
 */
export interface SolidApp<P extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<SDKSolidApp<P>, "windowKind"> {
  windowKind?: OSWindowKind;
}

const apps = new Map<string, SolidApp<any>>();

export function registerApp<P extends Record<string, unknown>>(app: SolidApp<P>): void {
  apps.set(app.id, app);
  setAppMenus(app.id, app.menus ?? []);
}

export function getApp(id: string): SolidApp<any> | undefined {
  return apps.get(id);
}

export function getAllApps(): SolidApp<any>[] {
  return Array.from(apps.values());
}

/** An installed app the OS knows about but did not load, because this platform cannot run it. */
export interface UnavailableApp {
  id: string;
  title: string;
  missing: Capability[];
}

const unavailable = new Map<string, UnavailableApp>();

export function registerUnavailableApp(app: UnavailableApp): void {
  unavailable.set(app.id, app);
}

export function getUnavailableApp(id: string): UnavailableApp | undefined {
  return unavailable.get(id);
}

export function unregisterApp(id: string): void { apps.delete(id); setAppMenus(id, []); }
