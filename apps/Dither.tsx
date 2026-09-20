import { Show, createEffect, createMemo, createSignal } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import {
  Errored,
  Loading,
  IMAGE_TYPES,
  MIME,
  defineApp,
  encodePng1bit,
  readImageFile,
  useApp,
  writeSpriteFile,
  ASCII_DIFFUSE_DEFAULT,
  ASCII_DIRECTIONAL_DEFAULT,
  ASCII_NORMALIZE_DEFAULT,
  ASCII_PUNCH_DEFAULT,
  asciiOptionsRevision,
  isBaselineAscii,
  type AsciiDitherOptions,
  type FileDocumentProps,
  type ImageFrame,
} from "@mockintosh/sdk";
import { AdjustSlider } from "./photobooth/AdjustSlider";
import { AsciiControls } from "./photobooth/AsciiControls";
import {
  applyAdjustInPlace,
  BRIGHTNESS_DEFAULT,
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  CONTRAST_DEFAULT,
  CONTRAST_MAX,
  CONTRAST_MIN,
  IDENTITY_ADJUST,
  isIdentityAdjust,
} from "./photobooth/adjust";
import {
  CROP_PAN_MAX,
  CROP_PAN_MIN,
  CROP_SCALE_DEFAULT,
  CROP_SCALE_MAX,
  CROP_SCALE_MIN,
  IDENTITY_CROP,
  clampCrop,
  isIdentityCrop,
  sampleCover,
} from "./photobooth/crop";
import { sprites } from "./dither/icons";
import { createPhotoDitherer, type PhotoDither } from "./photobooth/ditherMode";

const BASE_SLIDER_H = 86;
const ASCII_EXTRA_H = 40;
const DECODE_MAX = 800;

type DitherProps = Partial<FileDocumentProps> & Record<string, unknown>;

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

