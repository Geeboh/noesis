import { createHash, randomUUID } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { LedgerError } from "./store.mjs";
import { scopeAllows } from "./service-contracts.mjs";

export const MAX_IMPORT_SOURCE_BYTES = 64 * 1024 * 1024;
export const MAX_IMPORT_LINE_BYTES = 4 * 1024 * 1024;
const MAX_RECORD_CHARS = 16_000;
const MAX_PREFLIGHT_QUARANTINE_CANDIDATES = 256;
const FORMAT = "omp-jsonl";
const IMPORT_PRODUCER = "omp-jsonl-import";
const SESSION_TYPES = new Set(["session", "session_start", "session_metadata"]);
const MESSAGE_TYPES = new Set(["message", "toolResult"]);
const IMPORT_ROLES = new Set(["user", "assistant", "toolResult"]);
const VISIBLE_PART_TYPES = new Set(["text", "input_text", "output_text"]);

function invalid(message) {
  throw new LedgerError("INVALID_ARGUMENT", message);
}

function checkedPrincipal(principal) {
  if (!principal || typeof principal.owner_id !== "string" || principal.owner_id.length === 0) invalid("principal owner_id is required");
  return { ...principal, scope_ids: Array.isArray(principal.scope_ids) ? principal.scope_ids : [] };
}

function readSource(source_path, max_bytes = MAX_IMPORT_SOURCE_BYTES) {
  if (typeof source_path !== "string" || source_path.length === 0) invalid("source_path is required");
  if (!Number.isInteger(max_bytes) || max_bytes < 1 || max_bytes > MAX_IMPORT_SOURCE_BYTES) invalid("max_bytes is invalid");
  let stat;
  try {
    stat = statSync(source_path);
  } catch (error) {
    throw new LedgerError("INVALID_ARGUMENT", `unable to read source: ${error.message}`);
  }
  if (!stat.isFile()) invalid("source_path must be a regular file");
  if (stat.size > max_bytes) invalid(`source exceeds ${max_bytes} bytes`);
  let bytes;
  try {
    bytes = readFileSync(source_path);
  } catch (error) {
    throw new LedgerError("INVALID_ARGUMENT", `unable to read source: ${error.message}`);
  }
  if (bytes.byteLength > max_bytes) invalid(`source exceeds ${max_bytes} bytes`);
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    invalid("source is not valid UTF-8");
  }
  return { bytes, text, source_digest: createHash("sha256").update(bytes).digest("hex") };
}

function* jsonLines(bytes, start_line = 1, max_lines = Number.POSITIVE_INFINITY) {
  let start = 0;
  let line_number = 1;
  let yielded = 0;
  for (let index = 0; index <= bytes.length; index += 1) {
    if (index !== bytes.length && bytes[index] !== 0x0a) continue;
    if (index === bytes.length && start === bytes.length) break;
    const line_bytes = bytes.subarray(start, index);
    if (line_number >= start_line) {
      yield { line_number, byte_start: start, byte_end: index, byte_length: line_bytes.length, raw: line_bytes.toString("utf8") };
      yielded += 1;
      if (yielded >= max_lines) return;
    }
    line_number += 1;
    start = index + 1;
  }
}
function parseLine(raw) {
  return JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
}

function entryId(entry, message = entry) {
  const value = entry?.id ?? entry?.entry_id ?? entry?.message_id ?? message?.id ?? message?.message_id;
  return value === undefined || value === null || value === "" ? null : String(value);
}

function sessionData(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  const metadata = entry.session && typeof entry.session === "object" ? entry.session : entry.metadata && typeof entry.metadata === "object" ? entry.metadata : entry;
  const session_id = metadata.session_id ?? metadata.sessionId ?? metadata.id ?? entry.session_id ?? entry.sessionId ?? entry.id;
  const cwd = metadata.cwd ?? metadata.working_directory ?? metadata.workdir ?? metadata.directory ?? entry.cwd ?? entry.working_directory ?? entry.workdir ?? entry.directory;
  if (session_id === undefined || session_id === null || session_id === "" || typeof cwd !== "string" || cwd.length === 0) return null;
  return { session_id: String(session_id), cwd };
}

function messageObject(entry) {
  return entry?.message && typeof entry.message === "object" && !Array.isArray(entry.message) ? entry.message : entry;
}

