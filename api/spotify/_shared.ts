/**
 * Shared utilities for the Spotify device-flow API handlers.
 *
 * We use a lightweight HMAC-SHA-256 signed token to carry the device_code
 * between the device-request and device-poll handlers without requiring
 * any shared in-process state. This makes both handlers safe to deploy as
 * stateless Vercel Edge Functions.
 *
 * Token format (base64url-encoded JSON):
 *   { dc: "<device_code>", exp: <unix_seconds> }.<hex_hmac>
 */

export const SCOPES =
  "streaming user-read-playback-state user-modify-playback-state user-read-email playlist-read-private";

/** Key used to sign / verify poll tokens. Falls back to a hard-coded dev secret. */
const SECRET = process.env.SPOTIFY_POLL_SECRET ?? "dev-poll-secret-change-me";

function encode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(str: string): string {
  return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Create a signed poll_id token embedding the device_code. */
export async function signDeviceCode(
  deviceCode: string,
  expiresIn: number
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  const payload = encode(JSON.stringify({ dc: deviceCode, exp }));
  const sig = await hmacHex(payload, SECRET);
  return `${payload}.${sig}`;
}

export interface VerifiedToken {
  deviceCode: string;
}

/**
 * Verify a poll_id token and extract the device_code.
 * Returns null if the token is invalid, tampered with, or expired.
 */
export async function verifyPollId(
  pollId: string
): Promise<VerifiedToken | null> {
  const dot = pollId.lastIndexOf(".");
  if (dot === -1) return null;

  const payload = pollId.slice(0, dot);
  const providedSig = pollId.slice(dot + 1);
  const expectedSig = await hmacHex(payload, SECRET);

  // Constant-time compare to prevent timing attacks
  if (providedSig.length !== expectedSig.length) return null;
  let diff = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    diff |= providedSig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  if (diff !== 0) return null;

  let parsed: { dc: string; exp: number };
  try {
    parsed = JSON.parse(decode(payload));
  } catch {
    return null;
  }

  if (Math.floor(Date.now() / 1000) > parsed.exp) return null;
  if (!parsed.dc) return null;

  return { deviceCode: parsed.dc };
}
