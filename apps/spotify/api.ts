import { encodeQR } from "@paulmillr/qr";

export const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? "";
export const REDIRECT_URI = `${
  typeof window !== "undefined"
    ? window.location.origin.replace("//localhost", "//[::1]").replace("//127.0.0.1", "//[::1]")
    : ""
}/callback.html`;
export const SCOPES =
  "streaming user-read-playback-state user-modify-playback-state user-read-email playlist-read-private";
const TOKEN_KEY = "mockintosh:spotify:tokens";
const API_BASE = "https://api.spotify.com/v1";

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  uri: string;
  images: Array<{ url: string }>;
}

export interface SpotifyTrack {
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
  duration_ms: number;
}

export interface PlayerState {
  track: SpotifyTrack | null;
  paused: boolean;
  position_ms: number;
  duration_ms: number;
}

export type DeviceFlowStatus = "loading" | "qr" | "expired" | "denied" | "error";

export interface DeviceFlowState {
  status: DeviceFlowStatus;
  pollId: string;
  verificationUri: string;
  userCode: string;
  interval: number;
  expiresAt: number;
  qrMatrix: boolean[][] | null;
}

export function generateCodeVerifier(): string {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function saveTokens(tokens: SpotifyTokens): void {
  try {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } catch {
    /* ignore quota */
  }
}

export function loadTokens(): SpotifyTokens | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as SpotifyTokens) : null;
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function exchangeCodeForTokens(
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

async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
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

export async function getValidToken(
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

async function authorized(
  path: string,
  tokensRef: { current: SpotifyTokens | null },
  onUpdate: (t: SpotifyTokens) => void,
  init?: RequestInit
): Promise<Response | null> {
  const token = await getValidToken(tokensRef, onUpdate);
  if (!token) return null;
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
}

export async function spotifyGet(
  path: string,
  tokensRef: { current: SpotifyTokens | null },
  onUpdate: (t: SpotifyTokens) => void
): Promise<unknown> {
  const resp = await authorized(path, tokensRef, onUpdate);
  if (!resp?.ok) return null;
  return resp.json();
}

export async function spotifyPut(
  path: string,
  body: unknown,
  tokensRef: { current: SpotifyTokens | null },
  onUpdate: (t: SpotifyTokens) => void
): Promise<boolean> {
  const resp = await authorized(path, tokensRef, onUpdate, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return !!resp && (resp.ok || resp.status === 204);
}

export async function spotifyPost(
  path: string,
  tokensRef: { current: SpotifyTokens | null },
  onUpdate: (t: SpotifyTokens) => void
): Promise<boolean> {
  const resp = await authorized(path, tokensRef, onUpdate, { method: "POST" });
  return !!resp && (resp.ok || resp.status === 204);
}

export async function fetchPlaylists(
  tokensRef: { current: SpotifyTokens | null },
  onUpdate: (t: SpotifyTokens) => void
): Promise<SpotifyPlaylist[]> {
  const data = (await spotifyGet("/me/playlists?limit=50", tokensRef, onUpdate)) as
    | { items?: Array<{ id: string; name: string; uri: string; images?: Array<{ url: string }> }> }
    | null;
  if (!data?.items) return [];
  return data.items.map((p) => ({
    id: p.id,
    name: p.name,
    uri: p.uri,
    images: p.images ?? [],
  }));
}

let sdkLoaded = false;
let sdkLoadPromise: Promise<void> | null = null;

export function loadSpotifySDK(): Promise<void> {
  if (sdkLoaded) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;
  sdkLoadPromise = new Promise<void>((resolve) => {
    (window as unknown as { onSpotifyWebPlaybackSDKReady: () => void }).onSpotifyWebPlaybackSDKReady =
      () => {
        sdkLoaded = true;
        resolve();
      };
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    document.head.appendChild(script);
  });
  return sdkLoadPromise;
}

export function buildQRMatrix(url: string): boolean[][] | null {
  try {
    const raw = encodeQR(url, "raw") as Record<number, boolean[]>;
    const size = Object.keys(raw).length;
    const matrix: boolean[][] = [];
    for (let r = 0; r < size; r++) matrix.push(Array.from(raw[r]));
    return matrix;
  } catch {
    return null;
  }
}

export async function ditherImageFromUrl(
  url: string,
  targetW: number,
  targetH: number
): Promise<Uint8Array | null> {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    const bmp = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(bmp, 0, 0, targetW, targetH);
    bmp.close();
    const imageData = ctx.getImageData(0, 0, targetW, targetH);
    const out = new Uint8Array(targetW * targetH);
    const lum = new Float32Array(targetW * targetH);
    const rgba = imageData.data;
    const len = targetW * targetH;
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
      lum[i + targetW - 1] += err;
      lum[i + targetW] += err;
      lum[i + targetW + 1] += err;
      lum[i + (targetW << 1)] += err;
    }
    return out;
  } catch {
    return null;
  }
}