function visibleText(entry, message, role) {
  const content = message?.content ?? entry?.content;
  const parts = Array.isArray(content) ? content : content && Array.isArray(content.parts) ? content.parts : null;
  if (typeof content === "string") return content;
  if (content && typeof content === "object" && !Array.isArray(content) && typeof content.text === "string" && (!content.type || VISIBLE_PART_TYPES.has(content.type))) return content.text;
  if (parts) {
    let text = "";
    for (const part of parts) {
      if (typeof part === "string") {
        text += part;
        continue;
      }
      if (!part || typeof part !== "object") continue;
      const type = part.type ?? part.kind;
      if ((type === undefined || VISIBLE_PART_TYPES.has(type)) && typeof part.text === "string") text += part.text;
    }
    return text;
  }
  if (typeof message?.text === "string") return message.text;
  if (role === "toolResult" && typeof (message?.output ?? entry?.output) === "string") return message?.output ?? entry.output;
  return "";
}

function chunks(text) {
  const result = [];
  for (let start = 0; start < text.length;) {
    let end = Math.min(start + MAX_RECORD_CHARS, text.length);
    if (end < text.length && end > start && text.charCodeAt(end - 1) >= 0xd800 && text.charCodeAt(end - 1) <= 0xdbff) end -= 1;
    if (end <= start) end = Math.min(start + MAX_RECORD_CHARS + 1, text.length);
    result.push({ text: text.slice(start, end), start, end });
    start = end;
  }
  return result;
}

function classifyLine(line, primarySessionLine) {
  if (line.byte_length > MAX_IMPORT_LINE_BYTES) return { kind: "quarantine", reason: "oversized_line", entry_id: null, message_entry: false };
  let entry;
  try {
    entry = parseLine(line.raw);
  } catch {
    return { kind: "quarantine", reason: "malformed_json", entry_id: null, message_entry: false };
  }
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return { kind: "quarantine", reason: "unsupported_top_level_type", entry_id: null, message_entry: false };
  const type = entry.type ?? entry.kind;
  if (SESSION_TYPES.has(type)) {
    if (line.line_number === primarySessionLine) return { kind: "session", entry };
    return { kind: "quarantine", reason: "duplicate_session", entry_id: entryId(entry), message_entry: false };
  }
  if (!MESSAGE_TYPES.has(type)) return { kind: "quarantine", reason: "unsupported_top_level_type", entry_id: entryId(entry), message_entry: false };
  const message = messageObject(entry);
  const role = message?.role ?? entry.role ?? (type === "toolResult" ? "toolResult" : null);
  const id = entryId(entry, message);
  if (!IMPORT_ROLES.has(role)) return { kind: "quarantine", reason: "unsupported_role", entry_id: id, role, message_entry: true };
  if (!id) return { kind: "quarantine", reason: "missing_id", entry_id: null, role, message_entry: true };
  const text = visibleText(entry, message, role);
  if (text.length === 0) return { kind: "quarantine", reason: "missing_visible_text", entry_id: id, role, message_entry: true };
  return { kind: "message", entry, message, role, entry_id: id, text, chunks: chunks(text) };
}

function analyze(source_path, max_bytes = MAX_IMPORT_SOURCE_BYTES) {
  const source = readSource(source_path, max_bytes);
  let total_lines = 0;
  let session = null;
  let sessionLine = null;
  let quarantine_count = 0;
  const quarantine_candidates = [];
  const message_counts = { total: 0, visible: 0, accepted: 0, quarantined: 0, user: 0, assistant: 0, toolResult: 0 };
  const chunk_counts = { total: 0, user: 0, assistant: 0, toolResult: 0 };
  for (const line of jsonLines(source.bytes)) {
    total_lines = line.line_number;
    if (line.byte_length <= MAX_IMPORT_LINE_BYTES) {
      try {
        const candidate = parseLine(line.raw);
        if (candidate && typeof candidate === "object" && !Array.isArray(candidate) && SESSION_TYPES.has(candidate.type ?? candidate.kind) && !session) {
          const metadata = sessionData(candidate);
          if (metadata) {
            session = { ...metadata, line_number: line.line_number };
            sessionLine = line.line_number;
          }
        }
      } catch {}
    }
  }
  if (!session) invalid("source has no session metadata with session id and cwd");
  for (const line of jsonLines(source.bytes)) {
    const classified = classifyLine(line, sessionLine);
    if (classified.kind === "session") continue;
    if (classified.kind === "message") {
      message_counts.total += 1;
      message_counts.visible += 1;
      message_counts.accepted += 1;
      message_counts[classified.role] += 1;
      chunk_counts.total += classified.chunks.length;
      chunk_counts[classified.role] += classified.chunks.length;
      continue;
    }
    const quarantine = { line_number: line.line_number, byte_start: line.byte_start, byte_end: line.byte_end, entry_id: classified.entry_id ?? null, reason: classified.reason };
    quarantine_count += 1;
    if (quarantine_candidates.length < MAX_PREFLIGHT_QUARANTINE_CANDIDATES) quarantine_candidates.push(quarantine);
    if (classified.reason !== "unsupported_top_level_type" && classified.reason !== "duplicate_session" && classified.reason !== "malformed_json" && classified.reason !== "oversized_line" && classified.reason !== "unsupported_role" && classified.reason !== "missing_id" && classified.reason !== "missing_visible_text") quarantine.reason = "unsupported_top_level_type";
    if (classified.message_entry) message_counts.total += 1;
    message_counts.quarantined += 1;
  }
  const manifest = {
    format: FORMAT,
    source_digest: source.source_digest,
    byte_length: source.bytes.byteLength,
    total_lines,
    session,
    message_counts,
    chunk_counts,
    quarantine_candidates,
    quarantine_count,
  };
  return { ...source, manifest, session, message_counts, chunk_counts, quarantine_candidates };
}

