import type { BrowserService } from "@mockintosh/sdk";

const AUTHORIZE_CHANNEL = "mockintosh-authorize";

export function createWebBrowserService(): BrowserService {
  return {
    async openExternal(url) {
      window.open(url, "_blank", "noopener");
    },
    authorize(url, options) {
      return new Promise((resolve, reject) => {
        const channel = new BroadcastChannel(AUTHORIZE_CHANNEL);
        const popup = window.open(url, "mockintosh-authorize", "width=500,height=700");
        const finish = (data: { code?: string; error?: string }) => {
          window.removeEventListener("message", onMessage);
          channel.close();
          popup?.close();
          if (data.error) reject(new Error(String(data.error)));
          else resolve(data.code ? { code: data.code } : {});
        };
        const onMessage = (event: MessageEvent) => {
          if (options?.redirectOrigin && event.origin !== options.redirectOrigin) return;
          const data = event.data as { type?: string; code?: string; error?: string } | null;
          if (!data || (data.type !== "spotify-callback" && data.code === undefined && data.error === undefined)) return;
          finish(data);
        };
        channel.onmessage = (event) => {
          const data = event.data as { type?: string; code?: string; error?: string } | null;
          if (!data || (data.type !== "spotify-callback" && data.code === undefined && data.error === undefined)) return;
          finish(data);
        };
        window.addEventListener("message", onMessage);
      });
    },
    loadScript(url, globalName) {
      const host = window as unknown as Record<string, unknown>;
      if (host[globalName]) return Promise.resolve(host[globalName]);
      return new Promise((resolve, reject) => {
        if (globalName === "Spotify") {
          host.onSpotifyWebPlaybackSDKReady = () => resolve(host[globalName]);
        }
        const script = document.createElement("script");
        script.src = url;
        script.onload = () => {
          if (host[globalName]) resolve(host[globalName]);
          else if (globalName !== "Spotify") reject(new Error(`Global ${globalName} was not defined`));
        };
        script.onerror = () => reject(new Error(`Failed to load ${url}`));
        document.head.appendChild(script);
      });
    },
  };
}
