import type { JSX } from "@mockintosh/ui";

export interface ProgressProps {
  name?: string;
  /** Amount filled. Clamped to `0…max`. */
  value: number;
  /** Upper bound. Default 1. */
  max?: number;
  width?: number;
  height?: number;
}

/** Classic thermometer: a 1px well with an ink fill from the left. */
export function Progress(props: ProgressProps): JSX.Element {
  const max = () => (props.max !== undefined && props.max > 0 ? props.max : 1);
  const ratio = () => {
    const t = props.value / max();
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t;
  };
  const width = () => props.width ?? 120;
  const height = () => props.height ?? 12;
  const inner = () => Math.max(0, height() - 2);
  const fill = () => Math.round(ratio() * Math.max(0, width() - 2));

  return (
    <box
      semantic={{
        name: props.name,
        role: "progressbar",
        value: String(props.value),
      }}
      width={width()}
      height={height()}
      borderColor={1}
      borderWidth={1}
      background={0}
      alignSelf="flex-start"
    >
      <box width={fill()} height={inner()} background={1} />
    </box>
  );
}
