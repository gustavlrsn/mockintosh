import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { OSEvent } from "../lib/toolbox/EventManager";
import { OSServices } from "../lib/canvas/OSServices";
import { makeRect } from "@mockintosh/quickdraw";
import { MenubarDefinition } from "../lib/toolbox/MenuManager";
import {
  NewControl,
  DrawControls,
  inButton,
} from "../lib/toolbox/ControlManager";

const WIDTH = 288;
const HEIGHT = 288;
const COUNTDOWN_SECS = 3;
const CAPTURE_INTERVAL_MS = 66; // ~15fps

type DitherMode = "atkinson" | "bayer";

interface Photo {
  imageData: ImageData;
  timestamp: number;
}

interface DitherCanvas {
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
}

interface DitherState {
  dst: DitherCanvas;
  pixels: Uint8Array;
  luminance: Float32Array;
}

function getOrCreateDitherState(
  ref: { current: DitherState | null },
  w: number,
  h: number
): DitherState {
  const existing = ref.current;
  if (
    existing &&
    existing.dst.canvas.width === w &&
    existing.dst.canvas.height === h
  ) {
    return existing;
  }
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  ref.current = {
    dst: { canvas, ctx },
    pixels: new Uint8Array(w * h),
    luminance: new Float32Array(w * h),
  };
  return ref.current;
}

/**
 * Atkinson dither that outputs directly to a 1-bit Uint8Array (0=white, 1=black).
 * Avoids the RGBA intermediary and TypedArray.fill() per-pixel overhead of canvas-dither.
 */
function atkinsonTo1bit(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  out: Uint8Array,
  lum: Float32Array
): void {
  const len = w * h;

  for (let i = 0; i < len; i++) {
    const ri = i << 2;
    lum[i] = rgba[ri] * 0.299 + rgba[ri + 1] * 0.587 + rgba[ri + 2] * 0.114;
  }

  for (let i = 0; i < len; i++) {
    const val = lum[i];
    const bit = val < 129 ? 1 : 0; // 1=black, 0=white
    out[i] = bit;
    const err = (val - (bit ? 0 : 255)) / 8;
    lum[i + 1] += err;
    lum[i + 2] += err;
    lum[i + w - 1] += err;
    lum[i + w] += err;
    lum[i + w + 1] += err;
    lum[i + (w << 1)] += err;
  }
}

const BAYER_MAP = [
  [15, 135, 45, 165],
  [195, 75, 225, 105],
  [60, 180, 30, 150],
  [240, 120, 210, 90],
];

function bayerTo1bit(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  out: Uint8Array,
  threshold: number
): void {
  const len = w * h;
  for (let i = 0; i < len; i++) {
    const ri = i << 2;
    const lum = rgba[ri] * 0.299 + rgba[ri + 1] * 0.587 + rgba[ri + 2] * 0.114;
    const x = i % w;
    const y = (i / w) | 0;
    const mapped = (lum + BAYER_MAP[x & 3][y & 3]) >> 1;
    out[i] = mapped < threshold ? 1 : 0;
  }
}

function ditherFrame(
  video: HTMLVideoElement,
  state: DitherState,
  mode: DitherMode
): void {
  const srcW = video.videoWidth;
  const srcH = video.videoHeight;
  const { dst, pixels, luminance } = state;
  const targetW = dst.canvas.width;
  const targetH = dst.canvas.height;

  const cropSize = Math.min(srcW, srcH);
  const cropX = (srcW - cropSize) >> 1;
  const cropY = (srcH - cropSize) >> 1;

  const { ctx } = dst;
  ctx.setTransform(-1, 0, 0, 1, targetW, 0);
  ctx.drawImage(
    video,
    cropX,
    cropY,
    cropSize,
    cropSize,
    0,
    0,
    targetW,
    targetH
  );

  const scaled = ctx.getImageData(0, 0, targetW, targetH);

  if (mode === "bayer") {
    bayerTo1bit(scaled.data, targetW, targetH, pixels, 128);
  } else {
    luminance.fill(0);
    atkinsonTo1bit(scaled.data, targetW, targetH, pixels, luminance);
  }
}

