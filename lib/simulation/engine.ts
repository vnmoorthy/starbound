/** StarBound v1: an auditable, monthly stock-and-flow model, NOT a flight simulator.
 * SI internally. See docs/PHYSICS.md for equations, boundaries and omissions.
 * No network, randomness, model calls, or mutable global state in this module.
 */
export const MODEL_VERSION = '1.1.0';
export const C = Object.freeze({
  AU: 149_597_870_700,
  solarFluxAtEarth: 1361,
  sigma: 5.670374419e-8,
  yearSeconds: 365.25 * 86400,
  earthRadiusM: 6_371_000,
  mercuryMassKg: 3.30103e23,
  mercuryRadiusM: 2_439_400,
  mercuryGM: 2.203186855e13,
  solarGM: 1.32712440018e20,
});
export type LinkMode = 'optical-relay' | 'direct-microwave' | 'space-only';
export interface Mission {
  years: number;
  radiusAU: number;
  seedPowerMW: number;
  reinvestFraction: number;
  expansionFraction: number;
  panelKgM2: number;
  radiatorRatio: number;
  efficiency: number;
  maxTemperatureK: number;
  annualLoss: number;
  oreYield: number;
  oreBudgetMt: number;
  importedTechKt: number;
  launchMultiplier: number;
  shockYear: number;
  shockSeverity: number;
  linkMode: LinkMode;
  transmitterM: number;
  receiverM: number;
  pointingNrad: number;
  groundReceiverKm: number;
  gridLimitGW: number;
  phaseDegrees: number;
  robotAvailability: number;
  refineryAvailability: number;
  plantAvailability: number;
}
export const DEFAULT_MISSION: Mission = Object.freeze({
  years: 30,
  radiusAU: 0.4,
  seedPowerMW: 20,
  reinvestFraction: 0.65,
  expansionFraction: 0.18,
  panelKgM2: 2,
  radiatorRatio: 2,
  efficiency: 0.3,
  maxTemperatureK: 600,
  annualLoss: 0.02,
  oreYield: 0.25,
  oreBudgetMt: 1000,
  importedTechKt: 20,
  launchMultiplier: 1,
  shockYear: 3,
  shockSeverity: 0,
  linkMode: 'optical-relay',
  transmitterM: 100,
  receiverM: 1000,
  pointingNrad: 2,
  groundReceiverKm: 5,
  gridLimitGW: 5,
  phaseDegrees: 120,
  robotAvailability: 1,
  refineryAvailability: 1,
  plantAvailability: 1,
});
export const BOUNDS: Record<
  Exclude<keyof Mission, 'linkMode'>,
  [number, number]
