import { NativeApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { OSEvent } from "../lib/canvas/EventManager";

interface InstalledApp {
  id: string;
  title: string;
  description: string;
  code: string;
}

const ITEM_HEIGHT = 40;
const HEADER_HEIGHT = 28;

export const AppStoreApp: NativeApp = {
  id: "appstore",
  title: "App Store",
  icon: "/icons/appstore-smr-32x32.png",
  defaultSize: { width: 300, height: 240 },
  scrollable: true,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const [apps, setApps] = app.useState<InstalledApp[]>([]);
    const [selectedIdx, setSelectedIdx] = app.useState<number | null>(null);

    // Load installed apps from storage on mount
    app.useEffect(() => {
      loadInstalledApps().then(setApps);
    }, []);

    ctx.clear(WHITE);

    // Header
    ctx.drawText("App Store", ctx.width / 2 - 24, 4, {
      font: "ChiKareGo",
      color: BLACK,
    });
    ctx.drawText(`${apps.length} apps installed`, ctx.width / 2 - 40, 16, {
      font: "Geneva9",
      color: BLACK,
    });
    ctx.drawHLine(0, HEADER_HEIGHT, ctx.width, BLACK);

    // App list
    let y = HEADER_HEIGHT + 1;
    for (let i = 0; i < apps.length; i++) {
      const a = apps[i];
      const isSelected = selectedIdx === i;

      if (isSelected) {
        ctx.fillRect(0, y, ctx.width, ITEM_HEIGHT, BLACK);
      }

      const textColor = isSelected ? WHITE : BLACK;

      ctx.drawText(a.title, 8, y + 4, {
        font: "ChiKareGo",
        color: textColor,
      });

      ctx.drawText(a.description || "No description", 8, y + 18, {
        font: "Geneva9",
        color: textColor,
      });

      ctx.drawDottedHLine(
        0,
        y + ITEM_HEIGHT - 1,
        ctx.width,
        isSelected ? WHITE : BLACK
      );
      y += ITEM_HEIGHT;
    }

    if (apps.length === 0) {
      ctx.drawText("No apps installed yet.", 16, HEADER_HEIGHT + 16, {
        font: "Geneva9",
        color: BLACK,
      });
      ctx.drawText("Use App Builder to create one!", 16, HEADER_HEIGHT + 32, {
        font: "Geneva9",
        color: BLACK,
      });
    }

    // Bottom action bar
    const barY = ctx.height - 28;
    ctx.fillRect(0, barY, ctx.width, 28, WHITE);
    ctx.drawHLine(0, barY, ctx.width, BLACK);

    if (selectedIdx !== null && selectedIdx < apps.length) {
      ctx.drawButton({
        x: 8,
        y: barY + 4,
        label: "Open",
      });
      ctx.drawButton({
        x: 64,
        y: barY + 4,
        label: "Uninstall",
      });
    }
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any) {
    if (event.type === "mouseDown") {
      const [apps] = app.useState<InstalledApp[]>([]);
      const [, setSelectedIdx] = app.useState<number | null>(null);

      const y = event.y! - HEADER_HEIGHT - 1;
      if (y >= 0) {
        const idx = Math.floor(y / ITEM_HEIGHT);
        if (idx >= 0 && idx < apps.length) {
          setSelectedIdx(idx);
        } else {
          setSelectedIdx(null);
        }
      }
    }

    if (event.type === "doubleClick") {
      const [apps] = app.useState<InstalledApp[]>([]);
      const [selectedIdx] = app.useState<number | null>(null);
      if (selectedIdx !== null && selectedIdx < apps.length) {
        const openWindow = props._openSandboxedApp;
        if (openWindow) {
          openWindow(apps[selectedIdx]);
        }
      }
    }
  },

  getContentHeight(app: AppBuilder, props: any): number {
    const [apps] = app.useState<InstalledApp[]>([]);
    return HEADER_HEIGHT + apps.length * ITEM_HEIGHT + 32;
  },
};

async function loadInstalledApps(): Promise<InstalledApp[]> {
  try {
    const root = await navigator.storage.getDirectory();
    const appsDir = await root.getDirectoryHandle("mockintosh-apps", {
      create: true,
    });
    const apps: InstalledApp[] = [];
    for await (const [name, handle] of (appsDir as any).entries()) {
      if (handle.kind === "file") {
        const file = await handle.getFile();
        const text = await file.text();
        try {
          const parsed = JSON.parse(text);
          apps.push(parsed);
        } catch {}
      }
    }
    return apps;
  } catch {
    return [];
  }
}

export async function saveApp(appData: InstalledApp): Promise<void> {
  try {
    const root = await navigator.storage.getDirectory();
    const appsDir = await root.getDirectoryHandle("mockintosh-apps", {
      create: true,
    });
    const file = await appsDir.getFileHandle(`${appData.id}.json`, {
      create: true,
    });
    const writable = await (file as any).createWritable();
    await writable.write(JSON.stringify(appData));
    await writable.close();
  } catch (e) {
    console.error("Failed to save app:", e);
  }
}

export async function removeApp(appId: string): Promise<void> {
  try {
    const root = await navigator.storage.getDirectory();
    const appsDir = await root.getDirectoryHandle("mockintosh-apps", {
      create: true,
    });
    await appsDir.removeEntry(`${appId}.json`);
  } catch (e) {
    console.error("Failed to remove app:", e);
  }
}