export const PhotoBoothApp: SystemApp = {
  id: "photobooth",
  title: "Photo Booth",
  icon: "icon/photobooth-smr-32",
  defaultSize: { width: WIDTH, height: HEIGHT + 40 },
  scrollable: false,

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const os: OSServices = props._os;
    const [loading, setLoading] = app.useState(true);
    const [errorText, setErrorText] = app.useState("");
    const [countdown, setCountdown] = app.useState<number | null>(null);
    const [viewingPhoto, setViewingPhoto] = app.useState<number | null>(null);
    const [photos, setPhotos] = app.useState<Photo[]>([]);
    const [flash, setFlash] = app.useState(false);
    const [ditherMode, setDitherMode] = app.useState<DitherMode>("atkinson");
    const animRef = app.useRef<number | null>(null);
    const countdownRef = app.useRef<ReturnType<typeof setTimeout> | null>(null);
    const ditherRef = app.useRef<DitherState | null>(null);
    const lastControlsKeyRef = app.useRef<string>("");

    ctx.clear(WHITE);

    // Camera init (runs once)
    app.useEffect(() => {
      let cancelled = false;

      (async () => {
        const ok = await os.camera.requestAccess();
        if (cancelled) return;
        if (!ok) {
          setErrorText("Camera access denied.");
        }
        setLoading(false);
      })();

      return () => {
        cancelled = true;
        os.camera.release();
      };
    }, []);

    // Capture loop — restarts when dither mode changes or camera becomes ready
    app.useEffect(() => {
      if (loading || errorText) return;

      let cancelled = false;
      let lastCapture = 0;

      function captureLoop() {
        if (cancelled) return;
        const now = performance.now();
        if (now - lastCapture >= CAPTURE_INTERVAL_MS) {
          const video = os.camera.getVideoElement();
          if (video && video.videoWidth > 0) {
            const state = getOrCreateDitherState(ditherRef, WIDTH, HEIGHT);
            ditherFrame(video, state, ditherMode);
          }
          lastCapture = now;
          app.scheduleRender();
        }
        animRef.current = requestAnimationFrame(captureLoop);
      }
      captureLoop();

      return () => {
        cancelled = true;
        if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      };
    }, [ditherMode, loading, errorText]);

    // --- Drawing ---

    if (flash) {
      ctx.fillRect(0, 0, ctx.width, ctx.height, WHITE);
      return;
    }

    if (viewingPhoto !== null && photos.length > viewingPhoto) {
      const photo = photos[viewingPhoto];
      if (photo.imageData) {
        ctx.blitImageData(photo.imageData, 0, 0);
      }
    } else if (ditherRef.current) {
      ctx.blit1bitPixels(ditherRef.current.pixels, WIDTH, HEIGHT, 0, 0);
    }

    if (loading) {
      ctx.drawText("Initializing camera...", WIDTH / 2 - 60, HEIGHT / 2 - 6, {
        font: "menu",
        color: BLACK,
        bg: WHITE,
      });
    }

    if (errorText) {
      ctx.drawText(errorText, 8, HEIGHT / 2, {
        font: "menu",
        color: BLACK,
        bg: WHITE,
      });
    }

    if (countdown !== null && countdown > 0) {
      const label = String(countdown);
      ctx.fillRect(WIDTH / 2 - 14, HEIGHT / 2 - 12, 28, 24, WHITE);
      ctx.drawText(label, WIDTH / 2 - 4, HEIGHT / 2 - 8, {
        font: "menu",
        color: BLACK,
      });
    }

    // Bottom bar
    const barY = HEIGHT;
    ctx.fillRect(0, barY, ctx.width, 40, WHITE);
    ctx.drawHLine(0, barY, ctx.width, BLACK);

    const btnTop = barY + 8;
    const btnH = 24;

    const win = ctx.getWindow();
    if (win !== null) {
      const modeKey =
        viewingPhoto === null
          ? `list-${photos.length}`
          : `view-${viewingPhoto}-${photos.length}`;
      if (lastControlsKeyRef.current !== modeKey) {
        win.controlList.length = 0;
        lastControlsKeyRef.current = modeKey;
      }

      if (win.controlList.length === 0) {
        if (viewingPhoto === null) {
          const snapHandle = NewControl(
            win,
            makeRect(btnTop, WIDTH / 2 - 30, btnTop + btnH, WIDTH / 2 + 30),
            "Snap",
            true,
            0,
            0,
            1,
            0,
            0
          );
          snapHandle.ref.contrlAction = (_c, partCode) => {
            if (
              partCode === inButton &&
              countdown === null &&
              !loading &&
              !errorText
            ) {
              startCountdown(setCountdown, countdownRef, () => takePhoto());
            }
          };
          if (photos.length > 0) {
            const galleryHandle = NewControl(
              win,
              makeRect(btnTop, WIDTH - 64, btnTop + btnH, WIDTH - 8),
              `${photos.length} pic${photos.length > 1 ? "s" : ""}`,
              true,
              0,
              0,
              1,
              0,
              0
            );
            galleryHandle.ref.contrlAction = (_c, partCode) => {
              if (partCode === inButton) setViewingPhoto(photos.length - 1);
            };
          }
        } else {
          const deleteHandle = NewControl(
            win,
            makeRect(btnTop, 8, btnTop + 20, 72),
            "Delete",
            true,
            0,
            0,
            1,
            0,
            0
          );
          deleteHandle.ref.contrlAction = (_c, partCode) => {
            if (partCode === inButton) {
              const newPhotos = photos.filter((_, i) => i !== viewingPhoto);
              setPhotos(newPhotos);
              setViewingPhoto(
                newPhotos.length > 0
                  ? Math.min(viewingPhoto, newPhotos.length - 1)
                  : null
              );
            }
          };
          const saveHandle = NewControl(
            win,
            makeRect(btnTop, 72, btnTop + 20, 128),
            "Save",
            true,
            0,
            0,
            1,
            0,
            0
          );
          saveHandle.ref.contrlAction = (_c, partCode) => {
            if (partCode === inButton) savePhotoToFS(os, photos[viewingPhoto]);
          };
          let bx = 128;
          if (viewingPhoto > 0) {
            const prevHandle = NewControl(
              win,
              makeRect(btnTop, bx, btnTop + 20, bx + 32),
              "<",
              true,
              0,
              0,
              1,
              0,
              0
            );
            prevHandle.ref.contrlAction = (_c, partCode) => {
              if (partCode === inButton) setViewingPhoto(viewingPhoto - 1);
            };
            bx += 32;
          }
          if (viewingPhoto < photos.length - 1) {
            const nextHandle = NewControl(
              win,
              makeRect(btnTop, bx, btnTop + 20, bx + 32),
              ">",
              true,
              0,
              0,
              1,
              0,
              0
            );
            nextHandle.ref.contrlAction = (_c, partCode) => {
              if (partCode === inButton) setViewingPhoto(viewingPhoto + 1);
            };
            bx += 32;
          }
          const backHandle = NewControl(
            win,
            makeRect(btnTop, WIDTH - 52, btnTop + 20, WIDTH),
            "Back",
            true,
            0,
            0,
            1,
            0,
            0
          );
          backHandle.ref.contrlAction = (_c, partCode) => {
            if (partCode === inButton) setViewingPhoto(null);
          };
        }
      }

      // Update dynamic labels
      if (viewingPhoto === null && win.controlList.length > 0) {
        const isCountingDown = countdown !== null && countdown > 0;
        win.controlList[0].ref.contrlTitle = isCountingDown
          ? String(countdown!)
          : "Snap";
        win.controlList[0].ref.contrlHilite =
          isCountingDown || loading || !!errorText ? 255 : 0;
        if (photos.length > 0 && win.controlList[1]) {
          win.controlList[1].ref.contrlTitle = `${photos.length} pic${
            photos.length > 1 ? "s" : ""
          }`;
        }
      }

      DrawControls(win, ctx.port);
    }

    if (viewingPhoto !== null) {
      ctx.drawText(
        `${viewingPhoto + 1}/${photos.length}`,
        WIDTH / 2 - 12,
        barY + 12,
        { font: "body", color: BLACK }
      );
    }

    function takePhoto() {
      if (!ditherRef.current) return;

      const src = ditherRef.current.pixels;
      const snap = new ImageData(WIDTH, HEIGHT);
      const data = snap.data;
      for (let i = 0, len = WIDTH * HEIGHT; i < len; i++) {
        const v = src[i] ? 0 : 255;
        const off = i << 2;
        data[off] = v;
        data[off + 1] = v;
        data[off + 2] = v;
        data[off + 3] = 255;
      }

      setFlash(true);
      setTimeout(() => setFlash(false), 120);

      setPhotos((prev: Photo[]) => [
        ...prev,
        { imageData: snap, timestamp: Date.now() },
      ]);
    }
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any, size: WindowSize) {
    // Hook alignment: must match the useState/useRef calls in render
    app.useState(true); // loading
    app.useState(""); // errorText
    app.useState<number | null>(null); // countdown
    app.useState<number | null>(null); // viewingPhoto
    app.useState<any[]>([]); // photos
    app.useState(false); // flash
    app.useState<DitherMode>("atkinson"); // ditherMode
    app.useRef(null); // animRef
    app.useRef(null); // countdownRef
    app.useRef(null); // ditherRef
    app.useRef(""); // lastControlsKeyRef
  },

  getMenubar(app: AppBuilder, props: any): MenubarDefinition[] {
    // Align hooks with render
    app.useState(true); // loading
    app.useState(""); // errorText
    const [countdown] = app.useState<number | null>(null);
    app.useState<number | null>(null); // viewingPhoto
    app.useState<any[]>([]); // photos
    app.useState(false); // flash
    const [ditherMode, setDitherMode] = app.useState<DitherMode>("atkinson");
    app.useRef(null); // animRef
    app.useRef(null); // countdownRef
    app.useRef(null); // ditherRef
    app.useRef(""); // lastControlsKeyRef

    return [
      {
        label: "File",
        items: [
          {
            label: "Take Photo",
            shortcut: "T",
            disabled: countdown !== null,
            onSelect: () => {
              // Will be handled by the snap button logic
            },
          },
        ],
      },
      {
        label: "Dithering",
        items: [
          {
            type: "radiogroup",
            value: ditherMode,
            onValueChange: (v: string) => setDitherMode(v as DitherMode),
            items: [
              { label: "Atkinson", value: "atkinson" },
              { label: "Bayer", value: "bayer" },
            ],
          },
        ],
      },
    ];
  },
};

