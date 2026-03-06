import { MockFS } from "./fs/MockFS";

/**
 * OS-level services exposed to apps.
 */
export interface OSServices {
  openWindow(appId: string, props?: any): void;
  closeWindow(windowId: string): void;
  showDialog(options: DialogOptions): Promise<string | null>;
  clipboard: {
    read(): string;
    write(text: string): void;
  };
  camera: {
    requestAccess(): Promise<boolean>;
    getFrame(): ImageData | null;
    getVideoElement(): HTMLVideoElement | null;
    release(): void;
  };
  audio: {
    play(src: string): void;
  };
  storage: {
    read(key: string): Promise<string | null>;
    write(key: string, value: string): Promise<void>;
    list(): Promise<string[]>;
  };
  fs: MockFS | null;
}

export interface DialogOptions {
  message: string;
  buttons?: string[];
  showInput?: boolean;
  inputDefault?: string;
}

/**
 * Creates a concrete OSServices implementation. This is initialized
 * during the OS boot and passed to apps that need it.
 */
export function createOSServices(dependencies: {
  openWindow: (appId: string, props?: any) => void;
  closeWindow: (windowId: string) => void;
  showDialog: (options: DialogOptions) => Promise<string | null>;
  videoElement?: HTMLVideoElement;
  ditherWorker?: Worker;
}): OSServices {
  let clipboardData = "";
  let cameraStream: MediaStream | null = null;
  let cameraCanvas: OffscreenCanvas | null = null;
  let cameraCtx: OffscreenCanvasRenderingContext2D | null = null;

  return {
    openWindow: dependencies.openWindow,
    closeWindow: dependencies.closeWindow,
    showDialog: dependencies.showDialog,
    fs: null,

    clipboard: {
      read() {
        return clipboardData;
      },
      write(text: string) {
        clipboardData = text;
      },
    },

    camera: {
      async requestAccess(): Promise<boolean> {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (dependencies.videoElement) {
            dependencies.videoElement.srcObject = cameraStream;
            await dependencies.videoElement.play();
          }
          return true;
        } catch {
          return false;
        }
      },

      getFrame(): ImageData | null {
        const video = dependencies.videoElement;
        if (!video || !cameraStream) return null;

        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return null;

        if (
          !cameraCanvas ||
          cameraCanvas.width !== w ||
          cameraCanvas.height !== h
        ) {
          cameraCanvas = new OffscreenCanvas(w, h);
          cameraCtx = cameraCanvas.getContext(
            "2d"
          ) as OffscreenCanvasRenderingContext2D;
        }

        cameraCtx!.drawImage(video, 0, 0);
        return cameraCtx!.getImageData(0, 0, w, h);
      },

      getVideoElement(): HTMLVideoElement | null {
        if (!cameraStream || !dependencies.videoElement) return null;
        return dependencies.videoElement;
      },

      release() {
        if (cameraStream) {
          cameraStream.getTracks().forEach((t) => t.stop());
          cameraStream = null;
        }
        if (dependencies.videoElement) {
          dependencies.videoElement.srcObject = null;
        }
      },
    },

    audio: {
      play(src: string) {
        const audio = new Audio(src);
        audio.play().catch(() => {});
      },
    },

    storage: {
      async read(key: string): Promise<string | null> {
        try {
          const root = await navigator.storage.getDirectory();
          const file = await root.getFileHandle(key);
          const blob = await file.getFile();
          return await blob.text();
        } catch {
          return null;
        }
      },

      async write(key: string, value: string): Promise<void> {
        try {
          const root = await navigator.storage.getDirectory();
          const file = await root.getFileHandle(key, { create: true });
          const writable = await (file as any).createWritable();
          await writable.write(value);
          await writable.close();
        } catch (e) {
          console.error("storage write error:", e);
        }
      },

      async list(): Promise<string[]> {
        try {
          const root = await navigator.storage.getDirectory();
          const names: string[] = [];
          for await (const [name] of (root as any).entries()) {
            names.push(name);
          }
          return names;
        } catch {
          return [];
        }
      },
    },
  };
}
