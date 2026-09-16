import type { JSX } from "@mockintosh/ui";
import { useOS } from "../context";
import { FinderDesktop } from "../../../apps/Finder.solid";
import { desktopFill } from "../resourceCatalog/catalog";

export function Desktop(): JSX.Element {
  const os = useOS();
  return (
    <box
      position="absolute"
      left={0}
      top={os.menubarHeight}
      width={os.resolution.width}
      height={os.resolution.height - os.menubarHeight}
      background={desktopFill(os.desktopSettings?.pattern() ?? "checker")}
    >
      <FinderDesktop />
    </box>
  );
}
