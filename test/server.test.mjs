import test from "node:test";
import assert from "node:assert/strict";
import { parseServerConfig, startServer } from "../src/server.mjs";

test("server config defaults to LAN listener and local data path", () => {
  const config = parseServerConfig({ NOESIS_DATA_DIR: "/tmp/noesis-data" });
  assert.equal(config.bind_host, "0.0.0.0");
  assert.equal(config.port, 7337);
  assert.equal(config.data_directory, "/tmp/noesis-data");
  assert.equal(config.advertised_host, null);
});

test("server config rejects invalid ports and advertised wildcard", () => {
  assert.throws(() => parseServerConfig({ NOESIS_PORT: "0" }), /invalid NOESIS_PORT/);
  assert.throws(() => parseServerConfig({ NOESIS_ADVERTISED_HOST: "0.0.0.0" }), /invalid NOESIS_ADVERTISED_HOST/);
});
test("startServer resolves after actual listener readiness", async () => {
  const config = { ...parseServerConfig({ NOESIS_BIND_HOST: "127.0.0.1", NOESIS_PORT: "7337", NOESIS_DATA_DIR: "/tmp/noesis-server-test" }), port: 0 };
  const service = { close() {} };
  const started = await startServer({ config, service, requestHandler: (_request, response) => response.end("ready") });
  const address = started.server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/`);
  assert.equal(await response.text(), "ready");
  await new Promise((resolve) => started.server.close(resolve));
  service.close();
});

test("startServer rejects an occupied port", async () => {
  const config = { ...parseServerConfig({ NOESIS_BIND_HOST: "127.0.0.1", NOESIS_PORT: "7337", NOESIS_DATA_DIR: "/tmp/noesis-server-test" }), port: 0 };
  const first = await startServer({ config, service: { close() {} }, requestHandler: (_request, response) => response.end("first") });
  const occupied = { ...config, port: first.server.address().port };
  await assert.rejects(() => startServer({ config: occupied, service: { close() {} } }), /EADDRINUSE|address already in use/);
  await new Promise((resolve) => first.server.close(resolve));
});
