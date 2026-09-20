import { createSignal } from "@mockintosh/ui";
import {
  DEFAULT_HOST_PALETTE,
  formatRgb8,
  hostPalettesEqual,
  parseRgb8,
  type HostPalette,
} from "@mockintosh/ui/web";

const KEY = "mockintosh-ui-palette";

export interface HostPalettePreset {
  id: string;
  label: string;
  palette: HostPalette;
}

export const HOST_PALETTE_PRESETS: readonly HostPalettePreset[] = [
  { id: "paper", label: "Paper", palette: DEFAULT_HOST_PALETTE },
  {
    id: "inverse",
    label: "Inverse",
    palette: { foreground: { r: 255, g: 255, b: 255 }, background: { r: 0, g: 0, b: 0 } },
  },
  {
    id: "phosphor",
    label: "Phosphor",
    palette: { foreground: { r: 57, g: 255, b: 20 }, background: { r: 8, g: 18, b: 8 } },
  },
  {
    id: "amber",
    label: "Amber",
    palette: { foreground: { r: 255, g: 176, b: 0 }, background: { r: 26, g: 16, b: 0 } },
  },
  {
    id: "platinum",
    label: "Platinum",
    palette: { foreground: { r: 34, g: 34, b: 34 }, background: { r: 221, g: 221, b: 221 } },
  },
  {
    id: "blueprint",
    label: "Blueprint",
    palette: { foreground: { r: 232, g: 240, b: 255 }, background: { r: 26, g: 58, b: 107 } },
  },
  {
    id: "blush",
    label: "Blush",
    palette: { foreground: { r: 74, g: 36, b: 54 }, background: { r: 247, g: 214, b: 224 } },
  },
  {
    id: "sky",
    label: "Sky",
    palette: { foreground: { r: 30, g: 58, b: 86 }, background: { r: 214, g: 232, b: 247 } },
  },
  {
    id: "mint",
    label: "Mint",
    palette: { foreground: { r: 28, g: 64, b: 52 }, background: { r: 216, g: 240, b: 228 } },
  },
];

let apply: ((palette: HostPalette) => void) | undefined;

function readStored(): HostPalette {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_HOST_PALETTE;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "string") {
      const preset = HOST_PALETTE_PRESETS.find((item) => item.id === parsed);
      if (preset) return preset.palette;
    }
    if (parsed && typeof parsed === "object") {
      const rec = parsed as { foreground?: unknown; background?: unknown };
      const foreground = typeof rec.foreground === "string" ? parseRgb8(rec.foreground) : null;
      const background = typeof rec.background === "string" ? parseRgb8(rec.background) : null;
      if (foreground && background) return { foreground, background };
    }
  } catch {
    /* ignore quota / private mode / bad JSON */
  }
  return DEFAULT_HOST_PALETTE;
}

const [hostPalette, setPaletteSignal] = createSignal<HostPalette>(readStored());

export { hostPalette };

export function bindPaletteHost(fn: (palette: HostPalette) => void): void {
  apply = fn;
  applyPagePaper(hostPalette());
}

export function setHostPalette(palette: HostPalette): void {
  setPaletteSignal(palette);
  try {
    const preset = HOST_PALETTE_PRESETS.find((item) => hostPalettesEqual(item.palette, palette));
    localStorage.setItem(
      KEY,
      preset
        ? JSON.stringify(preset.id)
        : JSON.stringify({
            foreground: formatRgb8(palette.foreground),
            background: formatRgb8(palette.background),
          }),
    );
  } catch {
    /* ignore quota / private mode */
  }
  applyPagePaper(palette);
  apply?.(palette);
}

export function readHostPalette(): HostPalette {
  return hostPalette();
}

export function activePalettePreset(palette: HostPalette = hostPalette()): string | null {
  return HOST_PALETTE_PRESETS.find((item) => hostPalettesEqual(item.palette, palette))?.id ?? null;
}

function applyPagePaper(palette: HostPalette): void {
  if (typeof document === "undefined") return;
  const css = formatRgb8(palette.background);
  document.documentElement.style.backgroundColor = css;
  document.body.style.backgroundColor = css;
}
