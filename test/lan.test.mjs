import test from "node:test";
import assert from "node:assert/strict";
import { accessUrl, renderTextQr, startupInstructions } from "../src/lan.mjs";

test("LAN QR renders the actual client URL without wildcard or pairing secret", () => {
  const url = accessUrl("192.0.2.20", 7337, "/");
  const qr = renderTextQr(url);
  assert.match(qr, /[█▀▄]/);
  assert.equal(qr.includes("0.0.0.0"), false);
  assert.equal(qr.includes("12345678"), false);
  assert.match(startupInstructions({ host: "192.0.2.20", port: 7337, candidates: [{ interface: "eth0", host: "192.0.2.20" }], pairingCode: "12345678" }), /NOESIS ready at http:\/\/192\.0\.2\.20:7337\//);
});

test("IPv6 access URLs are bracketed", () => {
  assert.equal(accessUrl("2001:db8::20", 7337), "http://[2001:db8::20]:7337/");
});
test("advertised host selection honors explicit operator choice", async () => {
  const { selectAdvertisedHost } = await import("../src/lan.mjs");
  assert.equal(selectAdvertisedHost({ advertised_host: "192.0.2.21" }, [{ host: "192.0.2.20" }]), "192.0.2.21");
  assert.equal(selectAdvertisedHost({ advertised_host: null }, [{ host: "192.0.2.20" }]), "192.0.2.20");
});
