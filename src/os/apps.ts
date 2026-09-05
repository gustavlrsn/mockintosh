/**
 * Solid app registry — every window content is a registered SolidApp.
 */

import type { JSX } from "solid-js";
import type { SolidApp as SDKSolidApp } from "@mockintosh/sdk";
import { setAppMenus, type OSWindowKind } from "./state";

/**
 * A registered app. Same contract third-party apps declare with `defineApp`
 * (`@mockintosh/sdk`), widened for system apps: any window kind, and a typed
 * JSX component. `menus` is the app-level menubar; apps whose menus change at
 * runtime call `setAppMenus(id, …)`, or `useWindow().setMenus` for menus that
 * depend on a specific window.
 */
export interface SolidApp<P extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<SDKSolidApp<P>, "windowKind" | "Component"> {
  windowKind?: OSWindowKind;
  Component: (props: P) => JSX.Element;
}

const apps = new Map<string, SolidApp<any>>();

export function registerApp<P extends Record<string, unknown>>(app: SolidApp<P>): void {
  apps.set(app.id, app);
  if (app.menus) setAppMenus(app.id, app.menus);
}

export function getApp(id: string): SolidApp<any> | undefined {
  return apps.get(id);
}

export function getAllApps(): SolidApp<any>[] {
  return Array.from(apps.values());
}
