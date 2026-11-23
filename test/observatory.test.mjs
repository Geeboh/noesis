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
  assert.deepEqual((await capabilities.json()).dream.levels, ["snooze", "nap", "dream", "deep_sleep"]);
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

test("Observatory exposes bounded Atlas resources, snapshots, and Chronicle history", async () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-observatory-atlas-"));
  const started = await createObservatory({ config: { bind_host: "127.0.0.1", port: 0, data_directory: directory, advertised_host: null } });
  const address = started.server.address();
  const base = `http://127.0.0.1:${address.port}`;
  const pair = await fetch(`${base}/pair`, { method: "POST", headers: { origin: base, host: `127.0.0.1:${address.port}`, "content-type": "application/json" }, body: JSON.stringify({ code: started.pairing_code.code }) });
  const cookie = pair.headers.get("set-cookie").split(";", 1)[0];
  const headers = { origin: base, host: `127.0.0.1:${address.port}`, cookie, "content-type": "application/json" };
  const registered = await fetch(`${base}/api/resources`, { method: "POST", headers, body: JSON.stringify({ kind: "webpage", origin_facet: "external", display_name: "Example documentation", aliases: [{ value: "https://example.test/docs", kind: "url" }] }) });
  assert.equal(registered.status, 200);
  const resource = await registered.json();
  for (const snapshot of [
    { snapshot_id: "web-1", locator: "https://example.test/docs", version: "1", retrieved_at: "2026-11-24T00:00:00.000Z", digest: "web-digest-1", status: "examined", content: { title: "Version one" } },
    { snapshot_id: "web-2", locator: "https://example.test/docs", version: "2", retrieved_at: "2026-11-24T00:01:00.000Z", digest: "web-digest-2", status: "examined", content: { title: "Version two" } },
  ]) {
    const response = await fetch(`${base}/api/resources/${resource.resource_id}/snapshot`, { method: "POST", headers, body: JSON.stringify(snapshot) });
    assert.equal(response.status, 200);
  }
  const stateResponse = await fetch(`${base}/api/resources/${resource.resource_id}/state`, { method: "POST", headers, body: JSON.stringify({ state_kind: "referenced", state: "true", evidence_refs: ["reference-1"] }) });
  assert.equal(stateResponse.status, 200);
  const listed = await fetch(`${base}/api/resources?kind=webpage&origin_facet=external&limit=1`, { headers: { cookie } });
  const page = await listed.json();
  assert.equal(listed.status, 200);
  assert.equal(page.data.length, 1);
  assert.equal(page.coverage.total, 1);
  const inspected = await fetch(`${base}/api/resources/${resource.resource_id}`, { headers: { cookie } });
  const detail = await inspected.json();
  assert.equal(detail.snapshots.length, 2);
  assert.equal(detail.states.find((state) => state.state_kind === "referenced").state, "true");
  const trace = await fetch(`${base}/api/trace/${resource.resource_id}?limit=10`, { headers: { cookie } });
  const traced = await trace.json();
  assert.equal(trace.status, 200);
  assert.equal(traced.chronicle.some((event) => event.event_kind === "source_changed"), true);
  await close(started);
  rmSync(directory, { recursive: true, force: true });
});

test("Observatory exposes scoped Attunement correction, Ebb revival, and forgetting", async () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-observatory-adaptation-"));
  const started = await createObservatory({ config: { bind_host: "127.0.0.1", port: 0, data_directory: directory, advertised_host: null } });
  const address = started.server.address();
  const base = `http://127.0.0.1:${address.port}`;
  const landing = await fetch(`${base}/`);
  const landingHtml = await landing.text();
  assert.match(landingHtml, /Attunement/);
  assert.match(landingHtml, /Ebb/);
  const pair = await fetch(`${base}/pair`, { method: "POST", headers: { origin: base, host: `127.0.0.1:${address.port}`, "content-type": "application/json" }, body: JSON.stringify({ code: started.pairing_code.code }) });
  const cookie = pair.headers.get("set-cookie").split(";", 1)[0];
  const headers = { origin: base, host: `127.0.0.1:${address.port}`, cookie, "content-type": "application/json" };
  const createdPreference = await fetch(`${base}/api/preferences`, { method: "POST", headers, body: JSON.stringify({ origin: "inferred", statement: "show progress", support_context_id: "incident-1" }) });
  const preference = await createdPreference.json();
  const corrected = await fetch(`${base}/api/preferences/${preference.preference_id}/correct`, { method: "POST", headers, body: JSON.stringify({ statement: "show progress during long work" }) });
  assert.equal((await corrected.json()).origin, "explicit");
  const note = await fetch(`${base}/api/note`, { method: "POST", headers, body: JSON.stringify({ content: "M3 activation target" }) });
  const record_id = (await note.json()).receipt.record_id;
  await fetch(`${base}/api/ebb/${record_id}/evaluate`, { method: "POST", headers, body: JSON.stringify({ now: "2026-01-01T00:00:00.000Z" }) });
  const faded = await (await fetch(`${base}/api/ebb/${record_id}/evaluate`, { method: "POST", headers, body: JSON.stringify({ now: "2026-01-02T00:00:00.000Z" }) })).json();
  assert.ok(faded.score < 1);
  const revived = await (await fetch(`${base}/api/ebb/${record_id}/revive`, { method: "POST", headers, body: JSON.stringify({ score: 1 }) })).json();
  assert.equal(revived.score, 1);
  const forgetment = await fetch(`${base}/api/forget`, { method: "POST", headers, body: JSON.stringify({ target_id: record_id, reason: "explicit user request" }) });
  assert.equal((await forgetment.json()).affected_ids[0], record_id);
  await close(started);
  rmSync(directory, { recursive: true, force: true });
});
