import { createMemo } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { paintDitherDissolve } from "../ditherDissolve";

export interface DitherTransitionProps {
  from: Uint8Array;
  to: Uint8Array;
  width: number;
  height: number;
  /** 0 = `from`, 1 = `to`. Defaults to 1. */
  progress?: number;
}

/**
 * Bayer-dissolve between two 1-bit frames. The owner drives `progress`;
 * this widget does not play itself.
 */
export function DitherTransition(props: DitherTransitionProps): JSX.Element {
  const pixels = createMemo(() => {
    const width = props.width;
    const height = props.height;
    const out = new Uint8Array(width * height);
    paintDitherDissolve(out, props.from, props.to, width, height, props.progress ?? 1);
    return out;
  });

  return (
    <bitmap
      semantic={{ role: "img", value: String(props.progress ?? 1) }}
      pixels={pixels()}
      width={props.width}
      height={props.height}
    />
  );
}
