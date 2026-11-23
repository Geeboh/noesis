import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAdaptation } from "../src/adaptation.mjs";
import { openStore } from "../src/store.mjs";

test("Attunement separates explicit corrections from inferred support", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-adaptation-"));
  const store = openStore(join(directory, "mind.sqlite"));
  const adaptation = createAdaptation(store);
  const inferred = adaptation.recordPreference({ preference_id: "preference-1", scope_id: "scope-1", origin: "inferred", statement: "show progress", support_context_id: "incident-1" });
  adaptation.supportPreference({ preference_id: inferred.preference_id, support_context_id: "incident-1" });
  adaptation.supportPreference({ preference_id: inferred.preference_id, support_context_id: "incident-2" });
  const corrected = adaptation.correctPreference({ preference_id: inferred.preference_id, scope_id: "scope-1", statement: "show progress during long work" });
  assert.equal(corrected.origin, "explicit");
  assert.equal(corrected.support_contexts.length, 2);
  assert.equal(adaptation.applicablePreferences({ scope_id: "scope-1" })[0].statement, "show progress during long work");
  store.close();
  rmSync(directory, { recursive: true, force: true });
});

test("Ebb is reversible, anchored, and does not double-decay at one effective time", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-adaptation-"));
  const store = openStore(join(directory, "mind.sqlite"));
  const adaptation = createAdaptation(store);
  const first = adaptation.evaluateEbb({ record_id: "record-ebb", now: "2026-01-11T00:00:00.000Z" });
  const second = adaptation.evaluateEbb({ record_id: "record-ebb", now: "2026-01-11T00:00:00.000Z" });
  assert.equal(first.score, second.score);
  const revived = adaptation.revive({ record_id: "record-ebb", now: "2026-01-12T00:00:00.000Z" });
  assert.equal(revived.score, 1);
  const forgetment = adaptation.forget({ target_id: "record-ebb", scope_id: "scope-1", reason: "explicit user request", affected_ids: ["record-ebb"] });
  assert.equal(forgetment.affected_ids[0], "record-ebb");
  store.close();
  rmSync(directory, { recursive: true, force: true });
});
