import { JSX } from "solid-js";
import { useOS } from "../context";
import { FinderDesktop } from "../../../apps/Finder.solid";

export function Desktop(): JSX.Element {
  const os = useOS();
  return (
    <box
      position="absolute"
      left={0}
      top={os.menubarHeight}
      width={os.resolution.width}
      height={os.resolution.height - os.menubarHeight}
      background={os.desktopSettings?.pattern() === "white" ? 0 : os.desktopSettings?.pattern() === "black" ? 1 : "checker"}
    >
      <FinderDesktop />
    </box>
  );
}