function Dither(props: DitherProps): JSX.Element {
  const app = useApp();
  const win = app.window;

  const [ditherMode, setDitherMode] = createSignal<PhotoDither>("ascii");
  const [contrast, setContrast] = createSignal(CONTRAST_DEFAULT);
  const [brightness, setBrightness] = createSignal(BRIGHTNESS_DEFAULT);
  const [punch, setPunch] = createSignal(ASCII_PUNCH_DEFAULT);
  const [directional, setDirectional] = createSignal(ASCII_DIRECTIONAL_DEFAULT);
  const [normalize, setNormalize] = createSignal(ASCII_NORMALIZE_DEFAULT);
  const [diffuse, setDiffuse] = createSignal(ASCII_DIFFUSE_DEFAULT);
  const [scale, setScale] = createSignal(CROP_SCALE_DEFAULT);
  const [panX, setPanX] = createSignal(IDENTITY_CROP.panX);
  const [panY, setPanY] = createSignal(IDENTITY_CROP.panY);
  const [frame, setFrame] = createSignal(0);

  const sliderH = () => (ditherMode() === "ascii" ? BASE_SLIDER_H + ASCII_EXTRA_H : BASE_SLIDER_H);
  const view = () => ({
    width: win.width(),
    height: Math.max(1, win.height() - sliderH()),
  });

  let drag: { lx: number; ly: number; panX: number; panY: number } | null = null;
  let dither: ((src: ImageFrame, out: Uint8Array) => void) | null = null;
  let ditherKey = "";
  let scaled: ImageFrame | null = null;
  let bits: Uint8Array | null = null;
  let ready: ImageFrame | null = null;

  const source = createMemo(async () => {
    const fileId = props.fileId;
    if (!fileId) return null;
    return readImageFile(app.fs, app.images, fileId, { maxWidth: DECODE_MAX, maxHeight: DECODE_MAX });
  });

  createEffect(
    () => props.title,
    (title) => {
      if (title) win.setTitle(String(title));
    },
  );

  function resetAdjust(): void {
    setContrast(IDENTITY_ADJUST.contrast);
    setBrightness(IDENTITY_ADJUST.brightness);
  }

  function resetCrop(): void {
    setScale(IDENTITY_CROP.scale);
    setPanX(IDENTITY_CROP.panX);
    setPanY(IDENTITY_CROP.panY);
  }

  function asciiOpts(): AsciiDitherOptions {
    return {
      punch: punch(),
      directional: directional(),
      normalize: normalize(),
      diffuse: diffuse(),
    };
  }

  function resetAscii(): void {
    setPunch(ASCII_PUNCH_DEFAULT);
    setDirectional(ASCII_DIRECTIONAL_DEFAULT);
    setNormalize(ASCII_NORMALIZE_DEFAULT);
    setDiffuse(ASCII_DIFFUSE_DEFAULT);
  }

  function beginPan(lx: number, ly: number): void {
    drag = { lx, ly, panX: panX(), panY: panY() };
  }

  function movePan(lx: number, ly: number): void {
    if (!drag) return;
    const next = clampCrop({
      scale: scale(),
      panX: drag.panX + (lx - drag.lx),
      panY: drag.panY + (ly - drag.ly),
    });
    setPanX(next.panX);
    setPanY(next.panY);
  }

  function renderBits(src: ImageFrame): Uint8Array {
    const { width, height } = view();
    const mode = ditherMode();
    const ascii = asciiOpts();
    const key = `${mode}|${width}|${height}|${asciiOptionsRevision(ascii)}`;
    if (!dither || ditherKey !== key) {
      ditherKey = key;
      dither = createPhotoDitherer(mode, width, height, ascii);
      scaled = { width, height, rgba: new Uint8ClampedArray(width * height * 4) };
      bits = new Uint8Array(width * height);
    }
    sampleCover(src, scaled!, clampCrop({ scale: scale(), panX: panX(), panY: panY() }));
    applyAdjustInPlace(scaled!, { contrast: contrast(), brightness: brightness() });
    dither(scaled!, bits!);
    return bits!;
  }

  async function saveDithered(): Promise<void> {
    const src = ready;
    if (!src) return;
    const desktop = app.fs.locate("desktop");
    if (!desktop) return;
    const pixels = renderBits(src);
    const { width, height } = view();
    const base = props.title ? stem(String(props.title)) : "Dither";
    try {
      await writeSpriteFile(app.fs, desktop.id, `${base} 1-bit`, { width, height, data: pixels }, {
        attributes: { icon: "icon/camera" },
      });
    } catch (e) {
      console.error("Failed to save dithered image:", e);
    }
  }

  async function exportPng(): Promise<void> {
    const src = ready;
    const download = app.download;
    if (!src || !download) return;
    const pixels = renderBits(src);
    const { width, height } = view();
    const base = props.title ? stem(String(props.title)) : "Dither";
    try {
      await download.save({
        name: `${base} 1-bit.png`,
        type: "image/png",
        bytes: encodePng1bit(pixels, width, height),
      });
    } catch (err) {
      await app.os.showDialog({
        message: `Couldn't export: ${err instanceof Error ? err.message : String(err)}`,
        buttons: ["OK"],
      });
    }
  }

  createEffect(
    () => ({
      fileId: props.fileId,
      mode: ditherMode(),
      contrast: contrast(),
      brightness: brightness(),
      punch: punch(),
      directional: directional(),
      normalize: normalize(),
      diffuse: diffuse(),
      scale: scale(),
      panX: panX(),
      panY: panY(),
    }),
    ({ fileId, mode, contrast: contrastAmt, brightness: brightAmt, scale: zoom, panX: x, panY: y }) => {
      const hasFile = !!fileId;
      const crop = { scale: zoom, panX: x, panY: y };
      const canExport = !!app.download;
      const ascii = asciiOpts();
      app.setMenus([
        {
          label: "File",
          items: [
            {
              label: "Save 1-bit",
              shortcut: "S",
              disabled: !hasFile,
              onClick: () => {
                void saveDithered();
              },
            },
            ...(canExport
              ? [
                  {
                    label: "Export…",
                    shortcut: "E",
                    disabled: !hasFile,
                    onClick: () => {
                      void exportPng();
                    },
                  },
                ]
              : []),
          ],
        },
        {
          label: "Adjust",
          items: [
            {
              label: "Reset Tone",
              disabled: isIdentityAdjust({ contrast: contrastAmt, brightness: brightAmt }),
              onClick: resetAdjust,
            },
            {
              label: "Reset Crop",
              disabled: isIdentityCrop(crop),
              onClick: resetCrop,
            },
            {
              label: "Reset Ascii",
              disabled: mode !== "ascii" || isBaselineAscii(ascii),
              onClick: resetAscii,
            },
          ],
        },
        {
          label: "Dithering",
          items: [
            {
              type: "radiogroup",
              value: mode,
              onValueChange: (v) => setDitherMode(v as PhotoDither),
              items: [
                { label: "Atkinson", value: "atkinson" },
                { label: "Bayer", value: "bayer" },
                { label: "Ascii", value: "ascii" },
              ],
            },
          ],
        },
      ]);
    },
  );

  const track = () => Math.max(72, view().width - 120);

  return (
    <box width={win.width()} height={win.height()} flexDirection="column" background={0}>
      <Show
        when={props.fileId}
        fallback={
          <box width={win.width()} height={win.height()} justifyContent="center" alignItems="center" padding={16} flexDirection="column" gap={6}>
            <text font="body" align="center">Drop an image onto</text>
            <text font="body" align="center">the desktop, then</text>
            <text font="body" align="center">open it.</text>
          </box>
        }
      >
        <Loading
          fallback={
            <box width={view().width} height={view().height} justifyContent="center" alignItems="center">
              <text font="menu">Opening…</text>
            </box>
          }
        >
          <Errored
            fallback={(err) => (
              <box width={view().width} height={view().height} justifyContent="center" alignItems="center" padding={12}>
                <text font="menu" align="center">{err instanceof Error ? err.message : String(err)}</text>
              </box>
            )}
          >
          {(() => {
            const src = source();
            ready = src;
            const size = view();
            const pixels = src ? renderBits(src) : null;
            const revision =
              frame() +
              size.width * 1_000_003 +
              size.height * 1_000_019 +
              Math.round(contrast() * 20) +
              Math.round(brightness() + 64) * 80 +
              Math.round(scale() * 50) * 8_000 +
              (panX() + 50) * 400_000 +
              (panY() + 50) * 40_000_000 +
              (ditherMode() === "ascii" ? 1 : ditherMode() === "bayer" ? 2 : 3) +
              asciiOptionsRevision(asciiOpts()) * 17;
            return (
              <>
                <box
                  width={size.width}
                  height={size.height}
                  onMouseDown={beginPan}
                  onDrag={movePan}
                  onDragEnd={() => {
                    drag = null;
                  }}
                >
                  <raster
                    width={size.width}
                    height={size.height}
                    revision={revision}
                    onPaint={(surface) => {
                      surface.fill(0);
                      if (pixels) surface.blitPixels(pixels, size.width, size.height, 0, 0);
                    }}
                  />
                </box>
                <box height={1} background={1} />
                <box height={sliderH() - 1} padding={4} flexDirection="column" gap={2} background={0}>
                  <AdjustSlider
                    name="contrast"
                    label="Contrast"
                    labelWidth={48}
                    value={contrast()}
                    min={CONTRAST_MIN}
                    max={CONTRAST_MAX}
                    trackWidth={track()}
                    format={(v) => `${Math.round(v * 100)}%`}
                    onChange={(v) => {
                      setContrast(v);
                      setFrame((n) => n + 1);
                    }}
                  />
                  <AdjustSlider
                    name="brightness"
                    label="Bright"
                    labelWidth={48}
                    value={brightness()}
                    min={BRIGHTNESS_MIN}
                    max={BRIGHTNESS_MAX}
                    step={2}
                    trackWidth={track()}
                    format={(v) => (v > 0 ? `+${v}` : String(v))}
                    onChange={(v) => {
                      setBrightness(v);
                      setFrame((n) => n + 1);
                    }}
                  />
                  <box flexDirection="row" gap={6} alignItems="center">
                    <AdjustSlider
                      name="scale"
                      label="Scale"
                      labelWidth={48}
                      value={scale()}
                      min={CROP_SCALE_MIN}
                      max={CROP_SCALE_MAX}
                      step={0.02}
                      trackWidth={Math.max(48, track() - 140)}
                      format={(v) => `${Math.round(v * 100)}%`}
                      onChange={(v) => {
                        setScale(v);
                        setFrame((n) => n + 1);
                      }}
                    />
                    <AdjustSlider
                      name="pan-x"
                      label="X"
                      labelWidth={10}
                      value={panX()}
                      min={CROP_PAN_MIN}
                      max={CROP_PAN_MAX}
                      step={1}
                      trackWidth={48}
                      format={(v) => `${v > 0 ? "+" : ""}${Math.round(v)}`}
                      onChange={setPanX}
                    />
                    <AdjustSlider
                      name="pan-y"
                      label="Y"
                      labelWidth={10}
                      value={panY()}
                      min={CROP_PAN_MIN}
                      max={CROP_PAN_MAX}
                      step={1}
                      trackWidth={48}
                      format={(v) => `${v > 0 ? "+" : ""}${Math.round(v)}`}
                      onChange={setPanY}
                    />
                  </box>
                  <Show when={ditherMode() === "ascii"}>
                    <AsciiControls
                      punch={punch()}
                      directional={directional()}
                      normalize={normalize()}
                      diffuse={diffuse()}
                      trackWidth={track()}
                      labelWidth={48}
                      onPunch={(v) => {
                        setPunch(v);
                        setFrame((n) => n + 1);
                      }}
                      onDirectional={setDirectional}
                      onNormalize={setNormalize}
                      onDiffuse={setDiffuse}
                    />
                  </Show>
                </box>
              </>
            );
          })()}
          </Errored>
        </Loading>
      </Show>
    </box>
  );
}

export default defineApp({
  id: "dither",
  requires: ["images"],
  title: "Dither",
  icon: "dither/icon",
  sprites,
  defaultSize: { width: 288, height: 288 + BASE_SLIDER_H + ASCII_EXTRA_H },
  minSize: { width: 220, height: 180 },
  scrollable: false,
  resizable: true,
  fileTypes: [MIME.sprite, ...IMAGE_TYPES],
  Component: Dither,
});
