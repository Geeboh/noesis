# Release report: R-0012 import recall fit

## Identity

- Release: `R-0012-import-recall-fit`.
- Target: `1.6.2`.
- Baseline: published and installed `1.6.1`.
- Publication: not authorized.

## Status
## Validation

The 12,000-character chunk limit preserved exact import reconstruction and passed the importer focused tests. The real-history probe did not improve target coverage: coding remained 19/20 and design/research remained 19/20. The residual design miss had two matching records under the 12,000-character budget, so chunk size was not its root cause.

## Disposition

Reject and defer R12. Do not change the installed v1.6.1 importer policy. The evidence does not justify a release or an automatic rewrite of existing imported records. A future Resonance task must address budget allocation across co-matching imported chunks, not only chunk size.
