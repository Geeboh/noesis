# NOESIS v1.9.2 release notes

## Nonempty note boundaries

Native OMP and MCP note schemas now reject empty content before the service call. Valid note calls remain unchanged.

- OMP note content requires 1 to 16,000 characters.
- MCP note schemas declare the same bounds.
- Empty MCP calls return structured invalid-parameter errors.
- Service validation remains authoritative.

## Validation

The local patch passed 78 tests and 21 JSON Schema examples. v1.9.1 remains installed and is the rollback baseline.
