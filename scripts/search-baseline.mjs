import fs from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import {
  DEFAULT_MISSION,
  simulate,
  summary,
} from '../lib/simulation/engine.ts';
import { evaluateProposal, CHALLENGE } from '../lib/simulation/experiment.ts';
const started = performance.now();
let count = 0,
  best = null;
// A declared coarse grid. More engine calls than the LLM trials; not equal compute.
for (const radiusAU of [0.3, 0.35, 0.4, 0.5, 0.7, 1])
  for (const radiatorRatio of [0.5, 0.75, 1, 1.5, 2, 3, 4])
    for (const reinvestFraction of [0, 0.05, 0.15, 0.35, 0.65, 0.9])
      for (const expansionFraction of [0, 0.05, 0.18, 0.4]) {
        const changes = {
          radiusAU,
          radiatorRatio,
          reinvestFraction,
          expansionFraction,
          linkMode: 'optical-relay',
        };
        const out = evaluateProposal(DEFAULT_MISSION, changes);
        count++;
        if (out.grade.feasible && (!best || out.grade.score > best.grade.score))
          best = { changes, ...out };
      }
const result = {
  method: 'deterministic coarse grid',
  challenge: CHALLENGE,
  evaluations: count,
  elapsedSeconds: (performance.now() - started) / 1000,
  budgetNote:
    '1008 simulator evaluations, not an equal-compute comparison with the 3-proposal model trials.',
  best,
};
await fs.writeFile('results/search.json', JSON.stringify(result, null, 2));
await fs.writeFile(
  'results/baseline.json',
  JSON.stringify(summary(simulate()), null, 2),
);
await fs.writeFile(
  'public/results/baseline.json',
  JSON.stringify(summary(simulate()), null, 2),
);
console.log(
  JSON.stringify(
    {
      evaluations: count,
      elapsedSeconds: result.elapsedSeconds,
      best: best && {
        gridMW: best.result.gridMW,
        minedMt: best.result.minedMt,
        changes: best.changes,
      },
    },
    null,
    2,
  ),
);
