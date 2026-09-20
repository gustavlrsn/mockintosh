import type { JSX } from "@mockintosh/ui";
import { ASCII_PUNCH_MAX, ASCII_PUNCH_MIN, Checkbox } from "@mockintosh/sdk";
import { AdjustSlider } from "./AdjustSlider";

export interface AsciiControlsProps {
  punch: number;
  directional: boolean;
  normalize: boolean;
  diffuse: boolean;
  onPunch: (value: number) => void;
  onDirectional: (value: boolean) => void;
  onNormalize: (value: boolean) => void;
  onDiffuse: (value: boolean) => void;
  trackWidth?: number;
  labelWidth?: number;
  disabled?: boolean;
}

/** Punch slider + neighbor / normalize / leftover-ink toggles. */
export function AsciiControls(props: AsciiControlsProps): JSX.Element {
  const labelWidth = () => props.labelWidth ?? 48;
  const disabled = () => props.disabled === true;
  return (
    <box flexDirection="column" gap={2}>
      <AdjustSlider
        name="punch"
        label="Punch"
        labelWidth={labelWidth()}
        value={props.punch}
        min={ASCII_PUNCH_MIN}
        max={ASCII_PUNCH_MAX}
        step={0.1}
        trackWidth={props.trackWidth}
        format={(v) => `${v.toFixed(1)}×`}
        onChange={props.onPunch}
      />
      <box flexDirection="row" gap={8} alignItems="center">
        <box width={labelWidth()} />
        <Checkbox
          name="directional"
          label="Neighbors"
          checked={props.directional}
          disabled={disabled()}
          onChange={props.onDirectional}
        />
        <Checkbox
          name="normalize"
          label="Norm"
          checked={props.normalize}
          disabled={disabled()}
          onChange={props.onNormalize}
        />
        <Checkbox
          name="diffuse"
          label="Diffuse"
          checked={props.diffuse}
          disabled={disabled()}
          onChange={props.onDiffuse}
        />
      </box>
    </box>
  );
}
