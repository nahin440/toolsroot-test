/**
 * Signed, expiring session token for the /admin area.
 *
 * Deliberately NOT just "cookie present = logged in" — that could be
 * forged by anyone who knows the cookie's name. Instead the cookie value
 * is `${expiryTimestamp}.${signature}`, where the signature is an
 * HMAC-SHA256 of the expiry, keyed by the admin password itself. Forging
 * a valid cookie therefore requires knowing ADMIN_PASSWORD, and a copied
 * cookie stops working once it expires.
 *
 * Uses Web Crypto (`crypto.subtle`) rather than Node's `crypto` module
 * because this file is imported from `middleware.js`, which runs on
 * Next.js's Edge runtime — Web Crypto is the one crypto API available
 * in both the Edge runtime and normal Node.js Route Handlers, so the
 * same code works in both places.
 */

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

async function getSigningKey() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Add it to a .env file at the project root, e.g. ADMIN_PASSWORD=yourpassword"
    );
  }
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Builds a new signed session token, valid for SESSION_DURATION_MS from now. */
export async function createSessionToken() {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(String(expiresAt)));
  return `${expiresAt}.${toHex(signature)}`;
}

/**
 * Verifies a session token string (as read from the cookie). Returns true
 * only if the signature matches AND the token hasn't expired.
 */
export async function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;

  const [expiresAtStr, signatureHex] = token.split(".");
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  try {
    const key = await getSigningKey();
    const expectedSignature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expiresAtStr));
    const expectedHex = toHex(expectedSignature);

    // Constant-time-ish comparison: hex strings are fixed-length (64 chars
    // for SHA-256), so a simple length + char-by-char check doesn't leak
    // meaningfully more timing information than a proper constant-time
    // compare would for a value this short-lived and low-value.
    if (expectedHex.length !== signatureHex.length) return false;
    let mismatch = 0;
    for (let i = 0; i < expectedHex.length; i++) {
      mismatch |= expectedHex.charCodeAt(i) ^ signatureHex.charCodeAt(i);
    }
    return mismatch === 0;
  } catch {
    return false;
  }
}

export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;
