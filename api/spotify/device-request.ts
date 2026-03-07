/**
 * POST /api/spotify/device-request
 *
 * Initiates a Spotify Device Authorization Grant flow:
 *   1. Calls Spotify's device authorization endpoint with client_id + client_secret.
 *   2. Stores the returned device_code in a short-lived in-process map, keyed by a
 *      random poll_id that is safe to send to the client.
 *   3. Returns { poll_id, verification_uri, verification_uri_complete, user_code,
 *               interval, expires_in } to the client.
 *
 * The client_secret is NEVER sent to the browser; only the poll_id is.
 *
 * Note: the in-process store works for local dev and single-instance deployments.
 * For Vercel edge/serverless (where instances are stateless and ephemeral), the
 * device-poll handler encodes the device_code in a short-lived signed token so that
 * no shared state is needed across function invocations. See device-poll.ts.
 */

import { signDeviceCode, SCOPES } from "./_shared";

const CLIENT_ID =
  process.env.SPOTIFY_CLIENT_ID ?? process.env.VITE_SPOTIFY_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? "";

const DEVICE_AUTH_URL = "https://accounts.spotify.com/oauth2/device/code";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return json(
      { error: "SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not configured" },
      503
    );
  }

  // Request a device code from Spotify
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: SCOPES,
  });

  const spotifyResp = await fetch(DEVICE_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body: body.toString(),
  });

  if (!spotifyResp.ok) {
    const err = await spotifyResp.text();
    return json({ error: `Spotify error: ${err}` }, 502);
  }

  const data = await spotifyResp.json();
  const {
    device_code,
    user_code,
    verification_uri,
    verification_uri_complete,
    interval = 5,
    expires_in = 300,
  } = data;

  if (!device_code || !user_code || !verification_uri) {
    return json({ error: "Unexpected response from Spotify" }, 502);
  }

  // Sign the device_code into a token so the poll handler can verify it
  // without needing shared state between serverless invocations.
  const poll_id = await signDeviceCode(device_code, expires_in);

  return json({
    poll_id,
    verification_uri,
    verification_uri_complete: verification_uri_complete ?? null,
    user_code,
    interval,
    expires_in,
  });
}

export const config = { runtime: "edge" };
