import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { OSEvent } from "../lib/toolbox/EventManager";
import { ResourceManager } from "../lib/toolbox/ResourceManager";
import { measureText, getLineHeight } from "../lib/canvas/fontAdapter";
import { encodeQR } from "@paulmillr/qr";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? "";
const REDIRECT_URI = `${
  typeof window !== "undefined"
    ? window.location.origin
        .replace("//localhost", "//[::1]")
        .replace("//127.0.0.1", "//[::1]")
    : ""
}/callback.html`;
const SCOPES =
  "streaming user-read-playback-state user-modify-playback-state user-read-email playlist-read-private";
const TOKEN_KEY = "mockintosh:spotify:tokens";
const API_BASE = "https://api.spotify.com/v1";

const SIDEBAR_W = 90;
const CONTROLS_H = 30;
const TRACK_INFO_H = 16;
const ART_PADDING = 4;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  uri: string;
  images: Array<{ url: string }>;
}

interface SpotifyTrack {
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
  duration_ms: number;
}

interface PlayerState {
  track: SpotifyTrack | null;
  paused: boolean;
  position_ms: number;
  duration_ms: number;
}

interface DitherState {
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
  pixels: Uint8Array;
  luminance: Float32Array;
}

// ---------------------------------------------------------------------------
// Device Flow (QR login) types
// ---------------------------------------------------------------------------

type DeviceFlowStatus = "loading" | "qr" | "expired" | "denied" | "error";

interface DeviceFlowState {
  status: DeviceFlowStatus;
  pollId: string;
  verificationUri: string;
  userCode: string;
  interval: number;
  expiresAt: number;
  /** Pre-computed boolean matrix from encodeQR */
  qrMatrix: boolean[][] | null;
}

// ---------------------------------------------------------------------------
// PKCE Auth helpers
// ---------------------------------------------------------------------------

function generateCodeVerifier(): string {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function saveTokens(tokens: SpotifyTokens): void {
  try {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } catch {}
}

function loadTokens(): SpotifyTokens | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SpotifyTokens;
  } catch {
    return null;
  }
}

function clearTokens(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<SpotifyTokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) throw new Error(`Token exchange failed: ${resp.status}`);
  const data = await resp.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

async function refreshAccessToken(
  refreshToken: string
): Promise<SpotifyTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  });

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) throw new Error(`Token refresh failed: ${resp.status}`);
  const data = await resp.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

// ---------------------------------------------------------------------------
// Spotify API helpers
// ---------------------------------------------------------------------------

async function getValidToken(
  tokensRef: { current: SpotifyTokens | null },
  onUpdate: (t: SpotifyTokens) => void
): Promise<string | null> {
  const tokens = tokensRef.current;
  if (!tokens) return null;

  if (Date.now() > tokens.expires_at - 60_000) {
    try {
      const refreshed = await refreshAccessToken(tokens.refresh_token);
      tokensRef.current = refreshed;
      saveTokens(refreshed);
      onUpdate(refreshed);
      return refreshed.access_token;
    } catch {
      tokensRef.current = null;
      clearTokens();
      return null;
    }
  }

  return tokens.access_token;
}

async function spotifyGet(
  path: string,
  tokensRef: { current: SpotifyTokens | null },
  onUpdate: (t: SpotifyTokens) => void
): Promise<any> {
  const token = await getValidToken(tokensRef, onUpdate);
  if (!token) return null;
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return null;
  return resp.json();
}

async function spotifyPut(
  path: string,
  body: any,
  tokensRef: { current: SpotifyTokens | null },
  onUpdate: (t: SpotifyTokens) => void
): Promise<boolean> {
  const token = await getValidToken(tokensRef, onUpdate);
  if (!token) return false;
  const resp = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return resp.ok || resp.status === 204;
}

async function spotifyPost(
  path: string,
  tokensRef: { current: SpotifyTokens | null },
  onUpdate: (t: SpotifyTokens) => void
): Promise<boolean> {
  const token = await getValidToken(tokensRef, onUpdate);
  if (!token) return false;
  const resp = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.ok || resp.status === 204;
}

