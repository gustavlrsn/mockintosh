import { createSignal } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { useOS } from "../context";

interface SplashProps {
  onDismiss: () => void;
}

export function Splash(props: SplashProps): JSX.Element {
  const os = useOS();
  const sprite = os.sprites.get("icon/happy");

  const cx = Math.floor((os.resolution.width - (sprite?.width ?? 32)) / 2);
  const cy = Math.floor((os.resolution.height - (sprite?.height ?? 32)) / 2);

  return (
    <box
      width={os.resolution.width}
      height={os.resolution.height}
      background="checker"
      onMouseDown={() => props.onDismiss()}
      onKeyDown={() => props.onDismiss()}
    >
      {sprite && (
        <image
          position="absolute"
          left={cx}
          top={cy}
          width={sprite.width}
          height={sprite.height}
          src={{ width: sprite.width, height: sprite.height, data: sprite.data, mask: sprite.mask }}
        />
      )}
    </box>
  );
}
