import { JSX, Show } from "solid-js";
import { OSContext } from "./context";
import type { OSServices } from "./context";
import {
  getMenubarMenus,
  getSplashVisible,
  isMenubarHidden,
  setSplashVisible,
  getWindowOutline,
} from "./state";
import { Splash } from "./components/Splash.solid";
import { Desktop } from "./components/Desktop.solid";
import { WindowStack } from "./components/WindowStack.solid";
import { Menubar } from "./components/Menubar.solid";
import { ScreenCorners } from "./components/ScreenCorners.solid";
import { FinderDragGhost } from "../../apps/Finder.solid";

interface OSRootProps {
  services: OSServices;
  menubarHeight: number;
}

export function OSRoot(props: OSRootProps): JSX.Element {
  return (
    <OSContext.Provider value={props.services}>
      <box width={props.services.resolution.width} height={props.services.resolution.height}>
        <Show when={getSplashVisible()}>
          <Splash onDismiss={() => setSplashVisible(false)} />
        </Show>
        <Show when={!getSplashVisible()}>
          <Desktop />
          <WindowStack />
          {/* Drag ghost renders above windows but below menubar */}
          <FinderDragGhost />
          <Show when={getWindowOutline()}>
            {(r) => (
              <box
                position="absolute"
                left={r().x}
                top={r().y}
                width={r().width}
                height={r().height}
                borderColor={1}
                borderWidth={1}
                borderStyle="dotted"
                penMode="xor"
              />
            )}
          </Show>
          {/* A full-screen window owns the whole screen; its menus stay live for ⌘ shortcuts. */}
          <Show when={!isMenubarHidden()}>
            <Menubar height={props.menubarHeight} menus={getMenubarMenus()} />
          </Show>
        </Show>
        <ScreenCorners />
      </box>
    </OSContext.Provider>
  );
}

/** Factory function for mounting; avoids needing JSX in the entry point. */
export function makeOSRoot(services: OSServices, menubarHeight: number): () => JSX.Element {
  return () => <OSRoot services={services} menubarHeight={menubarHeight} />;
}