async function fetchPlaylists(
  tokensRef: { current: SpotifyTokens | null },
  onUpdate: (t: SpotifyTokens) => void
): Promise<SpotifyPlaylist[]> {
  const data = await spotifyGet("/me/playlists?limit=50", tokensRef, onUpdate);
  if (!data?.items) return [];
  return data.items.map((p: any) => ({
    id: p.id,
    name: p.name,
    uri: p.uri,
    images: p.images ?? [],
  }));
}

// ---------------------------------------------------------------------------
// Web Playback SDK loader
// ---------------------------------------------------------------------------

let sdkLoaded = false;
let sdkLoadPromise: Promise<void> | null = null;

function loadSpotifySDK(): Promise<void> {
  if (sdkLoaded) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise<void>((resolve) => {
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      sdkLoaded = true;
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    document.head.appendChild(script);
  });
  return sdkLoadPromise;
}

// ---------------------------------------------------------------------------
// Atkinson dither (adapted from PhotoBooth)
// ---------------------------------------------------------------------------

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
    const bit = val < 129 ? 1 : 0;
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

function getOrCreateDitherState(
  ref: { current: DitherState | null },
  w: number,
  h: number
): DitherState {
  if (
    ref.current &&
    ref.current.canvas.width === w &&
    ref.current.canvas.height === h
  ) {
    return ref.current;
  }
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  ref.current = {
    canvas,
    ctx,
    pixels: new Uint8Array(w * h),
    luminance: new Float32Array(w * h),
  };
  return ref.current;
}