> = {
  years: [1, 100],
  radiusAU: [0.3, 1],
  seedPowerMW: [1, 200],
  reinvestFraction: [0, 0.95],
  expansionFraction: [0, 0.6],
  panelKgM2: [0.5, 20],
  radiatorRatio: [0.5, 8],
  efficiency: [0.1, 0.4],
  maxTemperatureK: [350, 900],
  annualLoss: [0, 0.2],
  oreYield: [0.01, 0.8],
  oreBudgetMt: [0.001, 10000],
  importedTechKt: [0, 1000],
  launchMultiplier: [0.1, 5],
  shockYear: [1, 100],
  shockSeverity: [0, 1],
  transmitterM: [1, 1000],
  receiverM: [10, 10000],
  pointingNrad: [0, 1000],
  groundReceiverKm: [0.1, 20],
  gridLimitGW: [0.001, 100],
  phaseDegrees: [0, 180],
  robotAvailability: [0, 1],
  refineryAvailability: [0, 1],
  plantAvailability: [0, 1],
};
export function validateMission(input: unknown): Mission {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Mission must be an object.');
  const value = input as Record<string, unknown>;
  for (const key of Object.keys(value))
    if (!Object.hasOwn(DEFAULT_MISSION, key))
      throw new Error(`Unknown mission field: ${key}`);
  const m = { ...DEFAULT_MISSION, ...value } as Mission;
  for (const [key, [min, max]] of Object.entries(BOUNDS)) {
    const n = m[key as keyof typeof BOUNDS];
    if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max)
      throw new Error(`${key} must be between ${min} and ${max}.`);
  }
  if (!['optical-relay', 'direct-microwave', 'space-only'].includes(m.linkMode))
    throw new Error('Unknown link mode.');
  return m;
}
export const ASSUMPTIONS = Object.freeze({
  localMaterialFraction: 0.98,
  factoryModuleKg: 2e6,
  miningKgPerYear: 40e6,
  refiningKgPerYear: 10e6,
  manufacturingKgPerYear: 8e6,
  launchKgPerYear: 6e6,
  miningJPerKgOre: 4e6,
  refiningJPerKgMaterial: 80e6,
  manufacturingJPerKg: 40e6,
  launchEfficiency: 0.5,
  transferJPerKg: 25e6,
  radiatorKgM2: 1,
  balanceOfPlantKgM2: 0.2,
  absorptivity: 0.9,
  emissivity: 0.85,
  returnLinkEfficiency: 0.5,
  surfaceOperationsFraction: 0.08,
  opticalTxEfficiency: 0.4,
  opticalReceiverEfficiency: 0.5,
  microwaveTxEfficiency: 0.7,
  rectennaEfficiency: 0.85,
  gridEfficiency: 0.95,
  atmosphereTransmission: 0.85,
  linkAvailability: 0.75,
  geoDistanceM: 35_786_000,
  geoTransmitterM: 1000,
  groundPeakFluxCeilingWm2: 10, // Design assumption, NOT a human exposure standard.
  microwaveWavelengthM: 0.0517,
  opticalWavelengthM: 1.064e-6,
});
export function solarFlux(radiusAU: number) {
  return C.solarFluxAtEarth / radiusAU ** 2;
}
export function collectorTemperature(m: Mission) {
  return (
    ((solarFlux(m.radiusAU) * (ASSUMPTIONS.absorptivity - m.efficiency)) /
      (ASSUMPTIONS.emissivity * C.sigma * m.radiatorRatio)) **
    0.25
  );
}
export function arealDensity(m: Mission) {
  return (
    m.panelKgM2 +
    m.radiatorRatio * ASSUMPTIONS.radiatorKgM2 +
    ASSUMPTIONS.balanceOfPlantKgM2
  );
}
/** Gaussian intensity beam with waist D/2 and circular centered receiver.
 * Pointing jitter is an approximate isotropic broadening, not tracking validation. */
export function gaussianLink(
  wavelengthM: number,
  distanceM: number,
  transmitterM: number,
  receiverM: number,
  jitterRad = 0,
) {
  const waist = transmitterM / 2;
  const diffractionRadiusM = Math.hypot(
    waist,
    (wavelengthM * distanceM) / (Math.PI * waist),
  );
  const radiusM = Math.hypot(diffractionRadiusM, 2 * distanceM * jitterRad);
  const capture = -Math.expm1(-2 * (receiverM / 2 / radiusM) ** 2);
  return { radiusM, capture, diffractionRadiusM };
}
export function powerLink(offeredW: number, m: Mission) {
  const a = ASSUMPTIONS;
  const distanceM =
    C.AU *
    Math.sqrt(
      1 +
        m.radiusAU ** 2 -
        2 * m.radiusAU * Math.cos((m.phaseDegrees * Math.PI) / 180),
    );
  const optical = m.linkMode === 'optical-relay';
  const angle = (m.phaseDegrees * Math.PI) / 180;
  const sx = m.radiusAU * Math.cos(angle),
    sy = m.radiusAU * Math.sin(angle);
  const dx = 1 - sx,
    dy = -sy;
  const t = Math.max(
    0,
    Math.min(1, -(sx * dx + sy * dy) / (dx * dx + dy * dy || 1)),
  );
  const sunBlocked = Math.hypot(sx + t * dx, sy + t * dy) < 695_700_000 / C.AU;
  const first = gaussianLink(
    optical ? a.opticalWavelengthM : a.microwaveWavelengthM,
    distanceM,
    m.transmitterM,
    optical ? m.receiverM : m.groundReceiverKm * 1000,
    m.pointingNrad * 1e-9,
  );
  const geo = gaussianLink(
    a.microwaveWavelengthM,
    a.geoDistanceM,
    a.geoTransmitterM,
    m.groundReceiverKm * 1000,
  );
  const enabledW = m.linkMode === 'space-only' || sunBlocked ? 0 : offeredW;
  const launchedBeamW =
    enabledW * (optical ? a.opticalTxEfficiency : a.microwaveTxEfficiency);
  const firstCapturedW = launchedBeamW * first.capture;
  const secondBeamW = optical
    ? firstCapturedW * a.opticalReceiverEfficiency * a.microwaveTxEfficiency
    : launchedBeamW;
  const finalBeam = optical ? geo : first;
  // Peak intensity, not aperture-average intensity, limits the beam.
  const fluxCapW =
    (a.groundPeakFluxCeilingWm2 * Math.PI * finalBeam.radiusM ** 2) / 2;
  const gridCapBeamW =
    (m.gridLimitGW * 1e9) /
    Math.max(
      1e-30,
      finalBeam.capture *
        a.atmosphereTransmission *
        a.rectennaEfficiency *
        a.gridEfficiency,
    );
  const usedBeamW = Math.min(secondBeamW, fluxCapW, gridCapBeamW);
  const groundIncidentW =
    usedBeamW *
    finalBeam.capture *
    a.atmosphereTransmission *
    a.linkAvailability;
  const gridW = groundIncidentW * a.rectennaEfficiency * a.gridEfficiency;
  return {
    distanceM,
    sunBlocked,
    beamRadiusM: first.radiusM,
    captureFraction: first.capture,
    launchedBeamW,
    firstCapturedW,
    secondBeamW,
    groundIncidentW,
    gridW,
    efficiency: offeredW > 0 ? gridW / offeredW : 0,
    groundPeakWm2: usedBeamW / ((Math.PI * finalBeam.radiusM ** 2) / 2),
    curtailedBeamW: secondBeamW - usedBeamW,
    earthHeatWm2: groundIncidentW / (4 * Math.PI * C.earthRadiusM ** 2),
  };
}
export type Bottleneck =
  | 'energy'
  | 'mining'
  | 'refining'
  | 'manufacturing'
  | 'launch'
  | 'imports'
  | 'ore quota'
  | 'coverage limit';
