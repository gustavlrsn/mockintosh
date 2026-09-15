import { For, Show, createEffect, createSignal, onCleanup, onMount, type JSX } from "solid-js";
import { Button, type Ink } from "@mockintosh/ui";
import { useApp, defineApp } from "@mockintosh/sdk";
import {
  SCOPES,
  type DeviceFlowState,
  type PlayerState,
  type SpotifyPlaylist,
  type SpotifySession,
  type SpotifyTokens,
  buildQRMatrix,
  ditherImageFromUrl,
  exchangeCodeForTokens,
  fetchPlaylists,
  generateCodeChallenge,
  generateCodeVerifier,
  isSpotifyTokens,
  loadSpotifySDK,
  spotifyPost,
  spotifyPut,
  spotifyRedirectUri,
} from "./spotify/api";
import { spotifySprites } from "./sprites/spotify";

const SIDEBAR_W = 90;

/** Key in the app's storage folder (System Folder/Preferences/spotify/). */
const TOKENS_KEY = "tokens.json";

/** `/api/spotify/device-request` — starts the device-code login flow. */
interface DeviceRequestResponse {
  error?: string;
  poll_id: string;
  verification_uri: string;
  verification_uri_complete?: string;
  user_code: string;
  interval?: number;
  expires_in?: number;
}

