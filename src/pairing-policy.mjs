import { createHash, randomInt, randomUUID, timingSafeEqual } from "node:crypto";

export const PAIRING_TTL_SECONDS = 300;
export const PAIRING_MAX_ATTEMPTS = 5;

export function checkedQrUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Supply complete http(s) access URL");
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error("Supply complete http(s) access URL");
  if (url.username || url.password || url.search || url.hash) throw new Error("QR access URLs must not contain credentials, query tokens or fragments");
  if (["0.0.0.0", "::", "[::]", "*"].includes(url.hostname)) throw new Error("Use an actual advertised address, not wildcard listener");
  return url.toString();
}

export function originAllowed(requestOrigin, expectedOrigin) {
  return typeof requestOrigin === "string" && requestOrigin === expectedOrigin;
}

export function createPairingChallenge({ now = Date.now(), ttlSeconds = PAIRING_TTL_SECONDS, maxAttempts = PAIRING_MAX_ATTEMPTS } = {}) {
  const code = String(randomInt(0, 100_000_000)).padStart(8, "0");
  return {
    challenge_id: randomUUID(),
    code,
    digest: createHash("sha256").update(code).digest("hex"),
    issued_at: now,
    expires_at: now + ttlSeconds * 1000,
    max_attempts: maxAttempts,
    attempts: 0,
    used: false,
  };
}

export function redeemPairingChallenge(challenge, suppliedCode, { now = Date.now() } = {}) {
  if (challenge.used) return { ok: false, reason: "used" };
  if (now >= challenge.expires_at) return { ok: false, reason: "expired" };
  if (challenge.attempts >= challenge.max_attempts) return { ok: false, reason: "rate_limited" };
  challenge.attempts += 1;
  const suppliedDigest = createHash("sha256").update(String(suppliedCode)).digest("hex");
  const matches = timingSafeEqual(Buffer.from(suppliedDigest, "hex"), Buffer.from(challenge.digest, "hex"));
  if (!matches) return { ok: false, reason: "invalid" };
  challenge.used = true;
  return { ok: true, session_id: randomUUID() };
}
