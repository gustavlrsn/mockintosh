import { Loading, Errored, createMemo } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import {
  isDitheredAsset,
  isImageFrame,
  rasterizeFrame,
  type DitheredAsset,
  type DitherMode,
  type DitherOptions,
  type CoverFrameOptions,
  type ImageFrame,
} from "../dither";
import { useUIServices, type UIImageService } from "../services";

/** URL, already-decoded RGBA, or a build-time 1-bit asset. */
export type DitheredSrc = string | ImageFrame | DitheredAsset;

export interface DitheredProps extends DitherOptions, CoverFrameOptions {
  src: DitheredSrc;
  width: number;
  height: number;
  /** Defaults to `"atkinson"` for photographs. */
  mode?: DitherMode;
}

function ditherSrc(
  src: DitheredSrc,
  width: number,
  height: number,
  mode: DitherMode,
  options: DitherOptions & CoverFrameOptions,
  decode: UIImageService["decode"] | undefined,
): Uint8Array | Promise<Uint8Array> {
  if (isDitheredAsset(src)) return src.pixels;
  if (isImageFrame(src)) return rasterizeFrame(src, width, height, mode, options);
  if (!decode) {
    throw new Error("Dithered URL src needs createUI({ services: { images } })");
  }
  return decode(src, { maxWidth: width, maxHeight: height }).then((frame) =>
    rasterizeFrame(frame, width, height, mode, options),
  );
}

/**
 * Photograph → 1-bit `<bitmap>`.
 *
 * - `src` string: host `images.decode` (browser fetches a URL).
 * - `src` ImageFrame: dither now (tests, already-decoded buffers).
 * - `src` DitheredAsset: paint as-is (Vite `?dither=` build-time import).
 */
export function Dithered(props: DitheredProps): JSX.Element {
  const services = useUIServices();
  const pixels = createMemo(() =>
    ditherSrc(
      props.src,
      props.width,
      props.height,
      props.mode ?? "atkinson",
      {
        threshold: props.threshold,
        match: props.match,
        punch: props.punch,
        directional: props.directional,
        normalize: props.normalize,
        diffuse: props.diffuse,
        mirror: props.mirror,
      },
      services.images?.decode,
    ),
  );

  return (
    <Loading fallback={<box width={props.width} height={props.height} background={0} />}>
      <Errored fallback={() => <box width={props.width} height={props.height} background={1} />}>
        <bitmap pixels={pixels()} width={props.width} height={props.height} />
      </Errored>
    </Loading>
  );
}
