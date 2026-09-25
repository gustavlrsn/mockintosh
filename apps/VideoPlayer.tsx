import { createEffect, createSignal, onCleanup, onSettled } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { Button } from "@mockintosh/ui";
import { createDitherer, defineApp, useApp, type VideoSource } from "@mockintosh/sdk";

function VideoPlayer(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;
  createEffect(() => true, () => {
    app.setMenus([
      { label: "File", items: [{ label: "Quit", shortcut: "Q", onClick: () => app.quit() }] },
    ]);
  });
  const [playing, setPlaying] = createSignal(false);
  const [frame, setFrame] = createSignal(0);
  let source: VideoSource | null = null;
  let bits: Uint8Array | null = null;
  let dither: ((src: { width: number; height: number; rgba: Uint8ClampedArray }, out: Uint8Array) => void) | null = null;
  let bw = 0;
  let bh = 0;
  let cancelFrame: (() => void) | null = null;

  function stopTick(): void {
    cancelFrame?.();
    cancelFrame = null;
  }

  function tick(): void {
    const f = source?.frame() ?? null;
    if (f) {
      if (!bits || !dither || bw !== f.width || bh !== f.height) {
        bw = f.width;
        bh = f.height;
        bits = new Uint8Array(bw * bh);
        dither = createDitherer(bw, bh, "threshold");
      }
      dither(f, bits);
      setFrame((n) => n + 1);
    }
    if (playing()) cancelFrame = app.scheduler.requestFrame(tick);
  }

  onSettled(() => {
    void app.video!.open("/1984.mp4", { loop: true, muted: true }).then((opened) => {
      source = opened;
    });
  });
  onCleanup(() => {
    stopTick();
    source?.close();
    source = null;
  });

  return (
    <box width={win.width()} height={win.height()} flexDirection="column" background={0}>
      <raster
        width={win.width()}
        height={win.height() - 20}
        revision={frame()}
        onPaint={({ blitPixels }) => {
          if (bits) blitPixels(bits, bw, bh);
        }}
      />
      <box height={20} flexDirection="row" alignItems="center" padding={2} gap={4}>
        <Button
          label={playing() ? "||" : ">"}
          onClick={() => {
            const next = !playing();
            setPlaying(next);
            if (next) {
              void source?.play();
              stopTick();
              cancelFrame = app.scheduler.requestFrame(tick);
            } else {
              source?.pause();
              stopTick();
            }
          }}
        />
        <text font="body">1984.mp4</text>
      </box>
    </box>
  );
}

export default defineApp({
  id: "video",
  requires: ["video"],
  title: "1984.mp4",
  icon: "icon/MacFlim",
  defaultSize: { width: 340, height: 260 },
  Component: VideoPlayer,
});
