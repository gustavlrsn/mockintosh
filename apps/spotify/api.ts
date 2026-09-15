import { encodeQR, toBits, type AppCrypto, type BrowserService, type FetchFunction, type FetchRequest, type FetchResponse, type ImageService } from "@mockintosh/sdk";

export function spotifyRedirectUri(origin: string): string {
  return `${origin.replace("//localhost", "//[::1]").replace("//127.0.0.1", "//[::1]")}/callback.html`;
}

function formBody(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

function base64url(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += alphabet[(n >> 18) & 63] + alphabet[(n >> 12) & 63];
    if (i + 1 < bytes.length) out += alphabet[(n >> 6) & 63];
    if (i + 2 < bytes.length) out += alphabet[n & 63];
  }
  return out;
}
export const SCOPES =
  "streaming user-read-playback-state user-modify-playback-state user-read-email playlist-read-private";
const API_BASE = "https://api.spotify.com/v1";

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/**
 * The signed-in state shared by every API call. The owner (the player
 * component) holds the current tokens and is told whenever they change —
 * refreshed on expiry, or revoked (`null`) when a refresh fails — so it can
 * persist them and update its UI. The API layer itself never stores anything.
 */
export interface SpotifySession {
  tokens: SpotifyTokens | null;
  onChange(tokens: SpotifyTokens | null): void;
  /** Network access from `useApp().fetch`; the API layer never reaches for a global. */
  fetch: FetchFunction;
  clientId: string;
  redirectUri: string;
  crypto: AppCrypto;
  images?: ImageService;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
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

export function generateCodeVerifier(crypto: AppCrypto): string {
  return base64url(crypto.randomBytes(64));
}

export async function generateCodeChallenge(verifier: string, crypto: AppCrypto): Promise<string> {
  return base64url(await crypto.sha256(new TextEncoder().encode(verifier)));
}

export function isSpotifyTokens(v: unknown): v is SpotifyTokens {
  const t = v as Partial<SpotifyTokens> | null;
  return (
    !!t &&
    typeof t.access_token === "string" &&
    typeof t.refresh_token === "string" &&
    typeof t.expires_at === "number"
  );
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  session: SpotifySession
): Promise<SpotifyTokens> {
  const body = formBody({
    grant_type: "authorization_code",
    code,
    redirect_uri: session.redirectUri,
    client_id: session.clientId,
    code_verifier: codeVerifier,
  });
  const resp = await session.fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!resp.ok) throw new Error(`Token exchange failed: ${resp.status}`);
  const data = (await resp.json()) as TokenResponse;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? "",
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

async function refreshAccessToken(refreshToken: string, session: SpotifySession): Promise<SpotifyTokens> {
  const body = formBody({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: session.clientId,
  });
  const resp = await session.fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!resp.ok) throw new Error(`Token refresh failed: ${resp.status}`);
  const data = (await resp.json()) as TokenResponse;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

export async function getValidToken(session: SpotifySession): Promise<string | null> {
  const tokens = session.tokens;
  if (!tokens) return null;
  if (Date.now() > tokens.expires_at - 60_000) {
    try {
      const refreshed = await refreshAccessToken(tokens.refresh_token, session);
      session.tokens = refreshed;
      session.onChange(refreshed);
      return refreshed.access_token;
    } catch {
      session.tokens = null;
      session.onChange(null);
      return null;
    }
  }
  return tokens.access_token;
}

async function authorized(
  path: string,
  session: SpotifySession,
  init?: FetchRequest
): Promise<FetchResponse | null> {
  const token = await getValidToken(session);
  if (!token) return null;
  return session.fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
}

export async function spotifyGet(path: string, session: SpotifySession): Promise<unknown> {
  const resp = await authorized(path, session);
  if (!resp?.ok) return null;
  return resp.json();
}

export async function spotifyPut(
  path: string,
  body: unknown,
  session: SpotifySession
): Promise<boolean> {
  const resp = await authorized(path, session, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return !!resp && (resp.ok || resp.status === 204);
}

export async function spotifyPost(path: string, session: SpotifySession): Promise<boolean> {
  const resp = await authorized(path, session, { method: "POST" });
  return !!resp && (resp.ok || resp.status === 204);
}

export async function fetchPlaylists(session: SpotifySession): Promise<SpotifyPlaylist[]> {
  const data = (await spotifyGet("/me/playlists?limit=50", session)) as
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

export async function loadSpotifySDK(browser: BrowserService): Promise<{ Player: new (opts: unknown) => unknown } | undefined> {
  const Spotify = await browser.loadScript("https://sdk.scdn.co/spotify-player.js", "Spotify");
  return Spotify as { Player: new (opts: unknown) => unknown } | undefined;
}

export function buildQRMatrix(url: string): boolean[][] | null {
  try {
    const sprite = encodeQR(url);
    const matrix: boolean[][] = [];
    for (let y = 0; y < sprite.height; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < sprite.width; x++) row.push(sprite.data[y * sprite.width + x] !== 0);
      matrix.push(row);
    }
    return matrix;
  } catch {
    return null;
  }
}

export async function ditherImageFromUrl(
  url: string,
  targetW: number,
  targetH: number,
  session: SpotifySession
): Promise<Uint8Array | null> {
  try {
    if (!session.images) return null;
    const resp = await session.fetch(url);
    const bytes = new Uint8Array(await resp.arrayBuffer());
    const frame = await session.images.decode(bytes, undefined, { maxWidth: targetW, maxHeight: targetH });
    return toBits(frame, "atkinson");
  } catch {
    return null;
  }
}
