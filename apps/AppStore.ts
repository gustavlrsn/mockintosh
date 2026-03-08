import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { OSEvent } from "../lib/toolbox/EventManager";
import { MenubarDefinition } from "../lib/toolbox/MenuManager";
import { makeRect } from "@mockintosh/quickdraw";
import { measureText } from "../lib/canvas/fontAdapter";
import { AppManifest } from "../lib/canvas/AppLoader";
import {
  NewControl,
  DrawControls,
  inButton,
} from "../lib/toolbox/ControlManager";

interface RegistryEntry {
  id: string;
  title: string;
  author: string;
  version: string;
  sdk: string;
  description: string;
  entry: string | null;
  repo: string;
  permissions: string[];
  approved: boolean;
  pricing?: {
    type: "free" | "one-time" | "subscription";
    amount_cents?: number;
    currency?: string;
    interval?: "month" | "year";
    polar_product_id?: string;
  };
}

type Tab = "browse" | "installed";

const ITEM_HEIGHT = 42;
const HEADER_HEIGHT = 24;
const TAB_BAR_HEIGHT = 20;
const ACTION_BAR_HEIGHT = 28;

const REGISTRY_URL =
  "https://raw.githubusercontent.com/mockintosh/app-registry/main/registry.json";

async function fetchRegistry(): Promise<RegistryEntry[]> {
  try {
    const resp = await fetch(REGISTRY_URL);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.apps ?? [];
  } catch {
    return [];
  }
}

function formatPrice(pricing?: RegistryEntry["pricing"]): string {
  if (!pricing || pricing.type === "free") return "Free";
  const dollars = ((pricing.amount_cents ?? 0) / 100).toFixed(2);
  const currency = (pricing.currency ?? "usd").toUpperCase();
  if (pricing.type === "subscription") {
    const interval = pricing.interval === "year" ? "/yr" : "/mo";
    return `$${dollars}${interval}`;
  }
  return `$${dollars}`;
}

