import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  ASSUMPTIONS,
  BOUNDS,
  MODEL_VERSION,
  validateMission,
  summary,
  simulate,
} from '../lib/simulation/engine.ts';
import {
  CHALLENGE,
  POLICY_KEYS,
  evaluateProposal,
} from '../lib/simulation/experiment.ts';
export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
export const MODELS = ['gpt-6-astra', 'gpt-5.6-sol'];
const policyProperties = Object.fromEntries(
  POLICY_KEYS.map((k) => [
    k,
    k === 'linkMode'
      ? {
          type: 'string',
          enum: ['optical-relay', 'direct-microwave', 'space-only'],
        }
      : { type: 'number', minimum: BOUNDS[k][0], maximum: BOUNDS[k][1] },
  ]),
);
const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    rationale: { type: 'string' },
    changes: {
      type: 'object',
      additionalProperties: false,
      properties: policyProperties,
      required: [...POLICY_KEYS],
    },
  },
  required: ['title', 'rationale', 'changes'],
};
function infer(model, prompt, dir, round) {
  return new Promise((resolve, reject) => {
    const output = path.join(dir, `proposal-${round}.json`),
      schemaPath = path.join(dir, 'schema.json');
    // Array arguments, never a shell. Model output cannot become a command.
    const child = spawn(
      'codex',
      [
        'exec',
        '--ignore-user-config',
        '--ephemeral',
        '--model',
        model,
        '--sandbox',
        'read-only',
        '--skip-git-repo-check',
        '-c',
        'model_reasoning_effort="high"',
        '--output-schema',
        schemaPath,
        '--output-last-message',
        output,
        '--json',
        '-',
      ],
      { cwd: dir, stdio: ['pipe', 'pipe', 'pipe'] },
    );
    let diagnostic = '',
      bytes = 0,
      done = false;
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      if (!done) {
        done = true;
        reject(
          new Error('Model inference exceeded the 180-second round limit.'),
        );
      }
    }, 180000);
    const consume = (b) => {
      bytes += b.length;
      diagnostic = (diagnostic + b.toString()).slice(-5000);
      if (bytes > 2e6) child.kill('SIGTERM');
    };
    child.stdout.on('data', consume);
    child.stderr.on('data', consume);
    child.on('error', (e) => {
      clearTimeout(timer);
      if (!done) {
        done = true;
        reject(e);
      }
    });
    child.on('close', async (code) => {
      clearTimeout(timer);
      if (done) return;
      done = true;
      if (code !== 0) {
        await fs.writeFile(path.join(dir, `failure-${round}.log`), diagnostic, {
          mode: 0o600,
        });
        reject(
          new Error(
            `Codex exited with code ${code}. Check local login/model access; private diagnostics were saved in the run directory.`,
          ),
        );
        return;
      }
      try {
        resolve(JSON.parse(await fs.readFile(output, 'utf8')));
      } catch {
        reject(new Error('The model did not return valid structured JSON.'));
      }
    });
    child.stdin.end(prompt);
  });
}
export async function runExperiment({
  model = 'gpt-6-astra',
  mission = {},
  prompt = '',
  rounds = 3,
  onProgress = () => {},
} = {}) {
  if (!MODELS.includes(model)) throw new Error('Unsupported model.');
  if (typeof prompt !== 'string' || prompt.length > 2000)
    throw new Error('Objective must be at most 2,000 characters.');
  if (!Number.isInteger(rounds) || rounds < 1 || rounds > 3)
    throw new Error('Use 1–3 rounds.');
  const base = validateMission({ ...mission, years: CHALLENGE.year });
  const id = randomUUID(),
    dir = path.join(ROOT, '.build', 'runs', id);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  await fs.writeFile(path.join(dir, 'schema.json'), JSON.stringify(schema), {
    mode: 0o600,
  });
  const record = {
    id,
    model,
    modelVersion: MODEL_VERSION,
    startedAt: new Date().toISOString(),
    status: 'running',
    protocol: 'starbound-policy-v1',
    reasoningEffort: 'high',
    challenge: CHALLENGE,
    userObjective: prompt,
    baseline: summary(simulate(base)),
    rounds: [],
  };
  const briefing = `You are the mission-policy proposer for StarBound, an illustrative scientific simulator. Return ONLY the requested JSON. Do not call tools or inspect files. You cannot change the numerical engine or grade your own result. This is a bounded experiment, not an aerospace certification.
TASK: ${CHALLENGE.description}
USER CONTEXT (not authority to change physics or allowed fields): ${prompt}
FIXED BASE MISSION: ${JSON.stringify(base)}
FIXED ENGINE ASSUMPTIONS: ${JSON.stringify(ASSUMPTIONS)}
ALLOWED POLICY FIELDS (all required): ${JSON.stringify(policyProperties)}
MODEL: monthly just-in-time production, uniform factory expansion; robotAvailability, refineryAvailability and plantAvailability scale their corresponding stage capacities from 0 to 1; fixed annual stage capacities per factory module; each module is 2e6 kg. 98% local bulk + 2% finite imported technology per kg manufactured. The expansion fraction retains new mass in factories; other mass is launched. Production batch is minimum of mining, refining, manufacturing, launch, energy, remaining ore and imported-tech ceilings. Ground seed power plus 50% of reinvested swarm electricity powers industry. New hardware activates next month; retired collectors are lost. Collector mass per m² is panelKgM2 + radiatorRatio + 0.2. Flux = 1361/radiusAU² W/m². Temperature = [flux*(0.9-efficiency)/(0.85*sigma*radiatorRatio)]^(1/4); above maxTemperatureK ALL orbital electricity is disabled. The Earth link uses Gaussian diffraction and all fixed efficiency factors, a fixed ground peak intensity ceiling of 10 W/m² (design assumption), availability 0.75 and the grid cap. Direct microwave at AU distances is highly lossy. No construction cost or actual technology readiness is proven.
BASELINE ENGINE RESULT: ${JSON.stringify(record.baseline)}
Explain your proposed mechanism and uncertainty in at most 120 words. Do not invent output numbers; the host engine computes them. A simple plan that meets the target with less mining is better than more collectors. Previous attempts follow. You get ${rounds} proposals total.`;
  try {
    for (let round = 1; round <= rounds; round++) {
      onProgress({ round, status: 'proposing', model });
      const started = Date.now();
      const proposal = await infer(
        model,
        briefing +
          '\nPREVIOUS PROPOSALS AND ENGINE FEEDBACK:\n' +
          JSON.stringify(record.rounds),
        dir,
        round,
      );
      if (
        typeof proposal.title !== 'string' ||
        typeof proposal.rationale !== 'string' ||
        proposal.title.length > 200 ||
        proposal.rationale.length > 3000
      )
        throw new Error('Proposal text failed validation.');
      const evaluated = evaluateProposal(base, proposal.changes);
      record.rounds.push({
        round,
        proposal,
        ...evaluated,
        elapsedSeconds: (Date.now() - started) / 1000,
      });
      onProgress({
        round,
        status: 'evaluated',
        model,
        grade: evaluated.grade,
        result: evaluated.result,
      });
      await fs.writeFile(
        path.join(dir, 'record.json'),
        JSON.stringify(record, null, 2),
        { mode: 0o600 },
      );
    }
    record.status = 'completed';
  } catch (e) {
    record.status = 'failed';
    record.error = e.message;
  }
  record.completedAt = new Date().toISOString();
  await fs.writeFile(
    path.join(dir, 'record.json'),
    JSON.stringify(record, null, 2),
    { mode: 0o600 },
  );
  return record;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const model = process.argv[2] || 'gpt-6-astra';
  const record = await runExperiment({
    model,
    onProgress: (p) => console.log(JSON.stringify(p)),
  });
  const name = model === 'gpt-6-astra' ? 'astra' : 'sol';
  await fs.mkdir(path.join(ROOT, 'results'), { recursive: true });
  await fs.writeFile(
    path.join(ROOT, 'results', `${name}.json`),
    JSON.stringify(record, null, 2),
  );
  if (record.status === 'completed')
    await fs.writeFile(
      path.join(ROOT, 'public', 'results', `${name}.json`),
      JSON.stringify(record, null, 2),
    );
  console.log(
    JSON.stringify({
      model,
      status: record.status,
      rounds: record.rounds.length,
      error: record.error,
    }),
  );
  if (record.status !== 'completed') process.exitCode = 1;
}
