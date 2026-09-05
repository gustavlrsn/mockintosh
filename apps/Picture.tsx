import { createSignal, onMount, Show, type JSX } from "solid-js";
import { Button } from "@mockintosh/ui";
import { MIME } from "@mockintosh/fs";
import { registerApp } from "../src/os/apps";
import { useOS } from "../src/os/context";
import { useWindow } from "../src/os/windowContext";
import { loadSpriteFile } from "../src/os/spriteFiles";
import type { Sprite } from "../lib/canvas/BitCanvas";
import type { GrafPort } from "@mockintosh/quickdraw";

const BROWSER_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

/**
 * Picture — views image files. Mockintosh sprite files draw directly; browser
 * image formats are decoded off-screen and thresholded to 1-bit.
 */
export function Picture(props: Record<string, unknown>): JSX.Element {
  const os = useOS();
  const win = useWindow();
  const [sprite, setSprite] = createSignal<Sprite | undefined>(
    props.src ? os.sprites.get(String(props.src)) : undefined
  );
  const [pixels, setPixels] = createSignal<Uint8Array | null>(null);
  const [pw, setPw] = createSignal(0);
  const [ph, setPh] = createSignal(0);

  function thresholdImage(img: HTMLImageElement): void {
    const w = Math.min(img.width, win.width() - 8);
    const h = Math.min(img.height, win.height() - 28);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const out = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const lum = data[i * 4] * 0.3 + data[i * 4 + 1] * 0.59 + data[i * 4 + 2] * 0.11;
      out[i] = lum < 128 ? 1 : 0;
    }
    setPw(w);
    setPh(h);
    setPixels(out);
  }

  onMount(async () => {
    if (props.title) win.setTitle(String(props.title));
    const fileId = props.fileId as string | undefined;
    if (!fileId) return;
    const file = os.fs.file(fileId);
    if (!file) return;

    if (file.type === MIME.sprite) {
      const s = await loadSpriteFile(os.fs, os.sprites, fileId);
      if (s) setSprite(s);
      return;
    }
    const bytes = await os.fs.readBytes(fileId);
    if (!bytes) return;
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: file.type }));
    const img = new Image();
    img.onload = () => {
      thresholdImage(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  });

  return (
    <box width={win.width()} height={win.height()} padding={4} flexDirection="column" gap={4} background={0}>
      <Button label="Print" onClick={() => {}} />
      <Show when={sprite()} fallback={
        <raster
          width={win.width() - 8}
          height={win.height() - 28}
          onPaint={(portUnknown, rect) => {
            const px = pixels();
            if (!px) return;
            const port = portUnknown as GrafPort;
            const { baseAddr, rowBytes, bounds } = port.portBits;
            const w = Math.min(pw(), rect.width);
            const h = Math.min(ph(), rect.height);
            for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                const gx = rect.x + x;
                const gy = rect.y + y;
                baseAddr[(gy - bounds.top) * rowBytes + (gx - bounds.left)] = px[y * pw() + x];
              }
            }
          }}
        />
      }>
        {(s) => (
          <image
            width={s().width}
            height={s().height}
            src={{ width: s().width, height: s().height, data: s().data, mask: s().mask }}
          />
        )}
      </Show>
    </box>
  );
}

registerApp({
  id: "picture",
  title: "Picture",
  icon: "icon/MacFlim",
  defaultSize: { width: 256, height: 256 },
  scrollable: true,
  fileTypes: [MIME.sprite, ...BROWSER_IMAGE_TYPES],
  Component: Picture,
});