export const AppStoreApp: SystemApp = {
  id: "appstore",
  title: "App Store",
  icon: "icon/appstore-smr-32x32",
  defaultSize: { width: 320, height: 280 },
  scrollable: true,
  resizable: true,
  minSize: { width: 240, height: 180 },

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const [tab, setTab] = app.useState<Tab>("browse");
    const [registry, setRegistry] = app.useState<RegistryEntry[]>([]);
    const [loading, setLoading] = app.useState(true);
    const [error, setError] = app.useState<string | null>(null);
    const [selectedIdx, setSelectedIdx] = app.useState<number | null>(null);
    const [installedIds, setInstalledIds] = app.useState<Set<string>>(
      new Set()
    );
    const [installing, setInstalling] = app.useState<string | null>(null);
    const lastControlsKeyRef = app.useRef<string>("");

    app.useEffect(() => {
      fetchRegistry()
        .then((entries) => {
          setRegistry(entries);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load app catalog.");
          setLoading(false);
        });
    }, []);

    ctx.clear(WHITE);

    ctx.drawText("App Store", ctx.width / 2 - 26, 4, {
      font: "ChiKareGo",
      color: BLACK,
    });
    ctx.drawHLine(0, 16, ctx.width, BLACK);

    const browseSelected = tab === "browse";
    const installedSelected = tab === "installed";
    const tabW = ctx.width / 2;

    if (browseSelected) {
      ctx.fillRect(0, 17, tabW, TAB_BAR_HEIGHT - 1, BLACK);
      ctx.drawText("Browse", tabW / 2 - 16, 20, {
        font: "Geneva9",
        color: WHITE,
      });
    } else {
      ctx.drawText("Browse", tabW / 2 - 16, 20, {
        font: "Geneva9",
        color: BLACK,
      });
    }

    ctx.hitRegion(
      "tab-browse",
      { x: 0, y: 17, w: tabW, h: TAB_BAR_HEIGHT },
      {
        onMouseDown: () => {
          setTab("browse");
          setSelectedIdx(null);
        },
      }
    );

    if (installedSelected) {
      ctx.fillRect(tabW, 17, tabW, TAB_BAR_HEIGHT - 1, BLACK);
      ctx.drawText("Installed", tabW + tabW / 2 - 22, 20, {
        font: "Geneva9",
        color: WHITE,
      });
    } else {
      ctx.drawText("Installed", tabW + tabW / 2 - 22, 20, {
        font: "Geneva9",
        color: BLACK,
      });
    }

    ctx.hitRegion(
      "tab-installed",
      { x: tabW, y: 17, w: tabW, h: TAB_BAR_HEIGHT },
      {
        onMouseDown: () => {
          setTab("installed");
          setSelectedIdx(null);
        },
      }
    );

    ctx.drawHLine(0, 17 + TAB_BAR_HEIGHT, ctx.width, BLACK);
    ctx.drawVLine(tabW, 17, TAB_BAR_HEIGHT, BLACK);

    const contentY = 17 + TAB_BAR_HEIGHT + 1;
    const items =
      tab === "browse"
        ? registry
        : registry.filter((e) => installedIds.has(e.id));

    if (loading) {
      ctx.drawText("Loading app catalog...", 16, contentY + 20, {
        font: "Geneva9",
        color: BLACK,
      });
      return;
    }

    if (error) {
      ctx.drawText(error, 16, contentY + 20, {
        font: "Geneva9",
        color: BLACK,
      });
      return;
    }

    if (items.length === 0) {
      const msg =
        tab === "browse" ? "No apps available yet." : "No apps installed.";
      ctx.drawText(msg, 16, contentY + 20, {
        font: "Geneva9",
        color: BLACK,
      });
      if (tab === "browse") {
        ctx.drawText("Check back soon!", 16, contentY + 34, {
          font: "Geneva9",
          color: BLACK,
        });
      }
      return;
    }

    let y = contentY;
    for (let i = 0; i < items.length; i++) {
      const entry = items[i];
      const isSelected = selectedIdx === i;
      const isInstalled = installedIds.has(entry.id);

      if (isSelected) {
        ctx.fillRect(0, y, ctx.width, ITEM_HEIGHT, BLACK);
      }

      const textColor = isSelected ? WHITE : BLACK;

      ctx.drawText(entry.title, 8, y + 4, {
        font: "ChiKareGo",
        color: textColor,
      });

      const priceStr = formatPrice(entry.pricing);
      const statusStr = isInstalled ? "Installed" : priceStr;
      ctx.drawText(statusStr, ctx.width - 70, y + 4, {
        font: "Geneva9",
        color: textColor,
      });

      ctx.drawText(`by ${entry.author} · v${entry.version}`, 8, y + 16, {
        font: "Geneva9",
        color: textColor,
      });

      const desc = entry.description || "No description";
      ctx.drawText(
        desc.length > 45 ? desc.slice(0, 42) + "..." : desc,
        8,
        y + 28,
        { font: "Geneva9", color: textColor }
      );

      ctx.drawDottedHLine(
        0,
        y + ITEM_HEIGHT - 1,
        ctx.width,
        isSelected ? WHITE : BLACK
      );

      ctx.hitRegion(
        `app-item-${i}`,
        { x: 0, y, w: ctx.width, h: ITEM_HEIGHT },
        {
          onMouseDown: () => setSelectedIdx(i),
        }
      );

      y += ITEM_HEIGHT;
    }

    const barY = y + 4;
    ctx.drawHLine(0, barY, ctx.width, BLACK);

    const win = ctx.getWindow();
    if (win !== null && selectedIdx === null) {
      win.controlList.length = 0;
      lastControlsKeyRef.current = "";
    }

    if (selectedIdx !== null && selectedIdx < items.length) {
      const selected = items[selectedIdx];
      const isInstalled = installedIds.has(selected.id);
      const isCurrentlyInstalling = installing === selected.id;

      if (win !== null) {
        const modeKey = `${selectedIdx}-${selected.id}-${isInstalled}-${
          installing ?? ""
        }`;
        if (lastControlsKeyRef.current !== modeKey) {
          win.controlList.length = 0;
          lastControlsKeyRef.current = modeKey;
        }

        if (win.controlList.length === 0) {
          if (isInstalled) {
            const openW = measureText("Open", "ChiKareGo") + 20;
            const uninstallW = measureText("Uninstall", "ChiKareGo") + 20;
            const openHandle = NewControl(
              win,
              makeRect(barY + 4, 8, barY + 24, 8 + openW),
              "Open",
              true,
              0,
              0,
              1,
              0,
              0
            );
            openHandle.ref.contrlAction = (_c, partCode) => {
              if (partCode === inButton) props._os?.openWindow(selected.id);
            };
            const uninstallHandle = NewControl(
              win,
              makeRect(barY + 4, 60, barY + 24, 60 + uninstallW),
              "Uninstall",
              true,
              0,
              0,
              1,
              0,
              0
            );
            uninstallHandle.ref.contrlAction = (_c, partCode) => {
              if (partCode === inButton) {
                setInstalledIds((prev: Set<string>) => {
                  const next = new Set(prev);
                  next.delete(selected.id);
                  return next;
                });
                setSelectedIdx(null);
              }
            };
          } else {
            const isFree =
              !selected.pricing || selected.pricing.type === "free";
            const label = isCurrentlyInstalling
              ? "Installing..."
              : isFree
              ? "Install"
              : `Buy ${formatPrice(selected.pricing)}`;
            const installW = measureText(label, "ChiKareGo") + 20;
            const installHandle = NewControl(
              win,
              makeRect(barY + 4, 8, barY + 24, 8 + installW),
              label,
              true,
              0,
              0,
              1,
              0,
              0
            );
            installHandle.ref.contrlAction = (_c, partCode) => {
              if (partCode !== inButton || isCurrentlyInstalling) return;
              if (isFree && selected.entry) {
                setInstalling(selected.id);
                const appLoader = props._appLoader;
                if (appLoader) {
                  const manifest: AppManifest = {
                    id: selected.id,
                    title: selected.title,
                    description: selected.description ?? "",
                    icon: selected.id + "/icon",
                    author: selected.author,
                    version: selected.version,
                    sdk: selected.sdk,
                    permissions: selected.permissions,
                    entry: selected.entry!,
                  };
                  appLoader
                    .load(manifest)
                    .then(() => {
                      setInstalledIds((prev: Set<string>) => {
                        const next = new Set(prev);
                        next.add(selected.id);
                        return next;
                      });
                      setInstalling(null);
                    })
                    .catch((err: Error) => {
                      console.error("Install failed:", err);
                      setInstalling(null);
                      setError(`Failed to install ${selected.title}`);
                    });
                }
              }
            };
          }
        } else {
          // Update Install button label when installing state changes
          if (!isInstalled && win.controlList[0]) {
            const isFree =
              !selected.pricing || selected.pricing.type === "free";
            const label = isCurrentlyInstalling
              ? "Installing..."
              : isFree
              ? "Install"
              : `Buy ${formatPrice(selected.pricing)}`;
            win.controlList[0].ref.contrlTitle = label;
            win.controlList[0].ref.contrlHilite = isCurrentlyInstalling
              ? 255
              : 0;
          }
        }

        DrawControls(win, ctx.port);
      }
    }
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any) {
    if (event.type === "mouseDown") {
      // Selection is handled by hit regions in render
    }
  },

  getContentHeight(app: AppBuilder, props: any, size: WindowSize): number {
    const [tab] = app.useState<Tab>("browse");
    const [registry] = app.useState<RegistryEntry[]>([]);
    const [installedIds] = app.useState<Set<string>>(new Set());

    const items =
      tab === "browse"
        ? registry
        : registry.filter((e) => installedIds.has(e.id));

    const contentY = 17 + TAB_BAR_HEIGHT + 1;
    return contentY + items.length * ITEM_HEIGHT + ACTION_BAR_HEIGHT + 8;
  },

  getMenubar(app: AppBuilder, props: any): MenubarDefinition[] {
    const [, setLoading] = app.useState(true);
    const [, setRegistry] = app.useState<RegistryEntry[]>([]);
    const [, setError] = app.useState<string | null>(null);

    return [
      {
        label: "Store",
        items: [
          {
            label: "Refresh Catalog",
            onClick: () => {
              setLoading(true);
              setError(null);
              fetchRegistry().then((entries) => {
                setRegistry(entries);
                setLoading(false);
              });
            },
          },
        ],
      },
    ];
  },
};
