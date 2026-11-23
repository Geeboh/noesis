import { createHash } from "node:crypto";

const MAX_EVENT_CHARS = 16_000;

function eventText(event) {
  if (typeof event === "string") return event.slice(0, MAX_EVENT_CHARS);
  try { return JSON.stringify(event).slice(0, MAX_EVENT_CHARS); } catch { return null; }
}

export function normalizeHostEvent(kind, event, defaultActor = "omp") {
  const content = eventText(event);
  if (!content || !content.trim()) return null;
  const explicit = event?.eventId ?? event?.id ?? event?.toolCallId ?? event?.messageId;
  const idempotency_key = explicit
    ? `${kind}:${explicit}`
    : `${kind}:${createHash("sha256").update(content).digest("hex")}`;
  const status = event?.error ? "error" : event?.aborted ? "interrupted" : event?.status ?? "unknown";
  return { content, idempotency_key, actor_id: event?.actorId ?? defaultActor, status };
}