function startCountdown(
  setCountdown: (
    v: number | null | ((prev: number | null) => number | null)
  ) => void,
  countdownRef: { current: ReturnType<typeof setTimeout> | null },
  onDone: () => void
) {
  let remaining = COUNTDOWN_SECS;
  setCountdown(remaining);

  function tick() {
    remaining--;
    if (remaining <= 0) {
      setCountdown(null);
      onDone();
    } else {
      setCountdown(remaining);
      countdownRef.current = setTimeout(tick, 1000);
    }
  }

  countdownRef.current = setTimeout(tick, 1000);
}

async function savePhotoToFS(os: OSServices, photo: Photo) {
  if (!os.fs || !photo) return;

  const date = new Date(photo.timestamp);
  const name = `Photo ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

  const w = photo.imageData.width;
  const h = photo.imageData.height;
  const pixelCount = w * h;
  const packedLen = Math.ceil(pixelCount / 4);
  const packed = new Uint8Array(packedLen);

  const data = photo.imageData.data;
  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * 4];
    // 2bpp encoding: 00=transparent, 01=white, 10=black
    const bits = r < 128 ? 0b10 : 0b01;
    const byteIdx = Math.floor(i / 4);
    const shift = 6 - (i % 4) * 2;
    packed[byteIdx] |= bits << shift;
  }

  const b64 = btoa(String.fromCharCode(...packed));

  try {
    const desktopFolder = os.fs.resolvePath("/Mockintosh HD/Desktop Folder");
    if (desktopFolder) {
      await os.fs.writeImage(desktopFolder.id, name, {
        width: w,
        height: h,
        data: b64,
      });
    }
  } catch (e) {
    console.error("Failed to save photo:", e);
  }
}
