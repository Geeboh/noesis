import { randomUUID } from "node:crypto";
import { LedgerError } from "./store.mjs";

export function createAdaptation(store) {
  return {
    recordPreference({ preference_id = randomUUID(), scope_id, origin, statement, context = {}, support_context_id = null, counterevidence = [] }) {
      if (!['explicit', 'inferred'].includes(origin)) throw new LedgerError("INVALID_ARGUMENT", "invalid preference origin");
      const support_contexts = support_context_id ? [support_context_id] : [];
      return store.createPreference({ preference_id, scope_id, origin, statement, context, support_contexts, counterevidence, state: origin === "explicit" ? "current" : "candidate" });
    },
    supportPreference({ preference_id, support_context_id }) {
      const current = store.getPreference(preference_id);
      if (!current) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "preference is not available");
      const support_contexts = [...new Set([...current.support_contexts, support_context_id])];
      return store.updatePreference(preference_id, { support_contexts });
    },
    correctPreference({ preference_id, statement, context = {}, scope_id }) {
      const current = store.getPreference(preference_id);
      if (!current || current.scope_id !== scope_id) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "preference is not available");
      return store.updatePreference(preference_id, { origin: "explicit", statement, context, state: "current" });
    },
    applicablePreferences({ scope_id, context = {} }) {
      return ["current", "candidate"].flatMap((state) => store.db.prepare("SELECT preference_id FROM preferences WHERE scope_id = ? AND state = ? ORDER BY origin DESC, updated_at DESC").all(scope_id, state).map((row) => store.getPreference(row.preference_id))).filter((preference) => Object.entries(preference.context).every(([key, value]) => context[key] === value));
    },
    evaluateEbb({ record_id, now, lambda_time = 0.1, lambda_opportunity = 0.05 }) {
      const current = store.getActivation(record_id) ?? store.createActivation({ record_id, anchor_at: now });
      if (current.last_evaluated_at === now) return current;
      const elapsedDays = Math.max(0, (Date.parse(now) - Date.parse(current.anchor_at)) / 86_400_000);
      const score = Math.max(current.protected_minimum, Math.max(0, current.anchor_score * Math.exp(-lambda_time * elapsedDays - lambda_opportunity * current.opportunities)));
      return store.updateActivation(record_id, { score, opportunities: current.opportunities, last_evaluated_at: now });
    },
    revive({ record_id, now, score = 1 }) {
      const current = store.getActivation(record_id) ?? store.createActivation({ record_id, anchor_at: now });
      return store.updateActivation(record_id, { score, opportunities: current.opportunities, last_evaluated_at: now });
    },
    forget({ target_id, scope_id, reason, affected_ids = [] }) {
      if (!reason) throw new LedgerError("INVALID_ARGUMENT", "forget reason is required");
      return store.createForgetment({ forgetment_id: randomUUID(), target_id, scope_id, reason, affected_ids });
    },
  };
}
