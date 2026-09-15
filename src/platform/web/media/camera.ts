import type { CameraService, CameraSource, ImageFrame } from "@mockintosh/sdk";

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

export function createWebCameraService(): CameraService | undefined {
  if (!navigator.mediaDevices?.getUserMedia) return undefined;
  return {
    async open(options) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: options?.facing ?? "user",
          ...(options?.width ? { width: options.width } : {}),
          ...(options?.height ? { height: options.height } : {}),
        },
        audio: false,
      });
      const video = document.createElement("video");
      video.playsInline = true;
      video.muted = true;
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        stream.getTracks().forEach((t) => t.stop());
        throw new Error("Could not open camera");
      }
      const source: CameraSource = {
        frame: () => grabFrame(video, canvas, ctx),
        get width() { return video.videoWidth; },
        get height() { return video.videoHeight; },
        close() {
          stream.getTracks().forEach((t) => t.stop());
          video.srcObject = null;
        },
      };
      return source;
    },
  };
}
