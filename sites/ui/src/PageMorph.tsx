import type { JSX } from "@mockintosh/ui";
import { MORPH_CLIP } from "./inkMorph";

/**
 * Marks a region whose ink remaps on catalog navigations. Chrome outside
 * this box (the header) keeps painting live.
 */
export function Morph(props: { children?: JSX.Element }): JSX.Element {
  return (
    <box
      width="100%"
      flexGrow={1}
      flexShrink={1}
      minHeight={0}
      overflow="hidden"
      semantic={{ name: MORPH_CLIP }}
    >
      {props.children}
    </box>
  );
}
