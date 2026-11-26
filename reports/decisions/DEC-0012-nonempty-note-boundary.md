# Decision 0012: reject empty notes at transport boundaries

## Status

Accepted for local Afterglow implementation.

## Defect

The installed v1.9.0 OMP route emitted repeated `note content must be 1-16000 characters` errors after the model submitted empty `mind_note` content. MCP validation also allowed an empty string to reach the service.

## Fix

Require one to 16,000 characters in native OMP and MCP tool schemas. Keep the service validation as the authoritative defense. Return a structured invalid-argument error before persistence for empty transport arguments.

## Acceptance

Empty OMP and MCP note arguments fail at their boundary. Non-empty notes, idempotency, recall, and all existing gates remain green. No data, model, provider, compaction, or tool-name changes occur.
