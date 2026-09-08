import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MISSION } from '../lib/simulation/engine.ts';
import { evaluateProposal } from '../lib/simulation/experiment.ts';
test('Astra cannot expand the fixed budget or rewrite physical assumptions', () => {
  for (const changes of [
    { seedPowerMW: 200 },
    { importedTechKt: 1000 },
    { efficiency: 0.4 },
    { years: 100 },
    { constructor: 0 },
  ])
    assert.throws(() => evaluateProposal(DEFAULT_MISSION, changes));
});
test('host recalculates and grades output independently', () => {
  const e = evaluateProposal(DEFAULT_MISSION, {
    radiusAU: 0.3,
    radiatorRatio: 0.5,
  });
  assert.equal(e.result.gridMW, 0);
  assert.equal(e.grade.feasible, false);
  assert.equal(e.result.mission.years, 10);
});
