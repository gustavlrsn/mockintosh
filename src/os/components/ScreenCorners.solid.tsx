import { JSX, For } from "solid-js";
import { useOS } from "../context";

/** One 5×5 masked sprite per screen corner, anchored to that corner via absolute layout. */
interface ScreenCorner {
  sprite: string;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

const SCREEN_CORNERS: readonly ScreenCorner[] = [
  { sprite: "corner-lt", left: 0, top: 0 },
  { sprite: "corner-rt", right: 0, top: 0 },
  { sprite: "corner-lb", left: 0, bottom: 0 },
  { sprite: "corner-rb", right: 0, bottom: 0 },
];

/**
 * Paints the rounded-CRT illusion: black quarter-arcs in each corner of the
 * screen. Rendered last in the OS tree so it sits above every window and menu,
 * and `inert` so it never intercepts pointer input.
 */
export function ScreenCorners(): JSX.Element {
  const os = useOS();
  return (
    <box
      position="absolute"
      left={0}
      top={0}
      width={os.resolution.width}
      height={os.resolution.height}
      inert
    >
      <For each={SCREEN_CORNERS}>
        {(corner) => {
          const s = os.sprites.get(corner.sprite);
          if (!s) return null;
          return (
            <image
              position="absolute"
              left={corner.left}
              right={corner.right}
              top={corner.top}
              bottom={corner.bottom}
              width={s.width}
              height={s.height}
              src={{ width: s.width, height: s.height, data: s.data, mask: s.mask }}
            />
          );
        }}
      </For>
    </box>
  );
}