/** `/api/spotify/device-poll` — the flow's current state. */
interface DevicePollResponse {
  status: "pending" | "ready" | "expired" | "denied";
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

function SpotifyPlayer(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;
  const { storage } = app;
  const CLIENT_ID = app.env.config.SPOTIFY_CLIENT_ID ?? "";
  const REDIRECT_URI = spotifyRedirectUri(app.env.origin);
  const [tokens, setTokens] = createSignal<SpotifyTokens | null>(null);
  const [playlists, setPlaylists] = createSignal<SpotifyPlaylist[]>([]);
  const [selected, setSelected] = createSignal(-1);
  const [player, setPlayer] = createSignal<PlayerState | null>(null);
  const [art, setArt] = createSignal<Uint8Array | null>(null);
  const [artSize, setArtSize] = createSignal(64);
  const [volume, setVolume] = createSignal(50);
  const [error, setError] = createSignal("");
  const [deviceFlow, setDeviceFlow] = createSignal<DeviceFlowState | null>(null);
  const [sidebarScroll, setSidebarScroll] = createSignal(0);

  // The API layer reads `session.tokens` and reports refreshes/revocations
  // through `onChange`; we own persistence.
  const session: SpotifySession = {
    tokens: null,
    fetch: app.fetch!, // present: the app requires "network"
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    crypto: app.crypto,
    images: app.images,
    onChange(next) {
      setTokens(next);
      void (next ? storage.write(TOKENS_KEY, JSON.stringify(next)) : storage.remove(TOKENS_KEY));
    },
  };

  onMount(async () => {
    const raw = await storage.read(TOKENS_KEY);
    if (raw === null) return;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isSpotifyTokens(parsed)) setTokens(parsed);
    } catch {
      await storage.remove(TOKENS_KEY);
    }
  });

  let codeVerifier = "";
  let deviceId: string | null = null;
  let sdkPlayer: { connect: () => Promise<void>; disconnect: () => void; setVolume: (v: number) => void; addListener: Function } | null = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  createEffect(() => {
    session.tokens = tokens();
  });

  createEffect(() => {
    const t = tokens();
    if (!t) return;
    void (async () => {
      try {
        const Spotify = await loadSpotifySDK(app.browser!);
        if (!Spotify?.Player) return;
        sdkPlayer = new Spotify.Player({
          name: "Mockintosh Player",
          getOAuthToken: (cb: (token: string) => void) => {
            const tok = session.tokens?.access_token;
            if (tok) cb(tok);
          },
          volume: volume() / 100,
        }) as NonNullable<typeof sdkPlayer>;
        sdkPlayer.addListener("ready", ({ device_id }: { device_id: string }) => {
          deviceId = device_id;
          void spotifyPut("/me/player", { device_ids: [device_id], play: false }, session);
        });
        sdkPlayer.addListener("player_state_changed", (state: {
          paused: boolean;
          position: number;
          duration: number;
          track_window?: { current_track?: { name: string; artists: Array<{ name: string }>; album: { name: string; images: Array<{ url: string }> }; duration_ms: number } };
        } | null) => {
          if (!state) {
            setPlayer(null);
            return;
          }
          const track = state.track_window?.current_track;
          setPlayer({
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
          const url = track?.album?.images?.[0]?.url;
          if (url) {
            const size = Math.max(32, Math.min(win.width() - SIDEBAR_W - 16, win.height() - 60));
            setArtSize(size);
            void ditherImageFromUrl(url, size, size, session).then((px) => {
              if (px) setArt(px);
            });
          }
        });
        await sdkPlayer.connect();
      } catch (e) {
        setError(e instanceof Error ? e.message : "SDK failed");
      }
    })();
    void fetchPlaylists(session).then((pls) => {
      if (pls.length) setPlaylists(pls);
    });
  });

  // OAuth return is handled in startBrowser via `browser.authorize`.

  createEffect(() => {
    const flow = deviceFlow();
    if (!flow || flow.status !== "qr") return;
    const intervalMs = (flow.interval || 5) * 1000;
    pollTimer = setInterval(async () => {
      const current = deviceFlow();
      if (!current || current.status !== "qr") return;
      if (Date.now() > current.expiresAt) {
        setDeviceFlow({ ...current, status: "expired" });
        return;
      }
      try {
        const resp = await session.fetch(`/api/spotify/device-poll?poll_id=${encodeURIComponent(current.pollId)}`);
        const data = (await resp.json()) as DevicePollResponse;
        if (data.status === "ready") {
          session.onChange({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + data.expires_in * 1000,
          });
          setDeviceFlow(null);
        } else if (data.status === "expired" || data.status === "denied") {
          setDeviceFlow({ ...current, status: data.status });
        }
      } catch {
        /* keep polling */
      }
    }, intervalMs);
    onCleanup(() => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    });
  });

  onCleanup(() => {
    if (pollTimer) clearInterval(pollTimer);
    sdkPlayer?.disconnect();
  });

  function startQr(): void {
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
    void session.fetch("/api/spotify/device-request", { method: "POST" })
      .then((r) => r.json() as Promise<DeviceRequestResponse>)
      .then((data) => {
        if (data.error) {
          setError(String(data.error));
          setDeviceFlow(null);
          return;
        }
        const uri = data.verification_uri_complete ?? data.verification_uri;
        setDeviceFlow({
          status: "qr",
          pollId: data.poll_id,
          verificationUri: uri,
          userCode: data.user_code,
          interval: data.interval ?? 5,
          expiresAt: Date.now() + (data.expires_in ?? 300) * 1000,
          qrMatrix: buildQRMatrix(uri),
        });
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to start login");
        setDeviceFlow(null);
      });
  }

  function startBrowser(): void {
    if (!CLIENT_ID) {
      setError("No client ID configured");
      return;
    }
    const verifier = generateCodeVerifier(app.crypto);
    codeVerifier = verifier;
    void generateCodeChallenge(verifier, app.crypto).then(async (challenge) => {
      const params = [
        ["response_type", "code"],
        ["client_id", CLIENT_ID],
        ["scope", SCOPES],
        ["redirect_uri", REDIRECT_URI],
        ["code_challenge_method", "S256"],
        ["code_challenge", challenge],
      ].map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
      try {
        const result = await app.browser!.authorize(`https://accounts.spotify.com/authorize?${params}`, {
          redirectOrigin: app.env.origin,
        });
        if (!result.code || !codeVerifier) return;
        const next = await exchangeCodeForTokens(result.code, codeVerifier, session);
        session.onChange(next);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Auth failed");
      }
    });
  }

  const logo = app.getSprite("icon/spotify");

  return (
    <box width={win.width()} height={win.height()} background={0} flexDirection="column">
      <Show when={!CLIENT_ID}>
        <box padding={8} flexDirection="column" gap={4}>
          <text font="body">VITE_SPOTIFY_CLIENT_ID not set.</text>
          <text font="body">Add it to .env.local and restart.</text>
        </box>
      </Show>
      <Show when={CLIENT_ID && !tokens()}>
        <box width="100%" height="100%" background={1} flexDirection="column" alignItems="center" justifyContent="center" gap={8} padding={8}>
          <Show when={deviceFlow()?.status === "loading"}>
            <text font="body" color={0}>Connecting to Spotify...</text>
          </Show>
          <Show when={deviceFlow()?.status === "qr" && deviceFlow()?.qrMatrix}>
            <text font="body" color={0}>Scan with your phone</text>
            <raster
              width={120}
              height={120}
              onPaint={({ rect, setPixel }) => {
                const matrix = deviceFlow()?.qrMatrix;
                if (!matrix) return;
                const module = Math.max(1, Math.floor(Math.min(rect.width, rect.height) / matrix.length));
                for (let r = 0; r < matrix.length; r++) {
                  for (let c = 0; c < matrix[r].length; c++) {
                    const ink: Ink = matrix[r][c] ? 1 : 0;
                    for (let py = 0; py < module; py++) {
                      for (let px = 0; px < module; px++) {
                        setPixel(c * module + px, r * module + py, ink);
                      }
                    }
                  }
                }
              }}
            />
            <text font="menu" color={0}>{deviceFlow()?.userCode ?? ""}</text>
            <Button label="Cancel" onClick={() => setDeviceFlow(null)} />
          </Show>
          <Show when={deviceFlow()?.status === "expired" || deviceFlow()?.status === "denied"}>
            <text font="body" color={0}>
              {deviceFlow()?.status === "expired" ? "QR code expired." : "Access denied."}
            </text>
            <Button label="Try Again" onClick={() => setDeviceFlow(null)} />
          </Show>
          <Show when={!deviceFlow()}>
            {logo && (
              <image
                width={logo.width}
                height={logo.height}
                src={{ width: logo.width, height: logo.height, data: logo.data, mask: logo.mask }}
                mode="inverted"
              />
            )}
            <text font="body" color={0}>To continue, login to Spotify:</text>
            <Button label="Log in with QR" onClick={startQr} />
            <Button label="Log in via browser" onClick={startBrowser} />
          </Show>
          <Show when={error()}>
            <text font="body" color={0}>{error()}</text>
          </Show>
        </box>
      </Show>
      <Show when={CLIENT_ID && tokens()}>
        <box flexDirection="row" width="100%" height="100%">
          <box
            width={SIDEBAR_W}
            height="100%"
            flexDirection="column"
            background={0}
            borderColor={1}
            borderWidth={1}
            overflow="scroll"
            onScroll={(dy) => setSidebarScroll((s) => Math.max(0, s + dy))}
          >
            <text font="body">PLAYLISTS</text>
            <box height={1} background={1} />
            <For each={playlists()}>
              {(pl, i) => (
                <box
                  padding={2}
                  background={selected() === i() ? 1 : 0}
                  onClick={() => {
                    setSelected(i());
                    if (deviceId) {
                      void spotifyPut("/me/player/play", { context_uri: pl.uri }, session);
                    }
                  }}
                >
                  <text font="body" color={selected() === i() ? 0 : 1}>
                    {pl.name.slice(0, 12)}
                  </text>
                </box>
              )}
            </For>
          </box>
          <box flexGrow={1} flexDirection="column" padding={4} gap={4}>
            <raster
              width={artSize()}
              height={artSize()}
              onPaint={({ rect, setPixel, blitPixels }) => {
                const px = art();
                if (px) {
                  blitPixels(px, artSize(), artSize());
                  return;
                }
                for (let y = 0; y < rect.height; y++) {
                  for (let x = 0; x < rect.width; x++) {
                    setPixel(x, y, (x + y) % 4 === 0 ? 1 : 0);
                  }
                }
              }}
            />
            <text font="body">
              {player()?.track
                ? `${player()!.track!.name} - ${player()!.track!.artists.map((a) => a.name).join(", ")}`
                : "No track playing"}
            </text>
            <box flexDirection="row" gap={6} alignItems="center">
              <Button label="<<" onClick={() => void spotifyPost("/me/player/previous", session)} />
              <Button
                label={player()?.paused ?? true ? ">" : "||"}
                onClick={() => {
                  if (player()?.paused ?? true) {
                    void spotifyPut("/me/player/play", null, session);
                  } else {
                    void spotifyPut("/me/player/pause", null, session);
                  }
                }}
              />
              <Button label=">>" onClick={() => void spotifyPost("/me/player/next", session)} />
              <text font="body">{`Vol ${volume()}`}</text>
              <Button
                label="-"
                onClick={() => {
                  const next = Math.max(0, volume() - 10);
                  setVolume(next);
                  sdkPlayer?.setVolume(next / 100);
                  void spotifyPut(`/me/player/volume?volume_percent=${next}`, null, session);
                }}
              />
              <Button
                label="+"
                onClick={() => {
                  const next = Math.min(100, volume() + 10);
                  setVolume(next);
                  sdkPlayer?.setVolume(next / 100);
                  void spotifyPut(`/me/player/volume?volume_percent=${next}`, null, session);
                }}
              />
            </box>
            <Show when={error()}>
              <text font="body">{error()}</text>
            </Show>
          </box>
        </box>
      </Show>
    </box>
  );
}

export default defineApp({
  id: "spotify",
  requires: ["network", "browser"],
  title: "Spotify Player",
  icon: "icon/spotify",
  sprites: spotifySprites,
  defaultSize: { width: 380, height: 280 },
  scrollable: false,
  Component: SpotifyPlayer,
});
