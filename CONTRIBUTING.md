# Contributing

Useful contributions include independently sourced corrections, reproducible model failures, unit/invariant tests, accessible interaction improvements and clearly separated fidelity extensions.

Before proposing a scientific change, state the system boundary, units, source, current behavior and expected behavior. Distinguish changing a scenario assumption from correcting an equation. Preserve the host-side grader and publish all benchmark attempts when changing an evaluation protocol.

Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`. Keep runtime logs, model credentials, local lab tokens and private reasoning out of commits. No model call is required for ordinary CI.

The numerical model is illustrative. Do not present a new default value as a measured Mercury capability without an appropriate source and validation. Physical UI metrics must come from the monthly engine or the explicitly separated engineering calculators. Concept imagery and illustrative motion must remain labeled.

Start with the [documentation index](docs/README.md). Use the scientific-correction issue form for equations, assumptions and system boundaries; use the bug form for reproducible software failures.
