import { Show, createEffect, createSignal, onCleanup, onMount, type JSX } from "solid-js";
import { Button } from "@mockintosh/ui";
import type { GrafPort } from "@mockintosh/quickdraw";
import { registerApp } from "../src/os/apps";
import { useOS } from "../src/os/context";
import { useWindow } from "../src/os/windowContext";
import {
  type DitherMode,
  type DitherState,
  ditherVideoFrame,
  getOrCreateDitherState,
  pack1bitTo2bpp,
} from "./photobooth/dither";

const PREVIEW = 288;
const BAR_H = 40;
const COUNTDOWN_SECS = 3;
const CAPTURE_INTERVAL_MS = 66;

interface Photo {
  pixels: Uint8Array;
  timestamp: number;
}

function paint1bit(
  portUnknown: unknown,
  rect: { x: number; y: number; width: number; height: number },
  pixels: Uint8Array | null,
  srcW: number,
  srcH: number,
  fill: number
): void {
  const port = portUnknown as GrafPort;
  const { baseAddr, rowBytes, bounds } = port.portBits;
  const w = Math.min(srcW, rect.width);
  const h = Math.min(srcH, rect.height);
  for (let y = 0; y < h; y++) {
    const dstRow = (rect.y + y - bounds.top) * rowBytes - bounds.left;
    for (let x = 0; x < w; x++) {
      baseAddr[dstRow + rect.x + x] = pixels ? pixels[y * srcW + x] : fill;
    }
  }
}

export function PhotoBooth(_props: Record<string, unknown>): JSX.Element {
  const os = useOS();
  const win = useWindow();

  const [loading, setLoading] = createSignal(true);
  const [errorText, setErrorText] = createSignal("");
  const [countdown, setCountdown] = createSignal<number | null>(null);
  const [viewingPhoto, setViewingPhoto] = createSignal<number | null>(null);
  const [photos, setPhotos] = createSignal<Photo[]>([]);
  const [flash, setFlash] = createSignal(false);
  const [ditherMode, setDitherMode] = createSignal<DitherMode>("atkinson");
  const [frame, setFrame] = createSignal(0);

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
      const state = getOrCreateDitherState(ditherRef, PREVIEW, PREVIEW);
      ditherVideoFrame(video, state, ditherMode());
      lastCapture = now;
      setFrame((n) => n + 1);
      os.scheduleRepaint();
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

  function takePhoto(): void {
    const src = ditherRef.current?.pixels;
    if (!src) return;
    setPhotos((prev) => [
      ...prev,
      { pixels: new Uint8Array(src), timestamp: Date.now() },
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
    const desktop = os.fs.resolvePath("/Mockintosh HD/Desktop Folder");
    if (!desktop) return;
    try {
      await os.fs.writeImage(desktop.id, name, {
        width: PREVIEW,
        height: PREVIEW,
        data: pack1bitTo2bpp(photo.pixels),
      }, { icon: "icon/photobooth-smr-32" });
    } catch (e) {
      console.error("Failed to save photo:", e);
    }
  }

  createEffect(() => {
    const viewing = viewingPhoto();
    const n = photos().length;
    const counting = countdown() !== null;
    win.setMenus([
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
    void n;
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
      <box width={PREVIEW} height={PREVIEW} position="relative">
        <raster
          width={PREVIEW}
          height={PREVIEW}
          onPaint={(port, rect) => {
            void frame();
            if (flash()) {
              paint1bit(port, rect, null, PREVIEW, PREVIEW, 0);
              return;
            }
            const photo = viewing();
            if (photo) {
              paint1bit(port, rect, photo.pixels, PREVIEW, PREVIEW, 0);
              return;
            }
            paint1bit(port, rect, ditherRef.current?.pixels ?? null, PREVIEW, PREVIEW, 0);
          }}
        />
        <Show when={loading()}>
          <box position="absolute" left={60} top={PREVIEW / 2 - 8} background={0} padding={2}>
            <text font="menu">Initializing camera...</text>
          </box>
        </Show>
        <Show when={!!errorText()}>
          <box position="absolute" left={8} top={PREVIEW / 2 - 8} background={0} padding={2}>
            <text font="menu">{errorText()}</text>
          </box>
        </Show>
        <Show when={countdown() !== null && countdown()! > 0}>
          <box
            position="absolute"
            left={PREVIEW / 2 - 14}
            top={PREVIEW / 2 - 12}
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
        </Show>
      </box>
      <box height={1} background={1} />
      <box height={BAR_H - 1} padding={8} flexDirection="row" alignItems="center" gap={6} background={0}>
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

registerApp({
  id: "photobooth",
  title: "Photo Booth",
  icon: "icon/photobooth-smr-32",
  defaultSize: { width: PREVIEW, height: PREVIEW + BAR_H },
  scrollable: false,
  resizable: false,
  Component: PhotoBooth,
});