async function ditherImageFromUrl(
  url: string,
  targetW: number,
  targetH: number,
  ditherRef: { current: DitherState | null }
): Promise<Uint8Array | null> {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    const bmp = await createImageBitmap(blob);

    const state = getOrCreateDitherState(ditherRef, targetW, targetH);
    state.ctx.drawImage(bmp, 0, 0, targetW, targetH);
    bmp.close();

    const imageData = state.ctx.getImageData(0, 0, targetW, targetH);
    state.luminance.fill(0);
    atkinsonTo1bit(
      imageData.data,
      targetW,
      targetH,
      state.pixels,
      state.luminance
    );
    return state.pixels;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Shared mutable state (survives across renders, managed by refs)
// ---------------------------------------------------------------------------

let messageListener: ((e: MessageEvent) => void) | null = null;
let spotifyPlayer: any = null;
let deviceId: string | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

function truncateText(
  text: string,
  maxW: number,
  font: "menu" | "body"
): string {
  if (measureText(text, font) <= maxW) return text;
  let truncated = text;
  while (truncated.length > 0 && measureText(truncated + "...", font) > maxW) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "...";
}

// ---------------------------------------------------------------------------
// App definition
// ---------------------------------------------------------------------------

export const SpotifyPlayerApp: SystemApp = {
  id: "spotify",
  title: "Spotify Player",
  icon: "icon/spotify",
  defaultSize: { width: 380, height: 280 },
  scrollable: false,

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const sprites: ResourceManager = props._sprites;
    const scheduleRender = () => app.scheduleRender();

    // --- State hooks (order matters, must match onEvent) ---
    const [tokens, setTokens] = app.useState<SpotifyTokens | null>(
      loadTokens()
    );
    const [playlists, setPlaylists] = app.useState<SpotifyPlaylist[]>([]);
    const [selectedIdx, setSelectedIdx] = app.useState(-1);
    const [playerState, setPlayerState] = app.useState<PlayerState | null>(
      null
    );
    const [artPixels, setArtPixels] = app.useState<Uint8Array | null>(null);
    const [artUrl, setArtUrl] = app.useState<string>("");
    const [volume, setVolume] = app.useState(50);
    const [sdkReady, setSdkReady] = app.useState(false);
    const [sidebarScroll, setSidebarScroll] = app.useState(0);
    const [error, setError] = app.useState<string>("");
    const [deviceFlow, setDeviceFlow] = app.useState<DeviceFlowState | null>(
      null
    );

    const tokensRef = app.useRef<SpotifyTokens | null>(tokens);
    const codeVerifierRef = app.useRef<string>("");
    const ditherRef = app.useRef<DitherState | null>(null);
    const initRef = app.useRef(false);
    const artLoadingRef = app.useRef<string>("");
    const pollTimerRef = app.useRef<ReturnType<typeof setInterval> | null>(
      null
    );
    const deviceFlowRef = app.useRef<DeviceFlowState | null>(deviceFlow);

    tokensRef.current = tokens;

    const onTokenUpdate = (t: SpotifyTokens) => {
      setTokens(t);
      saveTokens(t);
    };

    // Keep deviceFlowRef in sync
    deviceFlowRef.current = deviceFlow;

    // --- Effects ---

    // Initialize SDK + fetch playlists on first authenticated render
    app.useEffect(() => {
      if (!tokens || initRef.current) return;
      initRef.current = true;

      (async () => {
        try {
          await loadSpotifySDK();
          setSdkReady(true);

          const Spotify = (window as any).Spotify;
          if (!Spotify?.Player) return;

          spotifyPlayer = new Spotify.Player({
            name: "Mockintosh Player",
            getOAuthToken: (cb: (t: string) => void) => {
              const t = tokensRef.current?.access_token;
              if (t) {
                cb(t);
              } else {
                getValidToken(tokensRef, onTokenUpdate).then((refreshed) => {
                  if (refreshed) cb(refreshed);
                });
              }
            },
            volume: volume / 100,
          });

          spotifyPlayer.addListener(
            "ready",
            ({ device_id }: { device_id: string }) => {
              deviceId = device_id;
              spotifyPut(
                "/me/player",
                { device_ids: [device_id], play: false },
                tokensRef,
                onTokenUpdate
              );
              scheduleRender();
            }
          );

          spotifyPlayer.addListener("player_state_changed", (state: any) => {
            if (!state) {
              setPlayerState(null);
              return;
            }
            const track = state.track_window?.current_track;
            setPlayerState({
              track: track
                ? {
                    name: track.name,
                    artists: track.artists,
                    album: track.album,
                    duration_ms: track.duration_ms,
                  }
                : null,
              paused: state.paused,
              position_ms: state.position,
              duration_ms: state.duration,
            });

            const newArtUrl = track?.album?.images?.[0]?.url ?? "";
            if (newArtUrl && newArtUrl !== artLoadingRef.current) {
              artLoadingRef.current = newArtUrl;
              setArtUrl(newArtUrl);
            }
          });

          spotifyPlayer.addListener(
            "initialization_error",
            ({ message }: { message: string }) => {
              setError(message);
            }
          );
          spotifyPlayer.addListener(
            "authentication_error",
            ({ message }: { message: string }) => {
              console.warn("Spotify auth error:", message);
              setError("Spotify Premium required for playback");
            }
          );

          await spotifyPlayer.connect();
        } catch (e: any) {
          setError(e.message ?? "SDK failed");
        }
      })();

      fetchPlaylists(tokensRef, onTokenUpdate).then((pls) => {
        if (pls.length > 0) setPlaylists(pls);
      });
    }, [tokens]);

    // Dither album art when URL changes
    app.useEffect(() => {
      if (!artUrl) return;
      const artSize = computeArtSize(ctx.width, ctx.height);
      ditherImageFromUrl(artUrl, artSize, artSize, ditherRef).then((px) => {
        if (px) setArtPixels(new Uint8Array(px));
      });
    }, [artUrl]);

    // Listen for OAuth callback postMessage
    app.useEffect(() => {
      if (messageListener) {
        window.removeEventListener("message", messageListener);
      }
      messageListener = async (e: MessageEvent) => {
        if (e.data?.type !== "spotify-callback") return;
        if (e.data.error) {
          setError(e.data.error);
          return;
        }
        if (!e.data.code || !codeVerifierRef.current) return;
        try {
          const newTokens = await exchangeCodeForTokens(
            e.data.code,
            codeVerifierRef.current
          );
          saveTokens(newTokens);
          setTokens(newTokens);
          setError("");
        } catch (err: any) {
          setError(err.message ?? "Auth failed");
        }
      };
      window.addEventListener("message", messageListener);
      return () => {
        if (messageListener) {
          window.removeEventListener("message", messageListener);
          messageListener = null;
        }
      };
    }, []);

    // --- Device flow polling ---
    app.useEffect(() => {
      if (!deviceFlow || deviceFlow.status !== "qr") return;

      // Clear any existing timer
      if (pollTimer !== null) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      pollTimerRef.current = null;

      const intervalMs = (deviceFlow.interval ?? 5) * 1000;

      pollTimer = setInterval(async () => {
        pollTimerRef.current = pollTimer;
        const current = deviceFlowRef.current;
        if (!current || current.status !== "qr") {
          if (pollTimer !== null) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
          return;
        }

        if (Date.now() > current.expiresAt) {
          if (pollTimer !== null) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
          setDeviceFlow({ ...current, status: "expired" });
          scheduleRender();
          return;
        }

        try {
          const resp = await fetch(
            `/api/spotify/device-poll?poll_id=${encodeURIComponent(
              current.pollId
            )}`
          );
          const data = await resp.json();

          if (data.status === "ready") {
            if (pollTimer !== null) {
              clearInterval(pollTimer);
              pollTimer = null;
            }
            setDeviceFlow(null);
            const newTokens: SpotifyTokens = {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_at: Date.now() + data.expires_in * 1000,
            };
            saveTokens(newTokens);
            setTokens(newTokens);
          } else if (data.status === "expired") {
            if (pollTimer !== null) {
              clearInterval(pollTimer);
              pollTimer = null;
            }
            setDeviceFlow({ ...current, status: "expired" });
          } else if (data.status === "denied") {
            if (pollTimer !== null) {
              clearInterval(pollTimer);
              pollTimer = null;
            }
            setDeviceFlow({ ...current, status: "denied" });
          }
          // "pending" → keep polling silently
        } catch {
          // Network error: keep polling, will time out naturally
        }
        scheduleRender();
      }, intervalMs);
      pollTimerRef.current = pollTimer;

      return () => {
        if (pollTimer !== null) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
        pollTimerRef.current = null;
      };
    }, [deviceFlow?.pollId, deviceFlow?.status]);

    // --- Render ---
    ctx.clear(WHITE);

    if (!CLIENT_ID) {
      ctx.drawText("VITE_SPOTIFY_CLIENT_ID not set.", 8, 20, {
        font: "body",
        color: BLACK,
      });
      ctx.drawText("Add it to .env.local and restart.", 8, 34, {
        font: "body",
        color: BLACK,
      });
      return;
    }

    if (!tokens) {
      renderLoginScreen(
        ctx,
        sprites,
        app,
        codeVerifierRef,
        setError,
        deviceFlow,
        setDeviceFlow,
        scheduleRender
      );
      if (error) {
        ctx.drawText(error, 8, ctx.height - 16, {
          font: "body",
          color: BLACK,
        });
      }
      return;
    }

    // --- Authenticated player UI ---
    renderSidebar(
      ctx,
      playlists,
      selectedIdx,
      sidebarScroll,
      tokensRef,
      onTokenUpdate,
      setSelectedIdx,
      scheduleRender
    );
    renderMainArea(
      ctx,
      playerState,
      artPixels,
      sprites,
      tokensRef,
      onTokenUpdate,
      volume,
      setVolume,
      scheduleRender
    );

    if (error) {
      ctx.drawText(error, SIDEBAR_W + 4, ctx.height - 4, {
        font: "body",
        color: BLACK,
      });
    }
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any, size: WindowSize) {
    // Hook alignment (same order as render)
    app.useState<SpotifyTokens | null>(loadTokens());
    app.useState<SpotifyPlaylist[]>([]);
    app.useState(-1);
    app.useState<PlayerState | null>(null);
    app.useState<Uint8Array | null>(null);
    app.useState<string>("");
    app.useState(50);
    app.useState(false);
    const [sidebarScroll, setSidebarScroll] = app.useState(0);
    app.useState<string>("");
    app.useState<DeviceFlowState | null>(null);

    // Ref alignment
    app.useRef<SpotifyTokens | null>(null);
    app.useRef<string>("");
    app.useRef<DitherState | null>(null);
    app.useRef(false);
    app.useRef<string>("");
    app.useRef<ReturnType<typeof setInterval> | null>(null);
    app.useRef<DeviceFlowState | null>(null);

    if (event.type === "scroll") {
      if (event.x !== undefined && event.x < SIDEBAR_W) {
        const delta = event.deltaY ?? 0;
        setSidebarScroll(Math.max(0, sidebarScroll + delta));
      }
    }
  },

  onClose(app: AppBuilder) {
    if (messageListener) {
      window.removeEventListener("message", messageListener);
      messageListener = null;
    }
    if (pollTimer !== null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (spotifyPlayer) {
      spotifyPlayer.disconnect();
      spotifyPlayer = null;
      deviceId = null;
    }
  },
};

// ---------------------------------------------------------------------------
// Render: Login screen
// ---------------------------------------------------------------------------

/** Render a QR code matrix at (x, y) with each module being `moduleSize` pixels. */
function renderQRCode(
  ctx: WindowContext,
  matrix: boolean[][],
  x: number,
  y: number,
  moduleSize: number
) {
  const size = matrix.length;
  // White quiet zone background
  ctx.fillRect(x, y, size * moduleSize, size * moduleSize, WHITE);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (matrix[row][col]) {
        ctx.fillRect(
          x + col * moduleSize,
          y + row * moduleSize,
          moduleSize,
          moduleSize,
          BLACK
        );
      }
    }
  }
}