export interface Snapshot {
  year: number;
  activeKg: number;
  activeAreaM2: number;
  retiredKg: number;
  minedKg: number;
  tailingsKg: number;
  importedUsedKg: number;
  manufacturedKg: number;
  launchedKg: number;
  factoryKg: number;
  factoryModules: number;
  grossPowerW: number;
  interceptedW: number;
  thermalWasteW: number;
  surfacePowerW: number;
  exportOfferedW: number;
  gridW: number;
  cumulativeGridMWh: number;
  cumulativeProcessJ: number;
  cumulativeAvailableJ: number;
  bottleneck: Bottleneck;
  batchKg: number;
  massResidualKg: number;
  stageUtilization: number[];
  coverageFraction: number;
}
export interface Simulation {
  version: string;
  mission: Mission;
  rows: Snapshot[];
  final: Snapshot;
  temperatureK: number;
  thermalValid: boolean;
  densityKgM2: number;
  escapeSpeedMs: number;
  escapeLowerBoundJkg: number;
  launchJkg: number;
  link: ReturnType<typeof powerLink>;
  warnings: string[];
  firstGridMWYear: number | null;
  audit: {
    maxMassResidualKg: number;
    energyUtilization: number;
    passed: boolean;
  };
}
export function simulate(input: Partial<Mission> = {}): Simulation {
  const m = validateMission(input),
    a = ASSUMPTIONS;
  const temperatureK = collectorTemperature(m),
    thermalValid = temperatureK <= m.maxTemperatureK;
  const densityKgM2 = arealDensity(m),
    flux = solarFlux(m.radiusAU);
  const escapeLowerBoundJkg = C.mercuryGM / C.mercuryRadiusM;
  const launchJkg = escapeLowerBoundJkg / a.launchEfficiency + a.transferJPerKg;
  const local = a.localMaterialFraction,
    importedFraction = 1 - local;
  const energyPerKg =
    (local / m.oreYield) * a.miningJPerKgOre +
    local * a.refiningJPerKgMaterial +
    a.manufacturingJPerKg +
    (1 - m.expansionFraction) * launchJkg;
  let activeKg = 0,
    retiredKg = 0,
    minedKg = 0,
    importedUsedKg = 0,
    manufacturedKg = 0,
    launchedKg = 0,
    factoryKg = 0;
  let cumulativeGridMWh = 0,
    cumulativeProcessJ = 0,
    cumulativeAvailableJ = 0,
    maxMassResidualKg = 0;
  let bottleneck: Bottleneck = 'energy',
    batchKg = 0,
    stageUtilization = [0, 0, 0, 0];
  const rows: Snapshot[] = [];
  const metrics = (year: number): Snapshot => {
    const activeAreaM2 = activeKg / densityKgM2;
    const interceptedW = activeAreaM2 * flux;
    const grossPowerW = thermalValid ? interceptedW * m.efficiency : 0;
    const exportOfferedW = grossPowerW * (1 - m.reinvestFraction);
    const surfacePowerW =
      m.seedPowerMW * 1e6 +
      grossPowerW * m.reinvestFraction * a.returnLinkEfficiency;
    const tailingsKg = minedKg * (1 - m.oreYield);
    const massResidualKg =
      minedKg + importedUsedKg - tailingsKg - factoryKg - activeKg - retiredKg;
    maxMassResidualKg = Math.max(maxMassResidualKg, Math.abs(massResidualKg));
    return {
      year,
      activeKg,
      activeAreaM2,
      retiredKg,
      minedKg,
      tailingsKg,
      importedUsedKg,
      manufacturedKg,
      launchedKg,
      factoryKg,
      factoryModules: 1 + factoryKg / a.factoryModuleKg,
      grossPowerW,
      interceptedW,
      thermalWasteW: interceptedW * a.absorptivity - grossPowerW,
      surfacePowerW,
      exportOfferedW,
      gridW: powerLink(exportOfferedW, m).gridW,
      cumulativeGridMWh,
      cumulativeProcessJ,
      cumulativeAvailableJ,
      bottleneck,
      batchKg,
      massResidualKg,
      stageUtilization,
      coverageFraction: activeAreaM2 / (4 * Math.PI * (m.radiusAU * C.AU) ** 2),
    };
  };
  rows.push(metrics(0));
  const steps = Math.ceil(m.years * 12);
  for (let i = 0; i < steps; i++) {
    const dtYears = Math.min(1 / 12, m.years - i / 12),
      dt = dtYears * C.yearSeconds;
    const start = rows.at(-1)!;
    const processBudgetJ =
      start.surfacePowerW * (1 - a.surfaceOperationsFraction) * dt;
    const loss = activeKg * (1 - (1 - m.annualLoss) ** dtYears);
    activeKg -= loss;
    retiredKg += loss;
    const modules = start.factoryModules;
    const launchFactor =
      m.launchMultiplier * (i / 12 >= m.shockYear ? 1 - m.shockSeverity : 1);
    const capacity = [
      a.miningKgPerYear * modules * dtYears * m.robotAvailability,
      a.refiningKgPerYear * modules * dtYears * m.refineryAvailability,
      a.manufacturingKgPerYear * modules * dtYears * m.plantAvailability,
      a.launchKgPerYear * modules * dtYears * launchFactor,
    ];
    // Just-in-time aggregate batch: no stage can consume unavailable mass or energy.
    const ceilings: [Bottleneck, number][] = [
      ['energy', processBudgetJ / energyPerKg],
      ['mining', (capacity[0] * m.oreYield) / local],
      ['refining', capacity[1] / local],
      ['manufacturing', capacity[2]],
      ['launch', capacity[3] / (1 - m.expansionFraction)],
      [
        'imports',
        Math.max(0, m.importedTechKt * 1e6 - importedUsedKg) / importedFraction,
      ],
      [
        'ore quota',
        (Math.max(0, m.oreBudgetMt * 1e9 - minedKg) * m.oreYield) / local,
      ],
      [
        'coverage limit',
        Math.max(
          0,
          0.01 * 4 * Math.PI * (m.radiusAU * C.AU) ** 2 * densityKgM2 -
            activeKg,
        ) /
          (1 - m.expansionFraction),
      ],
    ];
    ceilings.sort((x, y) => x[1] - y[1]);
    [bottleneck, batchKg] = ceilings[0];
    batchKg = Math.max(0, batchKg);
    const ore = (batchKg * local) / m.oreYield;
    const imported = batchKg * importedFraction;
    const builtFactory = batchKg * m.expansionFraction;
    const builtCollectors = batchKg - builtFactory;
    minedKg += ore;
    importedUsedKg += imported;
    manufacturedKg += batchKg;
    factoryKg += builtFactory;
    launchedKg += builtCollectors;
    activeKg += builtCollectors;
    cumulativeProcessJ += batchKg * energyPerKg;
    cumulativeAvailableJ += processBudgetJ;
    cumulativeGridMWh += (start.gridW * dt) / 3.6e9;
    stageUtilization = [
      capacity[0] > 0 ? ore / capacity[0] : 0,
      capacity[1] > 0 ? (batchKg * local) / capacity[1] : 0,
      capacity[2] > 0 ? batchKg / capacity[2] : 0,
      capacity[3] > 0 ? builtCollectors / capacity[3] : 0,
    ];
    rows.push(metrics(Math.min((i + 1) / 12, m.years)));
  }
  const final = rows.at(-1)!,
    link = powerLink(final.exportOfferedW, m);
  const warnings = [
    'Illustrative engineering scenario; no forecast of construction cost or readiness.',
    'Circular display orbits are schematic. Collisions, eccentricity, station keeping and launch trajectories are not integrated.',
    'Seed plant, imported technology reserve and Earth relay infrastructure are starting endowments; their delivery and capital cost are excluded.',
  ];
  if (!thermalValid)
    warnings.push(
      `Collector equilibrium is ${Math.round(temperatureK)} K, above the ${m.maxTemperatureK} K limit. Orbital electrical output is disabled.`,
    );
  if (final.bottleneck === 'imports')
    warnings.push(
      'Imported precision components are exhausted; industrial self-replication is not assumed.',
    );
  if (m.linkMode === 'direct-microwave')
    warnings.push(
      'Interplanetary microwave diffraction makes this aperture combination extremely inefficient.',
    );
  if (link.sunBlocked)
    warnings.push(
      'The Sun blocks this link geometry. Transmission is disabled.',
    );
  if (link.curtailedBeamW > 0)
    warnings.push(
      'Ground beam intensity or instantaneous grid capacity curtails transmission.',
    );
  if (final.coverageFraction >= 0.0099)
    warnings.push(
      'The 1% coverage boundary is reached; this sparse-swarm model cannot simulate a complete Dyson sphere.',
    );
  const tolerance = Math.max(1, manufacturedKg) * 1e-8;
  return {
    version: MODEL_VERSION,
    mission: m,
    rows,
    final,
    temperatureK,
    thermalValid,
    densityKgM2,
    escapeSpeedMs: Math.sqrt(2 * escapeLowerBoundJkg),
    escapeLowerBoundJkg,
    launchJkg,
    link,
    warnings,
    firstGridMWYear: rows.find((r) => r.gridW >= 1e6)?.year ?? null,
    audit: {
      maxMassResidualKg,
      energyUtilization: cumulativeAvailableJ
        ? cumulativeProcessJ / cumulativeAvailableJ
        : 0,
      passed:
        maxMassResidualKg < tolerance &&
        cumulativeProcessJ <= cumulativeAvailableJ * (1 + 1e-10) &&
        final.importedUsedKg <= m.importedTechKt * 1e6 + 1 &&
        final.minedKg <= m.oreBudgetMt * 1e9 + 1,
    },
  };
}
export function impacts(gridW: number) {
  const annualKWh = (gridW / 1000) * 8766;
  return {
    annualTWh: annualKWh / 1e9,
    households: annualKWh / 4000,
    waterM3: annualKWh / 4,
    hydrogenKg: annualKWh / 55,
    computeMW: gridW / 1e6,
    avoidedOperationalCO2Tonnes: (annualKWh * 0.4) / 1000,
  };
}
export function formatSI(value: number, unit: string, digits = 2) {
  if (value === 0) return `0 ${unit}`;
  for (const [scale, prefix] of [
    [1e18, 'E'],
    [1e15, 'P'],
    [1e12, 'T'],
    [1e9, 'G'],
    [1e6, 'M'],
    [1e3, 'k'],
  ] as const)
    if (Math.abs(value) >= scale)
      return `${(value / scale).toLocaleString('en-US', { maximumFractionDigits: digits })} ${prefix}${unit}`;
  return `${value.toLocaleString('en-US', { maximumFractionDigits: Math.abs(value) < 0.01 ? 6 : digits })} ${unit}`;
}
export function summary(s: Simulation) {
  return {
    modelVersion: s.version,
    mission: s.mission,
    year: s.final.year,
    gridMW: s.final.gridW / 1e6,
    generatedGW: s.final.grossPowerW / 1e9,
    cumulativeGridTWh: s.final.cumulativeGridMWh / 1e6,
    areaKm2: s.final.activeAreaM2 / 1e6,
    minedMt: s.final.minedKg / 1e9,
    importedUsedKt: s.final.importedUsedKg / 1e6,
    factoryModules: s.final.factoryModules,
    temperatureK: s.temperatureK,
    linkEfficiency: s.link.efficiency,
    bottleneck: s.final.bottleneck,
    thermalValid: s.thermalValid,
    audit: s.audit,
    warnings: s.warnings,
  };
}