function publicPreflight(result) {
  return {
    format: result.manifest.format,
    source_path: result.source_path,
    source_digest: result.source_digest,
    digest: result.source_digest,
    byte_length: result.bytes?.byteLength ?? result.manifest.byte_length,
    total_lines: result.manifest.total_lines,
    session: result.session,
    session_metadata: result.session,
    message_counts: result.message_counts,
    message_count: result.message_counts.total,
    session_id: result.session.session_id,
    cwd: result.session.cwd,
    quarantine_candidates: result.quarantine_candidates,
    quarantine_count: result.manifest.quarantine_count,
    chunk_counts: result.chunk_counts,
    chunk_count: result.chunk_counts.total,
    total_chunks: result.chunk_counts.total,
  };
}

function scopeFromRun(store, run) {
  return store.db.prepare("SELECT scope_id, owner_id, kind, project_id, session_id, task_id FROM scopes WHERE scope_id = ?").get(run.scope_id) ?? { scope_id: run.scope_id, owner_id: "", kind: "project", project_id: null, session_id: null, task_id: null };
}

function authorizedRun(store, principal, run_id) {
  const run = store.getImportRun(run_id);
  if (!run) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "import run is not available");
  const checked = checkedPrincipal(principal);
  const scope = scopeFromRun(store, run);
  if (!scopeAllows(checked, scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "import run is not available");
  return { run, principal: checked, scope };
}
function publicQuarantine(rows) {
  return rows.map(({ raw_entry_json: _raw_entry_json, ...entry }) => entry);
}

function publicRun(run, quarantine = null) {
  return {
    run_id: run.run_id,
    format: run.format,
    locator: run.locator,
    source_digest: run.source_digest,
    byte_length: run.byte_length,
    scope_id: run.scope_id,
    manifest: run.manifest,
    state: run.state,
    next_line: run.next_line,
    total_lines: run.total_lines,
    processed_lines: run.processed_lines,
    imported_records: run.imported_records,
    quarantined_entries: run.quarantined_entries,
    error: run.error,
    created_at: run.created_at,
    updated_at: run.updated_at,
    ...(quarantine ? { quarantine: publicQuarantine(quarantine) } : {}),
  };
}

export function preflightOmpJsonl({ source_path, max_bytes = MAX_IMPORT_SOURCE_BYTES }) {
  const result = analyze(source_path, max_bytes);
  result.source_path = source_path;
  return publicPreflight(result);
}

