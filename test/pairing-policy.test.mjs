import test from "node:test";
import assert from "node:assert/strict";
import { checkedQrUrl, createPairingChallenge, originAllowed, redeemPairingChallenge } from "../src/pairing-policy.mjs";

test("QR URL excludes wildcard listeners and secrets", () => {
  assert.equal(checkedQrUrl("http://192.0.2.10:7337/pair"), "http://192.0.2.10:7337/pair");
  assert.throws(() => checkedQrUrl("http://0.0.0.0:7337/pair"), /wildcard/);
  assert.throws(() => checkedQrUrl("http://192.0.2.10:7337/pair?token=secret"), /credentials/);
});

test("pairing is short-lived, rate-limited, and single-use", () => {
  const challenge = createPairingChallenge({ now: 1000, ttlSeconds: 5, maxAttempts: 2 });
  assert.equal(redeemPairingChallenge(challenge, "00000000", { now: 1001 }).reason, "invalid");
  assert.equal(redeemPairingChallenge(challenge, challenge.code, { now: 1002 }).ok, true);
  assert.equal(redeemPairingChallenge(challenge, challenge.code, { now: 1003 }).reason, "used");

  const expired = createPairingChallenge({ now: 1000, ttlSeconds: 5 });
  assert.equal(redeemPairingChallenge(expired, expired.code, { now: 6000 }).reason, "expired");
});

test("mutations require exact same-origin policy", () => {
  assert.equal(originAllowed("http://192.0.2.10:7337", "http://192.0.2.10:7337"), true);
  assert.equal(originAllowed("https://other.example", "http://192.0.2.10:7337"), false);
});
