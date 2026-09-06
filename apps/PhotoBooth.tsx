import { Show, createEffect, createSignal, onCleanup, onMount, type JSX } from "solid-js";
import { Button, type Ink, type RasterSurface } from "@mockintosh/ui";
import { defineApp, useApp, writeSpriteFile } from "@mockintosh/sdk";
import {
  type DitherMode,
  type DitherState,
  ditherVideoFrame,
  getOrCreateDitherState,
} from "./photobooth/dither";

/** Viewfinder size in the app's own (windowed) window. */
const PREVIEW = 288;
const BAR_H = 40;
const COUNTDOWN_SECS = 3;
const CAPTURE_INTERVAL_MS = 66;

/** A 1-byte-per-pixel picture: photos keep the viewfinder size they were taken at. */
interface Photo {
  pixels: Uint8Array;
  width: number;
  height: number;
  timestamp: number;
}

interface Size {
  width: number;
  height: number;
}

/** Paint a picture centred in the surface (clipped when larger), on a flat `fill`. */
function paintPicture(surface: RasterSurface, picture: Photo | null, view: Size, fill: Ink): void {
  surface.fill(fill);
  if (!picture) return;
  const x = Math.floor((view.width - picture.width) / 2);
  const y = Math.floor((view.height - picture.height) / 2);
  surface.blitPixels(picture.pixels, picture.width, picture.height, x, y);
}

