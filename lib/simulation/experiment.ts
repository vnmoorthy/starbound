import { simulate, summary, validateMission, type Mission } from './engine.ts';
export const POLICY_KEYS = [
  'radiusAU',
  'radiatorRatio',
  'reinvestFraction',
  'expansionFraction',
  'linkMode',
] as const;
export const CHALLENGE = {
  year: 10,
  targetGridMW: 10,
  description:
    'Deliver at least 10 MW average grid electricity at year 10, using the least mined Mercury ore. Fixed seed, imported-tech reserve, efficiencies and transmission hardware.',
};
export function evaluateProposal(base: Mission, changes: unknown) {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes))
    throw new Error('Policy changes must be an object.');
  for (const key of Object.keys(changes))
    if (!(POLICY_KEYS as readonly string[]).includes(key))
      throw new Error(`The model cannot change ${key}.`);
  const mission = validateMission({
    ...base,
    ...changes,
    years: CHALLENGE.year,
  });
  const result = summary(simulate(mission));
  const feasible =
    result.thermalValid &&
    result.audit.passed &&
    result.gridMW >= CHALLENGE.targetGridMW;
  return {
    result,
    grade: {
      feasible,
      minedMt: result.minedMt,
      targetGridMW: CHALLENGE.targetGridMW,
      score: feasible ? 1 / (1 + result.minedMt) : 0,
    },
  };
}
