import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MISSION, simulate } from '../lib/simulation/engine.ts';
import {
  massDriver,
  transferEstimate,
  civilization,
  spaceUses,
  seedDelivery,
} from '../lib/simulation/engineering.ts';
test('unavailable robot, refinery or fabrication fleet stops production without NaN', () => {
  for (const key of [
    'robotAvailability',
    'refineryAvailability',
    'plantAvailability',
  ]) {
    const s = simulate({ [key]: 0 });
    assert.equal(s.final.manufacturedKg, 0);
    assert.equal(s.final.gridW, 0);
    assert(s.audit.passed);
    assert(s.rows.every((r) => r.stageUtilization.every(Number.isFinite)));
  }
});
test('mass-driver track trades acceleration for distance; kinetic energy conserved', () => {
  const a = massDriver(0.4, 10, 1000, 20),
    b = massDriver(0.4, 100, 1000, 20);
  assert(Math.abs(a.trackM / b.trackM - 10) < 1e-10);
  assert(Math.abs(a.inputJ / (1000 * a.muzzleMs ** 2) - 1) < 1e-10);
  assert(Math.abs(a.chargeSeconds * 20e6 - a.inputJ) < 1e-5);
  assert(a.arrivalDeltaMs > 0);
});
test('same-radius transfer has no delta v; Earth-Mercury transfer remains a bound', () => {
  assert.equal(transferEstimate(0.3871).totalDeltaMs, 0);
  assert(transferEstimate(0.3871, 1).totalDeltaMs > 10000);
  assert(transferEstimate(0.3871, 1).transferDays > 100);
});
test('rocket equation conserves payload, dry mass and propellant', () => {
  const x = seedDelivery(2000, 0.2);
  assert.equal(x.dryTonnes, 2400);
  assert.equal(x.wetTonnes, x.dryTonnes + x.propellantTonnes);
  assert(x.propellantTonnes > 2000);
});
test('near-total capture needs increasing mass and nonzero heat rejection', () => {
  const a = civilization(DEFAULT_MISSION, 0.9, 300),
    b = civilization(DEFAULT_MISSION, 0.99, 300);
  assert(Math.abs(b.opticalDepth / a.opticalDepth - 2) < 1e-12);
  assert(b.oreKg > a.oreKg);
  assert(b.radiatingAreaM2 > b.collectorAreaM2);
  assert.throws(() => civilization(DEFAULT_MISSION, 1, 300));
});
test('space use respects Stefan-Boltzmann and energy lower bounds', () => {
  const a = spaceUses(1e9, 300, 1000, 0.1, 2),
    b = spaceUses(1e9, 600, 1000, 0.1, 4);
  assert(Math.abs(a.computeCoolingM2 / b.computeCoolingM2 - 16) < 1e-9);
  assert(Math.abs(a.habitatRadiusM / b.habitatRadiusM - 4) < 1e-9);
  assert(a.kineticJ > 4.49e17);
  assert.equal(spaceUses(0, 300, 1000, 0.1, 2).idealAccelerationYears, null);
});
