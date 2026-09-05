import { createSignal, onMount, type JSX } from "solid-js";
import { Button } from "@mockintosh/ui";
import { registerApp } from "../src/os/apps";
import { useOS } from "../src/os/context";
import { useWindow } from "../src/os/windowContext";
import type { GrafPort } from "@mockintosh/quickdraw";

export function Picture(props: Record<string, unknown>): JSX.Element {
  const os = useOS();
  const win = useWindow();
  const src = (props.src as string) ?? "";
  const sprite = os.sprites.get(src);
  const [pixels, setPixels] = createSignal<Uint8Array | null>(null);
  const [pw, setPw] = createSignal(0);
  const [ph, setPh] = createSignal(0);

  onMount(() => {
    if (props.title) win.setTitle(String(props.title));
    const fileId = props.fileId as string | undefined;
    if (!fileId) return;
    void os.fs.readFile(fileId).then((raw) => {
      if (!raw) return;
      const img = new Image();
      img.onload = () => {
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
      };
      img.src = raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
    });
  });

  return (
    <box width={win.width()} height={win.height()} padding={4} flexDirection="column" gap={4} background={0}>
      <Button label="Print" onClick={() => {}} />
      {sprite ? (
        <image
          width={sprite.width}
          height={sprite.height}
          src={{ width: sprite.width, height: sprite.height, data: sprite.data, mask: sprite.mask }}
        />
      ) : (
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
      )}
    </box>
  );
}

registerApp({
  id: "picture",
  title: "Picture",
  icon: "icon/MacFlim",
  defaultSize: { width: 256, height: 256 },
  scrollable: true,
  Component: Picture,
});