export function startOmpJsonlImport({ store, principal, source_path, scope = null }) {
  const checked = checkedPrincipal(principal);
  const result = analyze(source_path);
  result.source_path = source_path;
  const requestedScope = scope ?? {
    scope_id: `omp-session:${result.session.session_id}:${result.session.cwd}`,
    owner_id: checked.owner_id,
    kind: "session",
    project_id: result.session.cwd,
    session_id: result.session.session_id,
    task_id: null,
  };
  if (!requestedScope.scope_id || !scopeAllows(checked, requestedScope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "scope is not available");
  const persistedScope = store.getScope(requestedScope.scope_id);
  if (persistedScope && !scopeAllows(checked, persistedScope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "scope is not available");
  const selectedScope = persistedScope ?? requestedScope;
  if (!selectedScope.scope_id || !scopeAllows(checked, selectedScope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "scope is not available");
  const prior = store.findImportRun(result.source_digest, selectedScope.scope_id);
  if (prior) {
    if (!scopeAllows(checked, scopeFromRun(store, prior))) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "scope is not available");
    return publicRun(prior);
  }
  const run = store.createImportRun({
    run_id: randomUUID(),
    format: FORMAT,
    locator: source_path,
    source_digest: result.source_digest,
    byte_length: result.bytes.byteLength,
    raw_content: result.text,
    scope_id: selectedScope.scope_id,
    scope: selectedScope,
    manifest: result.manifest,
    total_lines: result.manifest.total_lines,
  });
  return publicRun(run);
}

function errorData(error) {
  return { name: error?.name ?? "Error", code: error?.code ?? null, message: String(error?.message ?? error) };
}

function processLine({ service, principal, scope, run, line, primarySessionLine }) {
  const classified = classifyLine(line, primarySessionLine);
  if (classified.kind === "session") return { imported: 0, quarantined: 0 };
  if (classified.kind === "quarantine") {
    const existing = service.store.getImportQuarantine(run.run_id, line.line_number);
    service.store.addImportQuarantine({
      quarantine_id: `${run.run_id}:${line.line_number}`,
      run_id: run.run_id,
      line_number: line.line_number,
      byte_start: line.byte_start,
      byte_end: line.byte_end,
      entry_id: classified.entry_id ?? null,
      reason: classified.reason,
      raw_entry_json: line.raw,
    });
    return { imported: 0, quarantined: existing ? 0 : 1 };
  }
  for (let index = 0; index < classified.chunks.length; index += 1) {
    const chunk = classified.chunks[index];
    const source = {
      source_id: `import:${run.run_id}:${line.line_number}:${index}`,
      scope_id: scope.scope_id,
      locator: `${run.locator}#line=${line.line_number}&chunk=${index}`,
      digest: run.source_digest,
      captured_at: run.created_at,
      status: "observed",
      snapshot: {
        format: FORMAT,
        run_id: run.run_id,
        source_digest: run.source_digest,
        line_number: line.line_number,
        line: line.line_number,
        byte_range: { start: line.byte_start, end: line.byte_end },
        entry_id: classified.entry_id,
        role: classified.role,
        character_range: { start: chunk.start, end: chunk.end },
      },
    };
    service.mindNote({
      principal,
      scope,
      content: chunk.text,
      producer_id: IMPORT_PRODUCER,
      idempotency_key: `${run.run_id}:${line.line_number}:${index}`,
      actor_id: principal.owner_id,
      origin: "document_import",
      source,
    });
  }
  return { imported: classified.chunks.length, quarantined: 0 };
}

export function resumeOmpJsonlImport({ service, principal, run_id, max_lines = 64 }) {
  if (!Number.isInteger(max_lines) || max_lines < 1 || max_lines > 1000) invalid("max_lines must be between 1 and 1000");
  const authorized = authorizedRun(service.store, principal, run_id);
  let run = authorized.run;
  if (run.state === "completed") return publicRun(run, service.store.listImportQuarantine(run.run_id));
  const sourceBytes = Buffer.from(run.raw_content, "utf8");
  const primarySessionLine = run.manifest.session?.line_number ?? null;
  try {
    if (run.state !== "running") {
      run = service.store.updateImportRun(run.run_id, { state: "running", error: null });
      if (!run) throw new Error("import run cursor changed");
    }
    const lines = jsonLines(sourceBytes, run.next_line + 1, max_lines);
    let imported = 0;
    let quarantined = 0;
    for (const line of lines) {
      const expected_next_line = run.next_line;
      const result = processLine({ service, principal: authorized.principal, scope: authorized.scope, run, line, primarySessionLine });
      imported += result.imported;
      quarantined += result.quarantined;
      const updated = service.store.updateImportRun(run.run_id, {
        next_line: line.line_number,
        processed_lines: run.processed_lines + 1,
        imported_records: run.imported_records + imported,
        quarantined_entries: run.quarantined_entries + quarantined,
        state: line.line_number >= run.total_lines ? "completed" : "running",
        error: null,
      }, { expected_next_line });
      if (!updated) throw new Error("import run cursor changed");
      run = updated;
      imported = 0;
      quarantined = 0;
    }
    if (run.state !== "completed") run = service.store.updateImportRun(run.run_id, { state: "paused" }) ?? run;
    return publicRun(run, service.store.listImportQuarantine(run.run_id));
  } catch (error) {
    try {
      const current = service.store.getImportRun(run.run_id);
      if (current?.state === "completed" || (error.message === "import run cursor changed" && current?.next_line > run.next_line)) {
        run = current;
      } else {
        run = service.store.updateImportRun(run.run_id, { state: "failed", error: errorData(error) }) ?? current ?? run;
      }
    } catch {}
    return publicRun(run, service.store.listImportQuarantine(run.run_id));
  }
}

export function getOmpJsonlImportStatus({ store, principal, run_id }) {
  const authorized = authorizedRun(store, principal, run_id);
  return publicRun(authorized.run, store.listImportQuarantine(run_id));
}
