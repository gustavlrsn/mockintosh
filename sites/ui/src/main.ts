import { mountCanvasUI } from "@mockintosh/ui/web";
import { App } from "./App";
import { bindCursorHost, readCursorMode } from "./cursorHost";
import { bindPaletteHost, readHostPalette } from "./hostPalette";
import { bindThemeHost, readRadiusScale } from "./hostTheme";
import { bindMorphHost } from "./inkMorph";

const host = mountCanvasUI({
  root: document.getElementById("root")!,
  size: { mode: "viewport", scale: 2 },
  cursors: readCursorMode(),
  palette: readHostPalette(),
  theme: { radius: readRadiusScale() },
  component: () => App(),
});

bindCursorHost((mode) => host.setCursors(mode));
bindPaletteHost((palette) => host.setPalette(palette));
bindThemeHost((radius) => host.setTheme({ radius }));
bindMorphHost(host);
