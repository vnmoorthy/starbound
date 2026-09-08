'use client';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  FlaskConical,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import { REPO, fmt } from './mission-control';
import { summary, type Mission } from '@/lib/simulation/engine';
type Trial = {
  model: string;
  status: string;
  rounds: {
    round: number;
    proposal: { title: string; rationale: string; changes: Partial<Mission> };
    result: ReturnType<typeof summary>;
    elapsedSeconds: number;
  }[];
  error?: string;
};
type Comparison = {
  verdict: string;
  astra: { totalSeconds: number; best: { result: ReturnType<typeof summary> } };
  sol: { totalSeconds: number; best: { result: ReturnType<typeof summary> } };
  search: { evaluations: number; best: { result: ReturnType<typeof summary> } };
};
export default function AstraLab({
  mission,
  apply,
}: {
  mission: Mission;
  apply: (m: Mission) => void;
}) {
  const [record, setRecord] = useState<Trial | null>(null),
    [state, setState] = useState('idle'),
    [error, setError] = useState('');
  const [source, setSource] = useState('recorded'),
    [progress, setProgress] = useState<{
      round: number;
      status: string;
    } | null>(null),
    [comparison, setComparison] = useState<Comparison | null>(null);
  const [prompt, setPrompt] = useState(
    'Deliver at least 10 MW average electricity to Earth at year 10 while minimizing Mercury mining. Keep the seed plant, imported-component budget, link hardware and physics assumptions fixed. Explain the binding constraint.',
  );
  useEffect(() => {
    fetch('/results/astra.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => {
        const trial = r as Trial | null;
        if (trial && Array.isArray(trial.rounds)) setRecord(trial);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    fetch('/results/comparison.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => {
        const c = r as Comparison | null;
        if (c?.astra?.best && c?.sol?.best && c?.search?.best) setComparison(c);
      })
      .catch(() => {});
  }, []);
  const run = async () => {
    setError('');
    setState('running');
    let interval: ReturnType<typeof setInterval> | undefined;
    try {
      const token =
        new URLSearchParams(window.location.hash.slice(1)).get('lab') ?? '';
      if (!token)
        throw new Error(
          'Start npm run lab on your laptop, then open the local URL printed in the terminal. The public site contains the replay and the numerical simulator.',
        );
      interval = setInterval(() => {
        fetch('http://127.0.0.1:8766/progress', {
          headers: { 'X-StarBound-Token': token },
        })
          .then((r) => r.json())
          .then((d) => {
            const p = d as {
              progress: { round: number; status: string } | null;
            };
            setProgress(p.progress);
          })
          .catch(() => {});
      }, 1500);
      const res = await fetch('http://127.0.0.1:8766/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-StarBound-Token': token,
        },
        body: JSON.stringify({ mission, prompt, model: 'gpt-6-astra' }),
      });
      const data = (await res.json()) as Trial;
      if (!res.ok) throw new Error(data.error ?? 'The local Astra run failed.');
      if (!Array.isArray(data.rounds))
        throw new Error('Invalid experiment response.');
      setRecord(data);
      setSource('live');
      if (data.status !== 'completed')
        throw new Error(data.error ?? 'Experiment did not complete.');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not connect to the local Astra runner.',
      );
    } finally {
      if (interval) clearInterval(interval);
      setState('idle');
      setProgress(null);
    }
  };
  return (
    <>
      <div className="page-intro">
        <span className="eyebrow">ASTRA / SCIENTIFIC EXPERIMENT LOOP</span>
        <h1>
          Give ambition
          <br />a reality check.
        </h1>
        <p>
          Astra proposes a change. The engine measures it. Astra receives the
          result and revises its plan. The model cannot edit the physics or
          grade its own answer.
        </p>
      </div>
      <div className="lab-layout">
        <section className="lab-console">
          <div className="section-line">
            <span>MISSION OBJECTIVE</span>
            <span>3 ITERATIONS</span>
          </div>
          <textarea
            aria-label="Astra experiment objective"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={2000}
          />
          <div className="lab-command">
            <code>npm run lab</code>
            <span>Uses your local Codex login</span>
          </div>
          <Button
            className="run-astra"
            onClick={run}
            disabled={state === 'running'}
          >
            {state === 'running' ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <Sparkles size={16} />
            )}{' '}
            {state === 'running'
              ? 'Astra is testing and revising…'
              : 'Run Astra experiment'}
            <ArrowRight size={16} />
          </Button>
          {error && (
            <p className="lab-error" role="alert">
              {error}
            </p>
          )}
          <small>
            Live inference runs on your laptop with GPT-6 Astra. No login token
            or API key is sent to this website’s server. Public visitors can
            inspect the recorded experiment below.
          </small>
        </section>
        <section className="lab-contract">
          <h2>The experiment contract</h2>
          <ol>
            <li>
              <strong>Propose.</strong> Change bounded mission policies, not
              constants or evidence.
            </li>
            <li>
              <strong>Evaluate.</strong> Run the deterministic engine used by
              every slider.
            </li>
            <li>
              <strong>Revise.</strong> Read measured outcomes and identify the
              constraint.
            </li>
          </ol>
          <p>
            This task can also be tested with Sol and ordinary numerical search.
            Comparative results are published only when measured.
          </p>
          <a
            href={`${REPO}/blob/main/docs/ASTRA.md`}
            target="_blank"
            rel="noreferrer"
          >
            Model contract & fair comparison
            <ArrowUpRight size={14} />
          </a>
        </section>
      </div>
      {state === 'running' && (
        <output className="live-progress">
          {progress
            ? `Iteration ${progress.round} / 3 — ${progress.status}`
            : 'Connecting to the local Astra runner…'}
        </output>
      )}
      <div className="section-line recorded-heading">
        <span>
          {record
            ? `${record.model.toUpperCase()} / ${source.toUpperCase()} ${record.status.toUpperCase()} RUN`
            : 'EXPERIMENT RECORD'}
        </span>
        <span>MODEL PROPOSALS · ENGINE SCORES</span>
      </div>
      {record && record.rounds.length > 0 ? (
        <div className="experiment-rounds">
          {record.rounds.map((t) => (
            <article key={t.round}>
              <div className="round-id">
                ITERATION 0{t.round}
                <span>{fmt(t.elapsedSeconds)} s</span>
              </div>
              <h3>{t.proposal.title}</h3>
              <p>{t.proposal.rationale}</p>
              <div className="round-metrics">
                <span>
                  Earth <strong>{fmt(t.result.gridMW, 2)} MW</strong>
                </span>
                <span>
                  Mining <strong>{fmt(t.result.minedMt, 3)} Mt</strong>
                </span>
                <span>
                  Thermal{' '}
                  <strong>{t.result.thermalValid ? 'PASS' : 'FAIL'}</strong>
                </span>
              </div>
              <small>Binding constraint: {t.result.bottleneck}</small>
              <Button variant="outline" onClick={() => apply(t.result.mission)}>
                Apply & recalculate
                <ArrowRight size={14} />
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <div className="no-record">
          <FlaskConical size={24} />
          <h3>No experiment has been recorded yet.</h3>
          <p>Start the local runner to produce a real Astra trace.</p>
        </div>
      )}
      {comparison && (
        <section className="comparison">
          <h2>The same challenge. A transparent comparison.</h2>
          <p>
            10 MW at the month-120 endpoint, after availability. Minimize
            cumulative mining. One experiment per model, three successive
            proposals.
          </p>
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Evaluations</th>
                <th>Best mining</th>
                <th>Earth power</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Astra', n: 3, r: comparison.astra.best.result },
                { name: 'Sol', n: 3, r: comparison.sol.best.result },
                {
                  name: 'Coarse grid',
                  n: comparison.search.evaluations,
                  r: comparison.search.best.result,
                },
              ].map(({ name, n, r }) => (
                <tr key={String(name)}>
                  <td>{String(name)}</td>
                  <td>{String(n)}</td>
                  <td>
                    {fmt((r as ReturnType<typeof summary>).minedMt, 6)} Mt
                  </td>
                  <td>{fmt((r as ReturnType<typeof summary>).gridMW, 3)} MW</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>{comparison.verdict}</p>
          <small>
            The search uses more evaluations. Equal requested effort does not
            imply equal cost or compute.{' '}
            <a href="/results/comparison.json" target="_blank" rel="noreferrer">
              Inspect the complete result JSON ↗
            </a>
          </small>
        </section>
      )}
    </>
  );
}
