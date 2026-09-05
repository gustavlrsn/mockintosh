/**
 * Openers — which app opens which file.
 *
 * Apps declare the MIME types they handle (`SolidApp.fileTypes`); the Finder
 * asks `resolveOpenAction` what a double-click should do. Directories and
 * app shortcuts are handled by the OS itself.
 */
import { MIME, type FSNode, type FileSystem } from "@mockintosh/fs";
import type { Capability, FileDocumentProps } from "@mockintosh/sdk";
import { getAllApps, getApp, getUnavailableApp } from "./apps";

export type OpenAction =
  | { kind: "folder"; directoryId: string; title: string }
  | { kind: "launch"; appId: string; props: Record<string, unknown> }
  | { kind: "none"; reason: "unknown-type" | "not-found" | "unreadable" }
  /** A shortcut or manifest names an app that is not registered (e.g. removed from the OS). */
  | { kind: "none"; reason: "unknown-app"; appId: string }
  /** The app is installed but needs capabilities this platform lacks. */
  | { kind: "none"; reason: "unavailable"; appId: string; title: string; missing: Capability[] };

/** The app registered for a MIME type, if any. */
export function appForFileType(type: string): string | undefined {
  for (const app of getAllApps()) {
    if (app.fileTypes?.includes(type)) return app.id;
  }
  return undefined;
}

export async function resolveOpenAction(fs: FileSystem, nodeId: string): Promise<OpenAction> {
  const node: FSNode | undefined = fs.node(nodeId);
  if (!node) return { kind: "none", reason: "not-found" };

  if (node.kind === "directory") {
    return { kind: "folder", directoryId: node.id, title: node.name };
  }

  if (node.type === MIME.appShortcut) {
    const shortcut = await fs.readJSON<{ appId?: string }>(node.id);
    if (!shortcut?.appId) return { kind: "none", reason: "unreadable" };
    return launchIfRegistered(shortcut.appId);
  }

  // An installed app's manifest: launch the app it describes.
  if (node.type === MIME.app) {
    const manifest = await fs.readJSON<{ id?: string }>(node.id);
    if (!manifest?.id) return { kind: "none", reason: "unreadable" };
    return launchIfRegistered(manifest.id);
  }

  const appId = appForFileType(node.type);
  if (!appId) return { kind: "none", reason: "unknown-type" };
  const docProps: FileDocumentProps = { fileId: node.id, title: node.name };
  return { kind: "launch", appId, props: docProps as unknown as Record<string, unknown> };
}

function launchIfRegistered(appId: string): OpenAction {
  if (getApp(appId)) return { kind: "launch", appId, props: {} };
  const skipped = getUnavailableApp(appId);
  if (skipped) {
    return { kind: "none", reason: "unavailable", appId, title: skipped.title, missing: skipped.missing };
  }
  return { kind: "none", reason: "unknown-app", appId };
}
