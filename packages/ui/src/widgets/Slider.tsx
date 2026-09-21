import type { JSX } from "@mockintosh/ui";
import { Show } from "solid-js";
import { createSlider, type SliderMetrics } from "../primitives/slider";

const SLIDER: SliderMetrics = { thumb: 12, trackH: 16 };

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
  const slider = createSlider(props, SLIDER);
  const showValue = () => props.showValue ?? (props.label !== undefined || props.format !== undefined);

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
        {...slider.rootProps()}
        width={slider.trackW()}
        height={SLIDER.trackH}
      >
        <box position="absolute" left={0} top={7} width={slider.trackW()} height={2} background={1} />
        <box
          position="absolute"
          left={slider.thumbX()}
          top={2}
          width={SLIDER.thumb}
          height={SLIDER.thumb}
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
