import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createObservatory } from "../src/server.mjs";

async function close(started) {
  await new Promise((resolve) => started.server.close(resolve));
  started.service.close();
}

test("Observatory denies private data until pairing, then serves real service data", async () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-observatory-"));
  const started = await createObservatory({ config: { bind_host: "127.0.0.1", port: 0, data_directory: directory, advertised_host: null } });
  const address = started.server.address();
  const base = `http://127.0.0.1:${address.port}`;
  const landing = await fetch(`${base}/`);
  assert.equal(landing.status, 200);
  assert.match(await landing.text(), /Pair this browser/);
  const denied = await fetch(`${base}/api/capabilities`);
  assert.equal(denied.status, 401);
  const pair = await fetch(`${base}/pair`, { method: "POST", headers: { origin: base, host: `127.0.0.1:${address.port}`, "content-type": "application/json" }, body: JSON.stringify({ code: started.pairing_code.code }) });
  assert.equal(pair.status, 200);
  const reuse = await fetch(`${base}/pair`, { method: "POST", headers: { origin: base, host: `127.0.0.1:${address.port}`, "content-type": "application/json" }, body: JSON.stringify({ code: started.pairing_code.code }) });
  assert.equal(reuse.status, 403);
  const cookie = pair.headers.get("set-cookie").split(";", 1)[0];
  const capabilities = await fetch(`${base}/api/capabilities`, { headers: { cookie } });
  assert.equal(capabilities.status, 200);
  assert.deepEqual((await capabilities.json()).dream.levels, ["snooze"]);
  const note = await fetch(`${base}/api/note`, { method: "POST", headers: { origin: base, host: `127.0.0.1:${address.port}`, cookie, "content-type": "application/json" }, body: JSON.stringify({ content: "dashboard observation" }) });
  assert.equal(note.status, 200);
  const recall = await fetch(`${base}/api/recall?query=dashboard`, { headers: { cookie } });
  const recalled = await recall.json();
  assert.equal(recalled.data.length, 1);
  const inspect = await fetch(`${base}/api/inspect/${recalled.data[0].record_id}`, { headers: { cookie } });
  assert.equal((await inspect.json()).record.payload.statement, "dashboard observation");
  const dream = await fetch(`${base}/api/dream`, { method: "POST", headers: { origin: base, host: `127.0.0.1:${address.port}`, cookie, "content-type": "application/json" }, body: "{}" });
  const dreamReceipt = await dream.json();
  const dreamStatus = await fetch(`${base}/api/dream/${dreamReceipt.job_id}`, { headers: { cookie } });
  assert.equal((await dreamStatus.json()).state, "queued");
  await close(started);
  rmSync(directory, { recursive: true, force: true });
});
