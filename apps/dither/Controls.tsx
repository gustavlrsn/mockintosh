import type { JSX } from "@mockintosh/ui";
import { Radio, Show, createEffect, onCleanup, useApp, type MenubarDefinition } from "@mockintosh/sdk";
import { AdjustSlider } from "../photobooth/AdjustSlider";
import { AsciiControls } from "../photobooth/AsciiControls";
import {
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  CONTRAST_MAX,
  CONTRAST_MIN,
} from "../photobooth/adjust";
import { CROP_PAN_MAX, CROP_PAN_MIN, CROP_SCALE_MAX, CROP_SCALE_MIN } from "../photobooth/crop";
import type { PhotoDither } from "../photobooth/ditherMode";

export interface DitherControlsProps<S> {
  ditherMode: () => PhotoDither;
  setDitherMode: (mode: PhotoDither) => void;
  contrast: () => number;
  setContrast: (value: number) => void;
  brightness: () => number;
  setBrightness: (value: number) => void;
  scale: () => number;
  setScale: (value: number) => void;
  panX: () => number;
  setPanX: (value: number) => void;
  panY: () => number;
  setPanY: (value: number) => void;
  punch: () => number;
  setPunch: (value: number) => void;
  directional: () => boolean;
  setDirectional: (value: boolean) => void;
  normalize: () => boolean;
  setNormalize: (value: boolean) => void;
  diffuse: () => boolean;
  setDiffuse: (value: boolean) => void;
  /** Reads the document's menu inputs so this palette's menubar stays in sync. */
  snapshot: () => S;
  menusFor: (state: S) => MenubarDefinition[];
  /** The document window dropped this palette (close box, or the view closing). */
  onClose: () => void;
}

const LABEL_W = 48;

/**
 * Dither's tool palette. State lives in the document window; this window
 * only reads and writes it, and floats above a full-screen picture.
 */
export function DitherControls<S>(props: DitherControlsProps<S>): JSX.Element {
  const app = useApp();
  const win = app.window;
  const track = () => Math.max(72, win.width() - 120);
  const ascii = () => props.ditherMode() === "ascii";

  createEffect(
    () => props.snapshot(),
    (state) => {
      app.setMenus(props.menusFor(state));
    },
  );

  onCleanup(() => props.onClose());

  return (
    <box
      width={win.width()}
      height={win.height()}
      padding={4}
      flexDirection="column"
      gap={2}
      background={0}
    >
      <box flexDirection="row" gap={8} alignItems="center">
        <Radio
          name="dither-atkinson"
          label="Atkinson"
          checked={props.ditherMode() === "atkinson"}
          onChange={() => props.setDitherMode("atkinson")}
        />
        <Radio
          name="dither-bayer"
          label="Bayer"
          checked={props.ditherMode() === "bayer"}
          onChange={() => props.setDitherMode("bayer")}
        />
        <Radio
          name="dither-ascii"
          label="Ascii"
          checked={ascii()}
          onChange={() => props.setDitherMode("ascii")}
        />
      </box>
      <AdjustSlider
        name="contrast"
        label="Contrast"
        labelWidth={LABEL_W}
        value={props.contrast()}
        min={CONTRAST_MIN}
        max={CONTRAST_MAX}
        trackWidth={track()}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={props.setContrast}
      />
      <AdjustSlider
        name="brightness"
        label="Bright"
        labelWidth={LABEL_W}
        value={props.brightness()}
        min={BRIGHTNESS_MIN}
        max={BRIGHTNESS_MAX}
        step={2}
        trackWidth={track()}
        format={(v) => (v > 0 ? `+${v}` : String(v))}
        onChange={props.setBrightness}
      />
      <AdjustSlider
        name="scale"
        label="Scale"
        labelWidth={LABEL_W}
        value={props.scale()}
        min={CROP_SCALE_MIN}
        max={CROP_SCALE_MAX}
        step={0.02}
        trackWidth={track()}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={props.setScale}
      />
      <AdjustSlider
        name="pan-x"
        label="X"
        labelWidth={LABEL_W}
        value={props.panX()}
        min={CROP_PAN_MIN}
        max={CROP_PAN_MAX}
        step={1}
        trackWidth={track()}
        format={(v) => `${v > 0 ? "+" : ""}${Math.round(v)}`}
        onChange={props.setPanX}
      />
      <AdjustSlider
        name="pan-y"
        label="Y"
        labelWidth={LABEL_W}
        value={props.panY()}
        min={CROP_PAN_MIN}
        max={CROP_PAN_MAX}
        step={1}
        trackWidth={track()}
        format={(v) => `${v > 0 ? "+" : ""}${Math.round(v)}`}
        onChange={props.setPanY}
      />
      <Show when={ascii()}>
        <AsciiControls
          punch={props.punch()}
          directional={props.directional()}
          normalize={props.normalize()}
          diffuse={props.diffuse()}
          trackWidth={track()}
          labelWidth={LABEL_W}
          onPunch={props.setPunch}
          onDirectional={props.setDirectional}
          onNormalize={props.setNormalize}
          onDiffuse={props.setDiffuse}
        />
      </Show>
    </box>
  );
}
