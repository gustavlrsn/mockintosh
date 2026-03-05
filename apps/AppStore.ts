import { NativeApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { OSEvent } from "../lib/canvas/EventManager";
import { MockFS, FSFile, ROOT_ID } from "../lib/canvas/fs/MockFS";

interface InstalledApp {
  id: string;
  title: string;
  description: string;
  code: string;
}

const ITEM_HEIGHT = 40;
const HEADER_HEIGHT = 28;

function getApplicationsDir(fs: MockFS): string {
  const hd = fs.findByName(ROOT_ID, "Mockintosh HD");
  if (!hd) return ROOT_ID;
  const appsDir = fs.findByName(hd.id, "Applications");
  if (!appsDir) return hd.id;
  return appsDir.id;
}

async function loadInstalledApps(fs: MockFS): Promise<InstalledApp[]> {
  const dirId = getApplicationsDir(fs);
  const children = fs.readDir(dirId);
  const apps: InstalledApp[] = [];
  for (const node of children) {
    if (node.kind === "file" && (node as FSFile).fileType === "app") {
      const raw = await fs.readFile(node.id);
      if (raw) {
        try {
          apps.push(JSON.parse(raw));
        } catch {}
      }
    }
  }
  return apps;
}

export async function saveApp(
  appData: InstalledApp,
  fs: MockFS
): Promise<void> {
  const dirId = getApplicationsDir(fs);
  await fs.writeFile(
    dirId,
    appData.title || appData.id,
    JSON.stringify(appData),
    "app",
    { icon: "icon/appstore-smr-32x32" }
  );
}

export async function removeApp(
  appData: InstalledApp,
  fs: MockFS
): Promise<void> {
  const dirId = getApplicationsDir(fs);
  const match = fs.findByName(dirId, appData.title || appData.id);
  if (match) {
    await fs.remove(match.id);
  }
}

export const AppStoreApp: NativeApp = {
  id: "appstore",
  title: "App Store",
  icon: "icon/appstore-smr-32x32",
  defaultSize: { width: 300, height: 240 },
  scrollable: true,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const fs: MockFS | undefined = props._fs;
    const [apps, setApps] = app.useState<InstalledApp[]>([]);
    const [selectedIdx, setSelectedIdx] = app.useState<number | null>(null);

    app.useEffect(() => {
      if (fs) loadInstalledApps(fs).then(setApps);
    }, []);

    ctx.clear(WHITE);

    ctx.drawText("App Store", ctx.width / 2 - 24, 4, {
      font: "ChiKareGo",
      color: BLACK,
    });
    ctx.drawText(`${apps.length} apps installed`, ctx.width / 2 - 40, 16, {
      font: "Geneva9",
      color: BLACK,
    });
    ctx.drawHLine(0, HEADER_HEIGHT, ctx.width, BLACK);

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

    const barY = ctx.height - 28;
    ctx.fillRect(0, barY, ctx.width, 28, WHITE);
    ctx.drawHLine(0, barY, ctx.width, BLACK);

    if (selectedIdx !== null && selectedIdx < apps.length) {
      ctx.drawButton({
        x: 8,
        y: barY + 4,
        label: "Open",
        id: "appstore-open-btn",
        onClick: () => {
          const openSandboxed = props._openSandboxedApp;
          if (openSandboxed) openSandboxed(apps[selectedIdx]);
        },
      });
      ctx.drawButton({
        x: 64,
        y: barY + 4,
        label: "Uninstall",
        id: "appstore-uninstall-btn",
        onClick: () => {
          if (fs) {
            removeApp(apps[selectedIdx], fs).then(() => {
              loadInstalledApps(fs).then(setApps);
              setSelectedIdx(null);
            });
          }
        },
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
