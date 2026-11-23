# Decision DEC-0002: M7 optional adapters

**Status:** accepted
**Date:** 2026-11-24
**Owner:** integration owner
**Related tasks:** M7-02, M7-03, M7-06

## Decision

Defer the optional MCP adapter tasks M7-02 and M7-03 for the v0.7.0-beta.1 candidate. Select no external format conversion or external memory backend. Keep native archive, integrity verification, and clean-store restore as the complete supported portability path.

## Reason

The native path passes without MCP or an external backend. No supported client, transport budget, or external format mapping requirement is selected for this release. Implementing an unneeded adapter would add a second policy boundary without observed benefit.

## Scope and compatibility effect

M7-02 and M7-03 remain explicitly unavailable and are not advertised as capabilities. Native archive records scope, revisions, source references, resources, lineage, jobs, preferences, activation, forgetting, and Lore pages. Uncontrolled external copies remain outside deletion and restore guarantees.

## Reconsideration

Select an optional adapter only after a concrete client, transport contract, measured benefit, and mapping-loss test exist. Native portability must continue to work without it.
