import { Slider } from "@mockintosh/sdk";
import type { JSX } from "@mockintosh/ui";

export interface AdjustSliderProps {
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  /** Snap increment; default 0.05. */
  step?: number;
  format?: (value: number) => string;
  trackWidth?: number;
  /** Fixed label column so stacked sliders line up. */
  labelWidth?: number;
  onChange: (value: number) => void;
}

/** Classic slot + thumb. Thin wrapper over the kit Slider. */
export function AdjustSlider(props: AdjustSliderProps): JSX.Element {
  return (
    <Slider
      name={props.name}
      label={props.label}
      labelWidth={props.labelWidth}
      value={props.value}
      min={props.min}
      max={props.max}
      step={props.step ?? 0.05}
      width={props.trackWidth}
      format={props.format}
      onChange={props.onChange}
    />
  );
}
