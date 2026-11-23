import { createPairingChallenge, originAllowed, redeemPairingChallenge } from "./pairing-policy.mjs";

function cookies(request) {
  return Object.fromEntries((request.headers.cookie ?? "").split(";").map((part) => part.trim().split("=")).filter(([key, value]) => key && value));
}

export class PairingManager {
  constructor({ origin }) {
    this.origin = origin;
    this.challenge = null;
    this.sessions = new Set();
  }

  issue({ now = Date.now() } = {}) {
    this.challenge = createPairingChallenge({ now });
    return { code: this.challenge.code, expires_at: this.challenge.expires_at };
  }

  expectedOrigin(host) {
    return this.origin ?? `http://${host}`;
  }

  originAllowed(requestOrigin, host) {
    return originAllowed(requestOrigin, this.expectedOrigin(host));
  }

  redeem(code, requestOrigin, host, { now = Date.now() } = {}) {
    if (!this.originAllowed(requestOrigin, host) || !this.challenge) return { ok: false, reason: "forbidden" };
    const result = redeemPairingChallenge(this.challenge, code, { now });
    if (!result.ok) return result;
    this.sessions.add(result.session_id);
    return result;
  }

  isAuthenticated(request) {
    const session = cookies(request).noesis_session;
    return Boolean(session && this.sessions.has(session));
  }

  revokeAll() {
    this.sessions.clear();
  }
}
