import { For, Show, createSignal, onMount, type JSX } from "solid-js";
import { Button } from "@mockintosh/ui";
import { registerApp } from "../src/os/apps";
import { useOS } from "../src/os/context";
import { useWindow } from "../src/os/windowContext";
import { installManifest, readInstalledManifests } from "../src/os/installedApps";
import type { AppManifest } from "../lib/canvas/AppLoader";

interface RegistryEntry {
  id: string;
  title: string;
  author: string;
  version: string;
  sdk: string;
  description: string;
  icon?: string;
  permissions?: string[];
  entry: string | null;
}

const REGISTRY_URL =
  "https://raw.githubusercontent.com/mockintosh/app-registry/main/registry.json";

function sdkMajor(sdk: string): number {
  const m = sdk.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export function AppStore(_props: Record<string, unknown>): JSX.Element {
  const os = useOS();
  const win = useWindow();
  const [entries, setEntries] = createSignal<RegistryEntry[]>([]);
  const [installed, setInstalled] = createSignal(new Set(readInstalledManifests().map((m) => m.id)));
  const [status, setStatus] = createSignal("Loading catalog…");
  const [busyId, setBusyId] = createSignal<string | null>(null);

  onMount(() => {
    fetch(REGISTRY_URL)
      .then((r) => r.json())
      .then((data) => {
        const apps = ((data.apps ?? []) as RegistryEntry[]).filter(
          (e) => sdkMajor(e.sdk) >= 2
        );
        setEntries(apps);
        setStatus(apps.length === 0 ? "No SDK v2 apps in the catalog." : "");
      })
      .catch(() => setStatus("Failed to load catalog."));
  });

  async function install(e: RegistryEntry): Promise<void> {
    if (!e.entry) {
      setStatus("This catalog entry has no bundle URL.");
      return;
    }
    setBusyId(e.id);
    try {
      const manifest: AppManifest = {
        id: e.id,
        title: e.title,
        description: e.description,
        icon: e.icon ?? "icon/computer",
        author: e.author,
        version: e.version,
        sdk: e.sdk,
        permissions: e.permissions ?? [],
        entry: e.entry,
      };
      await installManifest(manifest);
      setInstalled((prev) => new Set([...prev, e.id]));
      setStatus(`Installed ${e.title}.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Install failed.");
    }
    setBusyId(null);
  }

  return (
    <box width={win.width()} height={win.height()} padding={8} flexDirection="column" gap={6} background={0}>
      <text font="menu">App Store</text>
      <text font="body">SDK v2 apps only</text>
      <Show when={status()}>
        <text font="body">{status()}</text>
      </Show>
      <box overflow="scroll" height={win.height() - 50} flexDirection="column" gap={4}>
        <For each={entries()}>
          {(e) => (
            <box flexDirection="column" gap={2} borderColor={1} borderWidth={1} padding={4}>
              <text font="menu">{e.title}</text>
              <text font="body">{`${e.author} · ${e.version}`}</text>
              <text font="body">{e.description}</text>
              <Show
                when={installed().has(e.id)}
                fallback={
                  <Button
                    label={busyId() === e.id ? "…" : "Install"}
                    disabled={busyId() === e.id || !e.entry}
                    onClick={() => void install(e)}
                  />
                }
              >
                <Button label="Open" onClick={() => os.openApp(e.id)} />
              </Show>
            </box>
          )}
        </For>
      </box>
    </box>
  );
}

registerApp({
  id: "appstore",
  title: "App Store",
  icon: "icon/appstore-smr-32x32",
  defaultSize: { width: 320, height: 280 },
  scrollable: true,
  resizable: true,
  minSize: { width: 240, height: 180 },
  Component: AppStore,
});
