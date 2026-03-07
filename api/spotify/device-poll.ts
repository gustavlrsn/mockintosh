/**
 * GET /api/spotify/device-poll?poll_id=<token>
 *
 * Polls Spotify's token endpoint using the device_code that was embedded
 * (HMAC-signed) in the poll_id returned by device-request.
 *
 * Response shapes:
 *   { status: "pending" }                                   – still waiting for user
 *   { status: "ready", access_token, refresh_token, expires_in }  – success
 *   { status: "expired" }                                   – device code expired
 *   { status: "denied" }                                    – user denied access
 *   { error: "..." }                                        – other errors
 */

import { verifyPollId } from "./_shared";

const CLIENT_ID =
  process.env.SPOTIFY_CLIENT_ID ?? process.env.VITE_SPOTIFY_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? "";

const TOKEN_URL = "https://accounts.spotify.com/api/token";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return json(
      { error: "SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not configured" },
      503
    );
  }

  const url = new URL(req.url);
  const pollId = url.searchParams.get("poll_id");
  if (!pollId) {
    return json({ error: "Missing poll_id" }, 400);
  }

  const verified = await verifyPollId(pollId);
  if (!verified) {
    return json({ status: "expired" });
  }

  // Exchange device_code for tokens with Spotify
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    device_code: verified.deviceCode,
    client_id: CLIENT_ID,
  });

  const spotifyResp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body: body.toString(),
  });

  if (spotifyResp.ok) {
    const data = await spotifyResp.json();
    return json({
      status: "ready",
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
  }

  // Non-2xx: parse Spotify's error body
  let errorData: { error?: string } = {};
  try {
    errorData = await spotifyResp.json();
  } catch {
    // ignore
  }

  switch (errorData.error) {
    case "authorization_pending":
      return json({ status: "pending" });
    case "slow_down":
      // Client should increase its poll interval; treat as pending here.
      return json({ status: "pending" });
    case "expired_token":
      return json({ status: "expired" });
    case "access_denied":
      return json({ status: "denied" });
    default:
      return json(
        { error: `Spotify error: ${errorData.error ?? spotifyResp.status}` },
        502
      );
  }
}

export const config = { runtime: "edge" };
