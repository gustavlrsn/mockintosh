import type { CursorName } from "../cursor";
import type { SemanticMetadata } from "../inspection";

export const DEFAULT_SLIDER_WIDTH = 168;

export interface SliderMetrics {
  /** Thumb width; also the value-from-x inset. */
  thumb: number;
  /** Hit-area / track height. Skin-only; the primitive ignores it. */
  trackH: number;
}

export interface SliderBehaviorProps {
  name?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Snap increment. Omit for pixel-level steps. */
  step?: number;
  /** Track width. Default {@link DEFAULT_SLIDER_WIDTH}. */
  width?: number;
  disabled?: boolean;
}

export interface SliderRootProps {
  semantic: SemanticMetadata;
  tabIndex: number | undefined;
  cursor: CursorName;
  onMouseDown: (localX: number) => void;
  onDrag: (localX: number) => void;
  onKeyDown: (key: string) => void;
}

export interface SliderBehavior {
  trackW: () => number;
  thumbX: () => number;
  snap: (value: number) => number;
  valueFromLocalX: (localX: number) => number;
  rootProps: () => SliderRootProps;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Snap, pointer→value, and arrow-key step. Thumb size comes from the skin. */
export function createSlider(props: SliderBehaviorProps, metrics: SliderMetrics): SliderBehavior {
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 1;
  const trackW = () => props.width ?? DEFAULT_SLIDER_WIDTH;

  function snap(value: number): number {
    const lo = min();
    const hi = max();
    const stepped =
      props.step !== undefined && props.step > 0
        ? Math.round(value / props.step) * props.step
        : value;
    return clamp(stepped, lo, hi);
  }

  function keyStep(): number {
    if (props.step !== undefined && props.step > 0) return props.step;
    return (max() - min()) / Math.max(1, trackW() - metrics.thumb);
  }

  function valueFromLocalX(localX: number): number {
    const span = trackW() - metrics.thumb;
    const t = span <= 0 ? 0 : clamp((localX - metrics.thumb / 2) / span, 0, 1);
    return snap(min() + t * (max() - min()));
  }

  function setFromLocalX(localX: number): void {
    if (props.disabled) return;
    props.onChange(valueFromLocalX(localX));
  }

  function thumbX(): number {
    const span = max() - min();
    const t = span === 0 ? 0 : (props.value - min()) / span;
    return Math.round(clamp(t, 0, 1) * (trackW() - metrics.thumb));
  }

  function onKeyDown(key: string): void {
    if (props.disabled) return;
    const dir =
      key === "ArrowRight" || key === "ArrowUp"
        ? 1
        : key === "ArrowLeft" || key === "ArrowDown"
          ? -1
          : 0;
    if (!dir) return;
    props.onChange(snap(props.value + dir * keyStep()));
  }

  return {
    trackW,
    thumbX,
    snap,
    valueFromLocalX,
    rootProps: (): SliderRootProps => ({
      semantic: {
        name: props.name,
        role: "slider",
        value: String(props.value),
        enabled: !props.disabled,
      },
      tabIndex: props.disabled ? undefined : 0,
      cursor: props.disabled ? "default" : "pointer",
      onMouseDown: setFromLocalX,
      onDrag: setFromLocalX,
      onKeyDown,
    }),
  };
}
