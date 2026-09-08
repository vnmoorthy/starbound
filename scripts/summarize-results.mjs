import fs from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import os from 'node:os';
import {
  simulate,
  summary,
  impacts,
  DEFAULT_MISSION,
} from '../lib/simulation/engine.ts';
const astra = JSON.parse(await fs.readFile('results/astra.json', 'utf8')),
  sol = JSON.parse(await fs.readFile('results/sol.json', 'utf8')),
  search = JSON.parse(await fs.readFile('results/search.json', 'utf8'));
const best = (r) =>
  r.rounds
    .filter((x) => x.grade.feasible)
    .sort((a, b) => b.grade.score - a.grade.score)[0];
const compact = (r) => ({
  model: r.model,
  status: r.status,
  proposals: r.rounds.length,
  best: best(r),
  totalSeconds: r.rounds.reduce((a, x) => a + x.elapsedSeconds, 0),
});
const comparison = {
  protocol: 'starbound-policy-v1',
  astra: compact(astra),
  sol: compact(sol),
  search,
  verdict:
    Math.abs(best(astra).grade.score - best(sol).grade.score) < 1e-10
      ? 'Astra and Sol tied on the declared feasible-mining score. This task does not establish an Astra-only capability.'
      : 'Results differ on this single task; no general model superiority is established.',
  limitations: [
    'One experiment per model; three successive proposals, not independent trials.',
    'Requested high effort is not a guarantee of equal inference compute or cost.',
    'Search used 1008 engine evaluations and is not an equal-budget comparison.',
    'No total cost or technology readiness validation.',
  ],
};
await fs.writeFile(
  'results/comparison.json',
  JSON.stringify(comparison, null, 2),
);
await fs.writeFile(
  'public/results/comparison.json',
  JSON.stringify(comparison, null, 2),
);
const t = performance.now();
for (let i = 0; i < 100; i++) simulate();
const mean = (performance.now() - t) / 100;
const s = simulate(),
  direct = simulate({ ...DEFAULT_MISSION, linkMode: 'direct-microwave' }),
  thermal = simulate({ radiusAU: 0.3, radiatorRatio: 0.5 });
const verification = {
  at: new Date().toISOString(),
  platform: os.platform(),
  architecture: os.arch(),
  node: process.version,
  meanSimulationMs: mean,
  samples: 100,
  default: summary(s),
  directMicrowave: summary(direct),
  thermalFailure: summary(thermal),
  impact: impacts(s.final.gridW),
  tests: 'Run npm test for the executable assertions.',
};
await fs.writeFile(
  'results/verification.json',
  JSON.stringify(verification, null, 2),
);
console.log(
  JSON.stringify(
    {
      verdict: comparison.verdict,
      astraSeconds: comparison.astra.totalSeconds,
      solSeconds: comparison.sol.totalSeconds,
      meanSimulationMs: mean,
      gridMW: s.final.gridW / 1e6,
      directW: direct.final.gridW,
      impact: verification.impact,
    },
    null,
    2,
  ),
);
