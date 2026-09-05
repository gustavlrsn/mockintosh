import { ColorMode, getDefaultColorMode } from "./ColorSystem";

const PREFERENCES_KEY = "mockintosh-system-preferences.json";

export interface SystemPreferences {
  colorMode: ColorMode;
}

export const DEFAULT_SYSTEM_PREFERENCES: SystemPreferences = {
  colorMode: getDefaultColorMode(),
};

export async function loadSystemPreferences(): Promise<SystemPreferences> {
  try {
    const root = await navigator.storage.getDirectory();
    const file = await root.getFileHandle(PREFERENCES_KEY);
    const blob = await file.getFile();
    const raw = await blob.text();
    const parsed = JSON.parse(raw) as Partial<SystemPreferences>;
    return {
      colorMode:
        parsed.colorMode === "colors" || parsed.colorMode === "monochrome"
          ? parsed.colorMode
          : DEFAULT_SYSTEM_PREFERENCES.colorMode,
    };
  } catch {
    return { ...DEFAULT_SYSTEM_PREFERENCES };
  }
}

export async function saveSystemPreferences(
  preferences: SystemPreferences
): Promise<void> {
  try {
    const root = await navigator.storage.getDirectory();
    const file = await root.getFileHandle(PREFERENCES_KEY, { create: true });
    const writable = await (file as any).createWritable();
    await writable.write(JSON.stringify(preferences));
    await writable.close();
  } catch (error) {
    console.error("system preferences write error:", error);
  }
}