function renderLoginScreen(
  ctx: WindowContext,
  sprites: ResourceManager,
  app: AppBuilder,
  codeVerifierRef: { current: string },
  setError: (e: string) => void,
  deviceFlow: DeviceFlowState | null,
  setDeviceFlow: (s: DeviceFlowState | null) => void,
  scheduleRender: () => void
) {
  ctx.fillRect(0, 0, ctx.width, ctx.height, BLACK);

  // --- QR / device flow active ---
  if (deviceFlow) {
    if (deviceFlow.status === "loading") {
      const msg = "Connecting to Spotify...";
      const tw = measureText(msg, "body");
      ctx.drawText(
        msg,
        Math.floor((ctx.width - tw) / 2),
        Math.floor(ctx.height / 2),
        { font: "body", color: WHITE }
      );
      return;
    }

    if (deviceFlow.status === "expired" || deviceFlow.status === "denied") {
      const msg =
        deviceFlow.status === "expired" ? "QR code expired." : "Access denied.";
      const tw = measureText(msg, "body");
      ctx.drawText(
        msg,
        Math.floor((ctx.width - tw) / 2),
        Math.floor(ctx.height / 2) - 20,
        { font: "body", color: WHITE }
      );
      const btnW = 80;
      const btnH = 18;
      const btnX = Math.floor((ctx.width - btnW) / 2);
      const btnY = Math.floor(ctx.height / 2);
      ctx.fillRect(btnX, btnY, btnW, btnH, WHITE);
      ctx.drawRect(btnX, btnY, btnW, btnH, BLACK);
      const label = "Try Again";
      const lw = measureText(label, "body");
      ctx.drawText(label, btnX + Math.floor((btnW - lw) / 2), btnY + 4, {
        font: "body",
        color: BLACK,
      });
      ctx.hitRegion(
        "spotify-qr-retry",
        { x: btnX, y: btnY, w: btnW, h: btnH },
        { onClick: () => setDeviceFlow(null) }
      );
      return;
    }

    // status === "qr"
    if (deviceFlow.qrMatrix) {
      const qrSize = deviceFlow.qrMatrix.length;
      // Pick the largest module size that fits with some padding
      const availW = ctx.width - 16;
      const availH = ctx.height - 50;
      const moduleSize = Math.max(
        1,
        Math.floor(Math.min(availW, availH) / qrSize)
      );
      const totalPx = qrSize * moduleSize;
      const qrX = Math.floor((ctx.width - totalPx) / 2);
      const qrY = Math.floor((ctx.height - totalPx) / 2) - 8;

      renderQRCode(ctx, deviceFlow.qrMatrix, qrX, qrY, moduleSize);
      ctx.drawRect(qrX - 1, qrY - 1, totalPx + 2, totalPx + 2, WHITE);

      // User code below the QR
      const code = deviceFlow.userCode;
      const cw = measureText(code, "menu");
      ctx.drawText(code, Math.floor((ctx.width - cw) / 2), qrY + totalPx + 4, {
        font: "menu",
        color: WHITE,
      });

      // "Scan with your phone" hint
      const hint = "Scan with your phone";
      const hw = measureText(hint, "body");
      ctx.drawText(hint, Math.floor((ctx.width - hw) / 2), qrY - 12, {
        font: "body",
        color: WHITE,
      });
    }

    // Cancel link at the bottom
    const cancelLabel = "Cancel";
    const clw = measureText(cancelLabel, "body");
    ctx.drawText(
      cancelLabel,
      Math.floor((ctx.width - clw) / 2),
      ctx.height - 14,
      {
        font: "body",
        color: WHITE,
      }
    );
    ctx.hitRegion(
      "spotify-qr-cancel",
      {
        x: Math.floor((ctx.width - clw) / 2) - 2,
        y: ctx.height - 16,
        w: clw + 4,
        h: 12,
      },
      { onClick: () => setDeviceFlow(null) }
    );
    return;
  }

  // --- Default login screen ---
  const centerX = Math.floor(ctx.width / 2);
  const centerY = Math.floor(ctx.height / 2) - 20;

  const label = "To continue, login to Spotify:";
  const tw = measureText(label, "body");
  ctx.drawText(label, centerX - Math.floor(tw / 2), centerY - 36, {
    font: "body",
    color: WHITE,
  });

  const logo = sprites?.get("icon/spotify");
  if (logo) {
    ctx.blitInverted(logo, centerX - Math.floor(logo.width / 2), centerY - 16);
  }

  // Primary: QR login button
  const btnW = 80;
  const btnH = 18;
  const btnX = centerX - Math.floor(btnW / 2);
  const btnY = centerY + 24;
  ctx.fillRect(btnX, btnY, btnW, btnH, WHITE);
  ctx.drawRect(btnX, btnY, btnW, btnH, BLACK);
  const qrLabel = "Log in with QR";
  const qrLabelW = measureText(qrLabel, "body");
  ctx.drawText(qrLabel, btnX + Math.floor((btnW - qrLabelW) / 2), btnY + 4, {
    font: "body",
    color: BLACK,
  });

  ctx.hitRegion(
    "spotify-qr-login",
    { x: btnX, y: btnY, w: btnW, h: btnH },
    {
      onClick: () => {
        if (!CLIENT_ID) {
          setError("No client ID configured");
          return;
        }
        setDeviceFlow({
          status: "loading",
          pollId: "",
          verificationUri: "",
          userCode: "",
          interval: 5,
          expiresAt: 0,
          qrMatrix: null,
        });
        scheduleRender();
        fetch("/api/spotify/device-request", { method: "POST" })
          .then((r) => r.json())
          .then((data) => {
            if (data.error) {
              setError(data.error);
              setDeviceFlow(null);
              scheduleRender();
              return;
            }
            const uri = data.verification_uri_complete ?? data.verification_uri;
            const matrix = buildQRMatrix(uri);
            setDeviceFlow({
              status: "qr",
              pollId: data.poll_id,
              verificationUri: uri,
              userCode: data.user_code,
              interval: data.interval ?? 5,
              expiresAt: Date.now() + (data.expires_in ?? 300) * 1000,
              qrMatrix: matrix,
            });
            scheduleRender();
          })
          .catch((e) => {
            setError(e.message ?? "Failed to start login");
            setDeviceFlow(null);
            scheduleRender();
          });
      },
    }
  );

  // Secondary: browser login link
  const browserLabel = "Log in via browser";
  const blw = measureText(browserLabel, "body");
  const browserY = btnY + btnH + 8;
  ctx.drawText(browserLabel, centerX - Math.floor(blw / 2), browserY, {
    font: "body",
    color: WHITE,
  });
  ctx.hitRegion(
    "spotify-browser-login",
    {
      x: centerX - Math.floor(blw / 2) - 2,
      y: browserY - 2,
      w: blw + 4,
      h: 12,
    },
    {
      onClick: () => {
        if (!CLIENT_ID) {
          setError("No client ID configured");
          return;
        }
        const verifier = generateCodeVerifier();
        codeVerifierRef.current = verifier;
        generateCodeChallenge(verifier).then((challenge) => {
          const params = new URLSearchParams({
            response_type: "code",
            client_id: CLIENT_ID,
            scope: SCOPES,
            redirect_uri: REDIRECT_URI,
            code_challenge_method: "S256",
            code_challenge: challenge,
          });
          window.open(
            `https://accounts.spotify.com/authorize?${params.toString()}`,
            "spotify-auth",
            "width=500,height=700"
          );
        });
      },
    }
  );
}