function PhotoBooth(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;

  const [loading, setLoading] = createSignal(true);
  const [errorText, setErrorText] = createSignal("");
  const [countdown, setCountdown] = createSignal<number | null>(null);
  const [viewingPhoto, setViewingPhoto] = createSignal<number | null>(null);
  const [photos, setPhotos] = createSignal<Photo[]>([]);
  const [flash, setFlash] = createSignal(false);
  const [ditherMode, setDitherMode] = createSignal<DitherMode>("atkinson");
  const [frame, setFrame] = createSignal(0);

  const isFullScreen = () => win.kind() === "fullscreen";
  /** The viewfinder fills the window above the button bar — the whole screen in full screen. */
  const view = (): Size => ({ width: win.width(), height: win.height() - BAR_H });

  const ditherRef: { current: DitherState | null } = { current: null };
  let video: HTMLVideoElement | null = null;
  let stream: MediaStream | null = null;
  let raf = 0;
  let countdownTimer: ReturnType<typeof setTimeout> | null = null;
  let flashTimer: ReturnType<typeof setTimeout> | null = null;
  let lastCapture = 0;

  function stopLoop(): void {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function captureLoop(): void {
    if (!win.isActive() || loading() || errorText() || viewingPhoto() !== null) {
      raf = requestAnimationFrame(captureLoop);
      return;
    }
    const now = performance.now();
    if (video && video.videoWidth > 0 && now - lastCapture >= CAPTURE_INTERVAL_MS) {
      const { width, height } = view();
      const state = getOrCreateDitherState(ditherRef, width, height);
      ditherVideoFrame(video, state, ditherMode());
      lastCapture = now;
      setFrame((n) => n + 1);
    }
    raf = requestAnimationFrame(captureLoop);
  }

  async function startCamera(): Promise<void> {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      video = document.createElement("video");
      video.playsInline = true;
      video.muted = true;
      video.srcObject = stream;
      await video.play();
      setLoading(false);
      stopLoop();
      raf = requestAnimationFrame(captureLoop);
    } catch {
      setErrorText("Camera access denied.");
      setLoading(false);
    }
  }

  /** The last dithered camera frame, as a picture. */
  function liveFrame(): Photo | null {
    const state = ditherRef.current;
    if (!state) return null;
    return {
      pixels: state.pixels,
      width: state.canvas.width,
      height: state.canvas.height,
      timestamp: 0,
    };
  }

  function takePhoto(): void {
    const live = liveFrame();
    if (!live) return;
    setPhotos((prev) => [
      ...prev,
      { ...live, pixels: new Uint8Array(live.pixels), timestamp: Date.now() },
    ]);
    setFlash(true);
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => setFlash(false), 120);
  }

  function startCountdown(): void {
    if (countdown() !== null || loading() || errorText()) return;
    let remaining = COUNTDOWN_SECS;
    setCountdown(remaining);
    const tick = () => {
      remaining--;
      if (remaining <= 0) {
        setCountdown(null);
        takePhoto();
      } else {
        setCountdown(remaining);
        countdownTimer = setTimeout(tick, 1000);
      }
    };
    countdownTimer = setTimeout(tick, 1000);
  }

  async function savePhoto(photo: Photo): Promise<void> {
    const date = new Date(photo.timestamp);
    const name = `Photo ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    const desktop = app.fs.locate("desktop");
    if (!desktop) return;
    try {
      await writeSpriteFile(
        app.fs,
        desktop.id,
        name,
        { width: photo.width, height: photo.height, data: photo.pixels },
        { attributes: { icon: "icon/photobooth-smr-32" } }
      );
    } catch (e) {
      console.error("Failed to save photo:", e);
    }
  }

  function toggleFullScreen(): void {
    win.setFullScreen(!isFullScreen());
  }

  createEffect(() => {
    const viewing = viewingPhoto();
    const counting = countdown() !== null;
    app.setMenus([
      {
        label: "File",
        items: [
          {
            label: "Take Photo",
            shortcut: "T",
            disabled: counting || viewing !== null || loading() || !!errorText(),
            onClick: () => startCountdown(),
          },
        ],
      },
      {
        label: "View",
        items: [
          {
            label: isFullScreen() ? "Exit Full Screen" : "Full Screen",
            shortcut: "F",
            onClick: toggleFullScreen,
          },
        ],
      },
      {
        label: "Dithering",
        items: [
          {
            type: "radiogroup",
            value: ditherMode(),
            onValueChange: (v) => setDitherMode(v as DitherMode),
            items: [
              { label: "Atkinson", value: "atkinson" },
              { label: "Bayer", value: "bayer" },
            ],
          },
        ],
      },
    ]);
  });

  onMount(() => {
    void startCamera();
  });

  onCleanup(() => {
    stopLoop();
    if (countdownTimer) clearTimeout(countdownTimer);
    if (flashTimer) clearTimeout(flashTimer);
    stream?.getTracks().forEach((t) => t.stop());
    video = null;
    stream = null;
  });

  const viewing = () => {
    const i = viewingPhoto();
    return i !== null ? photos()[i] : undefined;
  };

  return (
    <box width={win.width()} height={win.height()} flexDirection="column" background={0}>
      <box width={view().width} height={view().height} position="relative">
        <raster
          width={view().width}
          height={view().height}
          revision={frame()}
          onPaint={(surface) => {
            const size = { width: surface.rect.width, height: surface.rect.height };
            if (flash()) {
              paintPicture(surface, null, size, 0);
              return;
            }
            paintPicture(surface, viewing() ?? liveFrame(), size, 0);
          }}
        />
        <Show when={loading()}>
          <box position="absolute" left={0} top={0} width={view().width} height={view().height} justifyContent="center" alignItems="center">
            <box background={0} padding={2}>
              <text font="menu">Initializing camera...</text>
            </box>
          </box>
        </Show>
        <Show when={!!errorText()}>
          <box position="absolute" left={0} top={0} width={view().width} height={view().height} justifyContent="center" alignItems="center">
            <box background={0} padding={2}>
              <text font="menu">{errorText()}</text>
            </box>
          </box>
        </Show>
        <Show when={countdown() !== null && countdown()! > 0}>
          <box position="absolute" left={0} top={0} width={view().width} height={view().height} justifyContent="center" alignItems="center">
            <box
              width={28}
              height={24}
              background={0}
              borderColor={1}
              borderWidth={1}
              justifyContent="center"
              alignItems="center"
            >
              <text font="menu" align="center">{String(countdown())}</text>
            </box>
          </box>
        </Show>
      </box>
      <box height={1} background={1} />
      <box height={BAR_H - 1} padding={8} flexDirection="row" alignItems="center" gap={6} background={0}>
        {/* In full screen the menubar is gone; this is the visible way back (Macintosh HIG). */}
        <Show when={isFullScreen()}>
          <Button label="Menu Bar" onClick={toggleFullScreen} />
        </Show>
        <Show
          when={viewingPhoto() === null}
          fallback={
            <>
              <Button
                label="Delete"
                onClick={() => {
                  const i = viewingPhoto();
                  if (i === null) return;
                  const next = photos().filter((_, idx) => idx !== i);
                  setPhotos(next);
                  setViewingPhoto(next.length > 0 ? Math.min(i, next.length - 1) : null);
                }}
              />
              <Button
                label="Save"
                onClick={() => {
                  const photo = viewing();
                  if (photo) void savePhoto(photo);
                }}
              />
              <Show when={(viewingPhoto() ?? 0) > 0}>
                <Button label="<" onClick={() => setViewingPhoto((i) => (i ?? 1) - 1)} />
              </Show>
              <Show when={(viewingPhoto() ?? 0) < photos().length - 1}>
                <Button label=">" onClick={() => setViewingPhoto((i) => (i ?? 0) + 1)} />
              </Show>
              <box flexGrow={1} />
              <text font="body">{`${(viewingPhoto() ?? 0) + 1}/${photos().length}`}</text>
              <Button label="Back" onClick={() => setViewingPhoto(null)} />
            </>
          }
        >
          <box flexGrow={1} />
          <Button
            label={countdown() !== null ? String(countdown()) : "Snap"}
            disabled={countdown() !== null || loading() || !!errorText()}
            onClick={() => startCountdown()}
          />
          <box flexGrow={1} />
          <Show when={photos().length > 0}>
            <Button
              label={`${photos().length} pic${photos().length > 1 ? "s" : ""}`}
              onClick={() => setViewingPhoto(photos().length - 1)}
            />
          </Show>
        </Show>
      </box>
    </box>
  );
}

export default defineApp({
  id: "photobooth",
  requires: ["camera"],
  title: "Photo Booth",
  icon: "icon/photobooth-smr-32",
  defaultSize: { width: PREVIEW, height: PREVIEW + BAR_H },
  scrollable: false,
  resizable: false,
  Component: PhotoBooth,
});
