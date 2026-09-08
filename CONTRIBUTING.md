# Contributing

Useful contributions include independently sourced corrections, reproducible model failures, unit/invariant tests, accessible interaction improvements and clearly separated fidelity extensions.

Before proposing a scientific change, state the system boundary, units, source, current behavior and expected behavior. Distinguish changing a scenario assumption from correcting an equation. Preserve the host-side grader and publish all benchmark attempts when changing an evaluation protocol.

Run `npm run typecheck`, `npm test` and `npm run build`. Keep runtime logs, model credentials, local lab tokens and private reasoning out of commits. No model call is required for ordinary CI.

The numerical model is illustrative. Do not present a new default value as a measured Mercury capability without an appropriate source and validation. UI result numbers must come from the engine.