// ---------------------------------------------------------------------------
// QR matrix helpers
// ---------------------------------------------------------------------------

function buildQRMatrix(url: string): boolean[][] | null {
  try {
    const raw = encodeQR(url, "raw");
    const size = Object.keys(raw).length;
    const matrix: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      matrix.push(Array.from(raw[r]) as boolean[]);
    }
    return matrix;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Render: Sidebar
// ---------------------------------------------------------------------------

function renderSidebar(
  ctx: WindowContext,
  playlists: SpotifyPlaylist[],
  selectedIdx: number,
  sidebarScroll: number,
  tokensRef: { current: SpotifyTokens | null },
  onTokenUpdate: (t: SpotifyTokens) => void,
  setSelectedIdx: (i: number) => void,
  scheduleRender: () => void
) {
  ctx.fillRect(0, 0, SIDEBAR_W, ctx.height, WHITE);
  ctx.drawVLine(SIDEBAR_W - 1, 0, ctx.height, BLACK);

  const lineH = getLineHeight("body");
  const headerY = 2;
  ctx.drawText("PLAYLISTS", 4, headerY, { font: "body", color: BLACK });
  ctx.drawHLine(0, headerY + lineH + 1, SIDEBAR_W - 1, BLACK);

  const listTop = headerY + lineH + 2;
  ctx.pushClip(0, listTop, SIDEBAR_W - 1, ctx.height - listTop);

  for (let i = 0; i < playlists.length; i++) {
    const y = listTop + i * lineH - sidebarScroll;
    if (y + lineH < listTop || y > ctx.height) continue;

    const isSelected = i === selectedIdx;
    if (isSelected) {
      ctx.fillRect(0, y, SIDEBAR_W - 1, lineH, BLACK);
    }

    const name = truncateText(playlists[i].name, SIDEBAR_W - 8, "body");
    ctx.drawText(name, 4, y, {
      font: "body",
      color: isSelected ? WHITE : BLACK,
    });

    const playlistIdx = i;
    ctx.hitRegion(
      `playlist-${i}`,
      { x: 0, y, w: SIDEBAR_W - 1, h: lineH },
      {
        onClick: () => {
          setSelectedIdx(playlistIdx);
          if (deviceId) {
            spotifyPut(
              "/me/player/play",
              { context_uri: playlists[playlistIdx].uri },
              tokensRef,
              onTokenUpdate
            );
          }
          scheduleRender();
        },
      }
    );
  }

  ctx.popClip();
}

// ---------------------------------------------------------------------------
// Render: Main area (art + controls)
// ---------------------------------------------------------------------------

function computeArtSize(winW: number, winH: number): number {
  const available = Math.min(
    winW - SIDEBAR_W - ART_PADDING * 2,
    winH - CONTROLS_H - TRACK_INFO_H - ART_PADDING * 2
  );
  return Math.max(32, available);
}

function renderMainArea(
  ctx: WindowContext,
  playerState: PlayerState | null,
  artPixels: Uint8Array | null,
  sprites: ResourceManager,
  tokensRef: { current: SpotifyTokens | null },
  onTokenUpdate: (t: SpotifyTokens) => void,
  volume: number,
  setVolume: (v: number) => void,
  scheduleRender: () => void
) {
  const mainX = SIDEBAR_W;
  const mainW = ctx.width - SIDEBAR_W;

  // Album art
  const artSize = computeArtSize(ctx.width, ctx.height);
  const artX = mainX + Math.floor((mainW - artSize) / 2);
  const artY = ART_PADDING;

  if (artPixels && artPixels.length === artSize * artSize) {
    ctx.blit1bitPixels(artPixels, artSize, artSize, artX, artY);
  } else {
    ctx.fillPattern(artX, artY, artSize, artSize, "gray25");
  }
  ctx.drawRect(artX, artY, artSize, artSize, BLACK);

  // Track info
  const infoY = artY + artSize + 2;
  const trackName = playerState?.track?.name ?? "No track playing";
  const artistName =
    playerState?.track?.artists?.map((a) => a.name).join(", ") ?? "";
  const infoText = artistName ? `${trackName} - ${artistName}` : trackName;
  const truncInfo = truncateText(infoText, mainW - 8, "body");
  ctx.drawText(truncInfo, mainX + 4, infoY, { font: "body", color: BLACK });

  // Playback controls
  const controlsY = ctx.height - CONTROLS_H;
  ctx.drawHLine(mainX, controlsY, mainW, BLACK);

  const btnSize = 16;
  const btnGap = 6;
  const totalBtnsW = btnSize * 3 + btnGap * 2;
  const btnsX = mainX + Math.floor((mainW - totalBtnsW) / 2) - 30;
  const btnY = controlsY + Math.floor((CONTROLS_H - btnSize) / 2);

  // Prev
  const prevSprite = sprites?.get("spotify/prev");
  if (prevSprite) ctx.blit(prevSprite, btnsX, btnY + 2);
  ctx.hitRegion(
    "spotify-prev",
    { x: btnsX, y: btnY, w: btnSize, h: btnSize },
    {
      onClick: () => {
        spotifyPost("/me/player/previous", tokensRef, onTokenUpdate);
      },
    }
  );

  // Play/Pause
  const ppX = btnsX + btnSize + btnGap;
  const isPaused = playerState?.paused ?? true;
  const ppSprite = sprites?.get(isPaused ? "spotify/play" : "spotify/pause");
  if (ppSprite) ctx.blit(ppSprite, ppX, btnY);
  ctx.drawRect(ppX - 1, btnY - 1, btnSize + 2, btnSize + 2, BLACK);
  ctx.hitRegion(
    "spotify-playpause",
    { x: ppX, y: btnY, w: btnSize, h: btnSize },
    {
      onClick: () => {
        if (isPaused) {
          spotifyPut("/me/player/play", null, tokensRef, onTokenUpdate);
        } else {
          spotifyPut("/me/player/pause", null, tokensRef, onTokenUpdate);
        }
      },
    }
  );

  // Next
  const nextX = ppX + btnSize + btnGap;
  const nextSprite = sprites?.get("spotify/next");
  if (nextSprite) ctx.blit(nextSprite, nextX, btnY + 2);
  ctx.hitRegion(
    "spotify-next",
    { x: nextX, y: btnY, w: btnSize, h: btnSize },
    {
      onClick: () => {
        spotifyPost("/me/player/next", tokensRef, onTokenUpdate);
      },
    }
  );

  // Volume
  const volSprite = sprites?.get("spotify/volume");
  const volIconX = nextX + btnSize + btnGap + 12;
  if (volSprite) ctx.blit(volSprite, volIconX, btnY + 2);

  const sliderX = volIconX + 14;
  const sliderW = ctx.width - sliderX - 8;
  const sliderY = btnY + Math.floor(btnSize / 2);

  if (sliderW > 10) {
    ctx.drawHLine(sliderX, sliderY, sliderW, BLACK);
    ctx.drawHLine(sliderX, sliderY + 1, sliderW, BLACK);

    const knobX = sliderX + Math.floor((volume / 100) * (sliderW - 4));
    ctx.fillRect(knobX, sliderY - 3, 4, 8, WHITE);
    ctx.drawRect(knobX, sliderY - 3, 4, 8, BLACK);

    ctx.hitRegion(
      "spotify-volume",
      { x: sliderX, y: sliderY - 6, w: sliderW, h: 12 },
      {
        onMouseDown: (lx: number) => {
          const frac = Math.max(0, Math.min(1, (lx - sliderX) / sliderW));
          const newVol = Math.round(frac * 100);
          setVolume(newVol);
          if (spotifyPlayer) spotifyPlayer.setVolume(newVol / 100);
          spotifyPut(
            `/me/player/volume?volume_percent=${newVol}`,
            null,
            tokensRef,
            onTokenUpdate
          );
          scheduleRender();
        },
        onDrag: (absX: number) => {
          const frac = Math.max(0, Math.min(1, (absX - sliderX) / sliderW));
          const newVol = Math.round(frac * 100);
          setVolume(newVol);
          if (spotifyPlayer) spotifyPlayer.setVolume(newVol / 100);
          scheduleRender();
        },
      }
    );
  }
}
