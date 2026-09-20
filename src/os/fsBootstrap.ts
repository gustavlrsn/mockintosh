/**
 * First-boot layout of the file system, and repair of the well-known folders
 * on every boot. Everything the OS needs to find later is created with a
 * `role`, never looked up by name.
 */
import { MIME, ROOT_ID, type FileSystem, type FSDirectory, type NodeRole } from "@mockintosh/fs";

export const STARTUP_VOLUME_NAME = "Mockintosh HD";

interface DesktopShortcut {
  name: string;
  appId: string;
  icon: string;
}

const DESKTOP_SHORTCUTS: readonly DesktopShortcut[] = [
  { name: "Photo Booth",    appId: "photobooth",  icon: "icon/photobooth-smr-32" },
  { name: "Dither",         appId: "dither",      icon: "dither/icon" },
  { name: "1984.mp4",       appId: "video",       icon: "icon/MacFlim" },
  { name: "Safari",         appId: "safari",      icon: "icon/safari" },
  { name: "App Store",      appId: "appstore",    icon: "icon/appstore-smr-32x32" },
  { name: "ChatGippity",    appId: "chatgippity", icon: "icon/computer" },
  { name: "Spotify Player", appId: "spotify",     icon: "icon/spotify" },
  { name: "Icon Gallery",   appId: "icon_gallery", icon: "icon-gallery/icon" },
  { name: "MacPaint",       appId: "macpaint",    icon: "macpaint/icon" },
  { name: "Canvas",         appId: "canvas",      icon: "canvas/icon" },
];

/** Create the startup volume and its standard folders on a fresh disk; repair them otherwise. */
export async function bootstrapFileSystem(fs: FileSystem): Promise<void> {
  const fresh = fs.volumes().length === 0;
  const hd = fs.locate("volume") ?? fs.mkdir(ROOT_ID, STARTUP_VOLUME_NAME, { role: "volume" });

  ensureRoleFolder(fs, hd, "desktop", "Desktop Folder");
  ensureRoleFolder(fs, hd, "trash", "Trash");
  ensureRoleFolder(fs, hd, "applications", "Applications");
  const system = ensureRoleFolder(fs, hd, "system", "System Folder");
  ensureRoleFolder(fs, system, "preferences", "Preferences");

  const desktop = fs.locate("desktop", hd.id)!;
  if (fresh) {
    for (const s of DESKTOP_SHORTCUTS) {
      await writeDesktopShortcut(fs, desktop.id, s);
    }
  } else {
    const dither = DESKTOP_SHORTCUTS.find((s) => s.appId === "dither");
    if (dither) {
      const existing = fs.child(desktop.id, "Dither");
      if (!existing) await writeDesktopShortcut(fs, desktop.id, dither);
      else if (fs.attributes(existing.id).icon === "icon/camera") {
        fs.setAttributes(existing.id, { icon: dither.icon });
      }
    }
  }
  await fs.flush();
}

async function writeDesktopShortcut(
  fs: FileSystem,
  desktopId: string,
  s: DesktopShortcut,
): Promise<void> {
  await fs.writeJSON(desktopId, s.name, { appId: s.appId }, {
    type: MIME.appShortcut,
    attributes: { icon: s.icon },
  });
}

/** Find a role folder on the parent's volume, or create it under `parent`. */
function ensureRoleFolder(
  fs: FileSystem,
  parent: FSDirectory,
  role: Exclude<NodeRole, "root" | "volume">,
  defaultName: string
): FSDirectory {
  const volume = fs.volumeOf(parent.id);
  return fs.locate(role, volume?.id) ?? fs.mkdir(parent.id, defaultName, { role });
}
