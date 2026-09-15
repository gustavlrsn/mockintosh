import type { ImageFrame, VideoService, VideoSource } from "@mockintosh/sdk";

function grabFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): ImageFrame | null {
  if (video.readyState < 2 || video.videoWidth <= 0) return null;
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  ctx.drawImage(video, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { width: canvas.width, height: canvas.height, rgba: data.data };
}

export function createWebVideoService(): VideoService {
  return {
    async open(url, options) {
      const video = document.createElement("video");
      video.src = url;
      video.muted = options?.muted ?? true;
      video.loop = options?.loop ?? false;
      video.playsInline = true;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Could not open video");
      const source: VideoSource = {
        play: () => video.play(),
        pause: () => video.pause(),
        frame: () => grabFrame(video, canvas, ctx),
        get width() { return video.videoWidth; },
        get height() { return video.videoHeight; },
        close() {
          video.pause();
          video.removeAttribute("src");
          video.load();
        },
      };
      return source;
    },
  };
}
