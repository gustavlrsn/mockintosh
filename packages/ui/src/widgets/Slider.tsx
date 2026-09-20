import type { JSX } from "@mockintosh/ui";
import { Show } from "solid-js";

const SLIDER_H = 16;
const THUMB = 12;

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export interface SliderProps {
  name?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Snap increment. Omit for pixel-level steps. */
  step?: number;
  /** Track width. Default 168. */
  width?: number;
  disabled?: boolean;
  label?: string;
  /** Fixed label column so stacked sliders line up. */
  labelWidth?: number;
  format?: (value: number) => string;
  /** Show the formatted value. Defaults on when `label` or `format` is set. */
  showValue?: boolean;
}

/** Classic slot + thumb. Photo Booth's AdjustSlider is this plus a label. */
export function Slider(props: SliderProps): JSX.Element {
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 1;
  const trackW = () => props.width ?? 168;
  const showValue = () => props.showValue ?? (props.label !== undefined || props.format !== undefined);

  function snap(value: number): number {
    const lo = min();
    const hi = max();
    const stepped = props.step !== undefined && props.step > 0
      ? Math.round(value / props.step) * props.step
      : value;
    return clamp(stepped, lo, hi);
  }

  function keyStep(): number {
    if (props.step !== undefined && props.step > 0) return props.step;
    return (max() - min()) / Math.max(1, trackW() - THUMB);
  }

  function setFromLocalX(lx: number): void {
    if (props.disabled) return;
    const span = trackW() - THUMB;
    const t = span <= 0 ? 0 : clamp((lx - THUMB / 2) / span, 0, 1);
    props.onChange(snap(min() + t * (max() - min())));
  }

  const thumbX = () => {
    const span = max() - min();
    const t = span === 0 ? 0 : (props.value - min()) / span;
    return Math.round(clamp(t, 0, 1) * (trackW() - THUMB));
  };

  return (
    <box flexDirection="row" gap={6} alignItems="center" alignSelf="flex-start">
      <Show when={props.label !== undefined}>
        <box width={props.labelWidth}>
          <text font="body" stipple={props.disabled} nowrap>
            {props.label!}
          </text>
        </box>
      </Show>
      <box
        semantic={{
          name: props.name,
          role: "slider",
          value: String(props.value),
          enabled: !props.disabled,
        }}
        width={trackW()}
        height={SLIDER_H}
        tabIndex={props.disabled ? undefined : 0}
        cursor={props.disabled ? "default" : "pointer"}
        onMouseDown={(lx) => setFromLocalX(lx)}
        onDrag={(lx) => setFromLocalX(lx)}
        onKeyDown={(key) => {
          if (props.disabled) return;
          const dir =
            key === "ArrowRight" || key === "ArrowUp"
              ? 1
              : key === "ArrowLeft" || key === "ArrowDown"
                ? -1
                : 0;
          if (!dir) return;
          props.onChange(snap(props.value + dir * keyStep()));
        }}
      >
        <box position="absolute" left={0} top={7} width={trackW()} height={2} background={1} />
        <box
          position="absolute"
          left={thumbX()}
          top={2}
          width={THUMB}
          height={THUMB}
          background={0}
          borderColor={1}
          borderWidth={1}
        />
      </box>
      <Show when={showValue()}>
        <text font="body" stipple={props.disabled} nowrap>
          {(props.format ?? String)(props.value)}
        </text>
      </Show>
    </box>
  );
}
