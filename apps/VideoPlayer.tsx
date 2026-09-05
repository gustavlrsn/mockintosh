import { createSignal, onCleanup, onMount, type JSX } from "solid-js";
import { Button } from "@mockintosh/ui";
import { registerApp } from "../src/os/apps";
import { useWindow } from "../src/os/windowContext";

export function VideoPlayer(_props: Record<string, unknown>): JSX.Element {
  const win = useWindow();
  const [playing, setPlaying] = createSignal(false);
  let video: HTMLVideoElement | null = null;
  let frame: ImageData | null = null;
  let raf = 0;

  onMount(() => {
    video = document.createElement("video");
    video.src = "/1984.mp4";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
  });
  onCleanup(() => {
    cancelAnimationFrame(raf);
    video?.pause();
    video = null;
  });

  function tick(): void {
    if (!video || video.readyState < 2) {
      if (playing()) raf = requestAnimationFrame(tick);
      return;
    }
    const w = Math.min(win.width(), video.videoWidth || 160);
    const h = Math.min(win.height() - 20, video.videoHeight || 100);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(video, 0, 0, w, h);
    frame = ctx.getImageData(0, 0, w, h);
    if (playing()) raf = requestAnimationFrame(tick);
  }

  return (
    <box width={win.width()} height={win.height()} flexDirection="column" background={0}>
      <raster
        width={win.width()}
        height={win.height() - 20}
        onPaint={({ rect, setPixel }) => {
          if (!frame) return;
          const w = Math.min(frame.width, rect.width);
          const h = Math.min(frame.height, rect.height);
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const i = (y * frame.width + x) * 4;
              const lum = frame.data[i] * 0.3 + frame.data[i + 1] * 0.59 + frame.data[i + 2] * 0.11;
              setPixel(x, y, lum < 128 ? 1 : 0);
            }
          }
        }}
      />
      <box height={20} flexDirection="row" alignItems="center" padding={2} gap={4}>
        <Button
          label={playing() ? "||" : ">"}
          onClick={() => {
            const next = !playing();
            setPlaying(next);
            if (next) {
              void video?.play();
              raf = requestAnimationFrame(tick);
            } else {
              video?.pause();
            }
          }}
        />
        <text font="body">1984.mp4</text>
      </box>
    </box>
  );
}

registerApp({
  id: "video",
  requires: ["video"],
  title: "1984.mp4",
  icon: "icon/MacFlim",
  defaultSize: { width: 340, height: 260 },
  Component: VideoPlayer,
});
