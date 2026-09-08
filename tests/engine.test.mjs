import test from 'node:test';
import assert from 'node:assert/strict';
import {
  simulate,
  solarFlux,
  gaussianLink,
  powerLink,
  validateMission,
  DEFAULT_MISSION,
  C,
} from '../lib/simulation/engine.ts';

test('inverse-square flux agrees with the reference irradiance', () => {
  assert.equal(solarFlux(1), 1361);
  assert.equal(solarFlux(0.5), 5444);
});
test('Mercury escape energy and speed agree with independent JPL scale', () => {
  const s = simulate({ years: 1 });
  assert.ok(Math.abs(s.escapeSpeedMs - 4250) < 2);
  assert.ok(s.escapeLowerBoundJkg > 9e6 && s.escapeLowerBoundJkg < 9.1e6);
  assert.ok(s.launchJkg > s.escapeLowerBoundJkg);
});
test('mass and energy conservation across a grid of scenarios', () => {
  for (const radiusAU of [0.3, 0.4, 1])
    for (const expansionFraction of [0, 0.18, 0.6])
      for (const shockSeverity of [0, 1]) {
        const s = simulate({
          radiusAU,
          expansionFraction,
          shockSeverity,
          years: 15,
        });
        assert.ok(s.audit.passed, JSON.stringify(s.mission));
        for (const r of s.rows) {
          assert.ok(r.activeKg >= 0 && r.retiredKg >= 0 && r.gridW >= 0);
          assert.ok(r.gridW <= r.exportOfferedW + 1e-9);
          assert.ok(r.stageUtilization.every((x) => x >= 0 && x <= 1 + 1e-9));
          assert.ok(
            Math.abs(r.manufacturedKg - r.factoryKg - r.launchedKg) < 0.01,
          );
          assert.ok(Math.abs(r.launchedKg - r.activeKg - r.retiredKg) < 0.01);
        }
        for (let i = 1; i < s.rows.length; i++) {
          const used =
            s.rows[i].cumulativeProcessJ - s.rows[i - 1].cumulativeProcessJ;
          const available =
            s.rows[i].cumulativeAvailableJ - s.rows[i - 1].cumulativeAvailableJ;
          assert.ok(used <= available * (1 + 1e-8) + 1);
        }
      }
});
test('no imported components means no new collectors or factory expansion', () => {
  const s = simulate({ importedTechKt: 0 });
  assert.equal(s.final.activeKg, 0);
  assert.equal(s.final.gridW, 0);
  assert.equal(s.final.minedKg, 0);
});
test('resource quota cannot be exceeded', () => {
  const s = simulate({ oreBudgetMt: 0.001, years: 100 });
  assert.ok(s.final.minedKg <= 1e6 + 1e-6);
  assert.equal(s.final.bottleneck, 'ore quota');
});
test('over-temperature collectors cannot generate electrical power', () => {
  const s = simulate({ radiusAU: 0.3, radiatorRatio: 0.5 });
  assert.equal(s.thermalValid, false);
  assert.equal(s.final.grossPowerW, 0);
  assert.equal(s.final.cumulativeGridMWh, 0);
  assert.ok(s.final.activeKg > 0);
});
test('a full launcher outage stops launches after the intervention', () => {
  const s = simulate({
    shockYear: 1,
    shockSeverity: 1,
    annualLoss: 0,
    years: 3,
  });
  assert.equal(s.rows[12].activeKg, s.final.activeKg);
  assert.equal(s.final.bottleneck, 'launch');
});
test('Gaussian link has bounded capture and sensible limiting behavior', () => {
  const small = gaussianLink(1e-6, C.AU, 100, 10),
    large = gaussianLink(1e-6, C.AU, 100, 10000);
  assert.ok(
    small.capture > 0 && small.capture < large.capture && large.capture <= 1,
  );
  assert.ok(
    gaussianLink(1e-6, C.AU, 100, 1000, 1e-6).capture <
      gaussianLink(1e-6, C.AU, 100, 1000).capture,
  );
});
test('Earth link enforces peak flux and grid caps and solar occultation', () => {
  const m = validateMission({ gridLimitGW: 0.001 });
  const l = powerLink(1e18, m);
  assert.ok(l.gridW <= 0.001 * 1e9 * 0.75 + 1e-6);
  assert.ok(l.groundPeakWm2 <= 10 + 1e-9);
  assert.equal(powerLink(1e12, { ...m, phaseDegrees: 180 }).gridW, 0);
  assert.equal(powerLink(1e12, { ...m, linkMode: 'space-only' }).gridW, 0);
});
test('microwave interplanetary capture falls below the optical relay for these apertures', () => {
  const direct = powerLink(1e9, {
    ...DEFAULT_MISSION,
    linkMode: 'direct-microwave',
  });
  const relay = powerLink(1e9, DEFAULT_MISSION);
  assert.ok(direct.gridW < relay.gridW / 1000);
});
test('rejects invalid and unknown inputs rather than silently repairing them', () => {
  for (const input of [
    { radiusAU: NaN },
    { efficiency: 1 },
    { linkMode: 'magic' },
    { missing: 1 },
    { constructor: 1 },
  ])
    assert.throws(() => validateMission(input));
  assert.throws(() => simulate({ years: 0 }));
});
test('reproducible simulation and integrated energy use consistent units', () => {
  const a = simulate({ years: 2 }),
    b = simulate({ years: 2 });
  assert.deepEqual(a, b);
  const independentlyIntegrated = a.rows
    .slice(0, -1)
    .reduce((s, r) => s + (r.gridW * C.yearSeconds) / 12 / 3.6e9, 0);
  assert.ok(
    Math.abs(a.final.cumulativeGridMWh - independentlyIntegrated) < 1e-6,
  );
});
