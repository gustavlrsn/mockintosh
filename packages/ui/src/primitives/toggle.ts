import type { CursorName } from "../cursor";
import type { SemanticMetadata } from "../inspection";

export type ToggleRole = "checkbox" | "switch";

export interface ToggleBehaviorProps {
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Inspection role. Defaults to `"checkbox"`. */
  role?: ToggleRole;
}

export interface ToggleRootProps {
  semantic: SemanticMetadata;
  tabIndex: number | undefined;
  cursor: CursorName;
  onClick: () => void;
  onKeyDown: (key: string) => void;
}

export interface ToggleBehavior {
  flip: () => void;
  rootProps: () => ToggleRootProps;
}

/** Exclusive of look: flip, Space/Enter, checkbox/switch semantics. */
export function createToggle(props: ToggleBehaviorProps): ToggleBehavior {
  function flip(): void {
    if (!props.disabled) props.onChange(!props.checked);
  }

  function onKeyDown(key: string): void {
    if (key === " " || key === "Enter") flip();
  }

  return {
    flip,
    rootProps: (): ToggleRootProps => ({
      semantic: {
        name: props.name,
        role: props.role ?? "checkbox",
        value: String(props.checked),
        enabled: !props.disabled,
      },
      tabIndex: props.disabled ? undefined : 0,
      cursor: props.disabled ? "default" : "pointer",
      onClick: flip,
      onKeyDown,
    }),
  };
}
