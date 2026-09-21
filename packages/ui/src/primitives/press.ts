import { createSignal, type Accessor } from "solid-js";
import type { SemanticMetadata } from "../inspection";

export interface PressProps {
  name?: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface PressRootProps {
  semantic: SemanticMetadata;
  tabIndex: number | undefined;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onKeyDown: (key: string) => void;
}

export interface Press {
  pressed: Accessor<boolean>;
  rootProps: () => PressRootProps;
}

/**
 * Press tracking, Enter/Space, and button semantics. The skin owns the tree.
 * Fires `onClick` on mouseup (not click) so a double-click still counts twice.
 */
export function createPress(props: PressProps): Press {
  const [pressed, setPressed] = createSignal(false, { ownedWrite: true });

  function activate(): void {
    if (!props.disabled) props.onClick();
  }

  function onMouseDown(): void {
    if (!props.disabled) setPressed(true);
  }

  function onMouseUp(): void {
    setPressed(false);
    activate();
  }

  function onMouseLeave(): void {
    setPressed(false);
  }

  function onKeyDown(key: string): void {
    if ((key === "Enter" || key === " ") && !props.disabled) props.onClick();
  }

  return {
    pressed,
    rootProps: (): PressRootProps => ({
      semantic: { name: props.name, role: "button", enabled: !props.disabled },
      tabIndex: props.disabled ? undefined : 0,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      onKeyDown,
    }),
  };
}
