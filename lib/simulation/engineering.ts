/** Concept-stage engineering calculators. Independent of the monthly production trajectory. */
import { C, ASSUMPTIONS, arealDensity, type Mission } from './engine.ts';
function bounded(n: number, min: number, max: number, name: string) {
  if (!Number.isFinite(n) || n < min || n > max)
    throw new Error(`${name} must be ${min}–${max}.`);
  return n;
}
export function transferEstimate(targetAU: number, fromAU = 0.3871) {
  bounded(targetAU, 0.3, 1, 'Target orbit');
  bounded(fromAU, 0.3, 1, 'Departure orbit');
  const r1 = fromAU * C.AU,
    r2 = targetAU * C.AU,
    a = (r1 + r2) / 2;
  const circular1 = Math.sqrt(C.solarGM / r1),
    circular2 = Math.sqrt(C.solarGM / r2);
  const departureDeltaMs = Math.abs(
    Math.sqrt(C.solarGM * (2 / r1 - 1 / a)) - circular1,
  );
  const arrivalDeltaMs = Math.abs(
    circular2 - Math.sqrt(C.solarGM * (2 / r2 - 1 / a)),
  );
  return {
    departureDeltaMs,
    arrivalDeltaMs,
    totalDeltaMs: departureDeltaMs + arrivalDeltaMs,
    transferDays:
      r1 === r2 ? 0 : (Math.PI * Math.sqrt(a ** 3 / C.solarGM)) / 86400,
    orbitalSpeedMs: circular2,
    periodDays: (2 * Math.PI * Math.sqrt(r2 ** 3 / C.solarGM)) / 86400,
  };
}
export function massDriver(
  targetAU: number,
  accelerationG: number,
  payloadKg: number,
  chargeMW: number,
) {
  bounded(accelerationG, 1, 1000, 'Acceleration');
  bounded(payloadKg, 1, 1e6, 'Payload mass');
  bounded(chargeMW, 0.01, 1e6, 'Charging power');
  const transfer = transferEstimate(targetAU),
    escape2 = (2 * C.mercuryGM) / C.mercuryRadiusM;
  // Patched-conic departure approximation; surface direction, rotation and losses omitted.
  const muzzleMs = Math.sqrt(escape2 + transfer.departureDeltaMs ** 2);
  const trackM = muzzleMs ** 2 / (2 * accelerationG * 9.80665),
    accelerationSeconds = muzzleMs / (accelerationG * 9.80665);
  const inputJ =
    (payloadKg * muzzleMs ** 2) / (2 * ASSUMPTIONS.launchEfficiency);
  return {
    ...transfer,
    muzzleMs,
    trackM,
    accelerationSeconds,
    inputJ,
    chargeSeconds: inputJ / (chargeMW * 1e6),
    peakMechanicalW: payloadKg * accelerationG * 9.80665 * muzzleMs,
  };
}
export function seedDelivery(
  payloadTonnes: number,
  landerDryFraction: number,
  landingDeltaMs = 4500,
  ispSeconds = 450,
) {
  bounded(payloadTonnes, 1, 1e6, 'Surface payload');
  bounded(landerDryFraction, 0.05, 1, 'Dry lander fraction');
  const dryTonnes = payloadTonnes * (1 + landerDryFraction),
    wetTonnes = dryTonnes * Math.exp(landingDeltaMs / (9.80665 * ispSeconds));
  return {
    payloadTonnes,
    dryTonnes,
    wetTonnes,
    propellantTonnes: wetTonnes - dryTonnes,
    landingDeltaMs,
    ispSeconds,
  };
}
export function civilization(
  m: Mission,
  capturedFraction: number,
  radiatorK: number,
) {
  bounded(capturedFraction, 0.001, 0.999, 'Capture fraction');
  bounded(radiatorK, 250, 1000, 'Radiator temperature');
  // Poisson projected overlap screen; not a dense-swarm dynamical/radiative solution.
  const shellAreaM2 = 4 * Math.PI * (m.radiusAU * C.AU) ** 2,
    opticalDepth = -Math.log1p(-capturedFraction);
  const collectorAreaM2 = shellAreaM2 * opticalDepth,
    hardwareKg = collectorAreaM2 * arealDensity(m);
  const oreKg = (hardwareKg * ASSUMPTIONS.localMaterialFraction) / m.oreYield;
  const luminosityW = 4 * Math.PI * C.AU ** 2 * C.solarFluxAtEarth,
    capturedW = capturedFraction * luminosityW;
  return {
    shellAreaM2,
    opticalDepth,
    collectorAreaM2,
    hardwareKg,
    oreKg,
    mercuryFraction: oreKg / C.mercuryMassKg,
    precisionKg: hardwareKg * (1 - ASSUMPTIONS.localMaterialFraction),
    capturedW,
    electricalUpperW: capturedW * m.efficiency,
    radiatingAreaM2:
      capturedW / (ASSUMPTIONS.emissivity * C.sigma * radiatorK ** 4),
    uniformEarthSunlightRemaining: 1 - capturedFraction,
  };
}
export function spaceUses(
  powerW: number,
  radiatorK: number,
  shipKg: number,
  speedFractionC: number,
  rpm: number,
) {
  bounded(powerW, 0, 1e27, 'Power');
  bounded(radiatorK, 250, 1000, 'Radiator temperature');
  bounded(shipKg, 1, 1e12, 'Vehicle mass');
  bounded(speedFractionC, 0.001, 0.9, 'Speed fraction');
  bounded(rpm, 0.1, 10, 'Rotation');
  const gamma = 1 / Math.sqrt(1 - speedFractionC ** 2),
    kineticJ = (gamma - 1) * shipKg * 299792458 ** 2;
  return {
    computeCoolingM2: powerW / (0.9 * C.sigma * radiatorK ** 4),
    kineticJ,
    idealAccelerationYears: powerW ? kineticJ / powerW / C.yearSeconds : null,
    habitatRadiusM: 9.80665 / ((rpm * 2 * Math.PI) / 60) ** 2,
    habitatPowerEquivalentPeople: powerW / 2000,
  };
}
