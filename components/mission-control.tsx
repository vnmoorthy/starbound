'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  FlaskConical,
  GitBranch as Github,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrbitalScene from './orbital-scene';
import {
  RobotControl,
  PlantControl,
  CollectorControl,
  CivilizationView,
  ScenarioPicker,
  Dial,
} from './operations-views';
import { BuildView, EnergyView, MethodsView } from './mission-views';
import AstraLab from './astra-lab';
import {
  DEFAULT_MISSION,
  C,
  formatSI,
  powerLink,
  simulate,
  solarFlux,
  summary,
  validateMission,
  type Mission,
  type Snapshot,
} from '@/lib/simulation/engine';
export const REPO = 'https://github.com/vnmoorthy/starbound';
export const fmt = (n: number, d = 1) =>
  n.toLocaleString('en-US', { maximumFractionDigits: d });
export function download(
  name: string,
  text: string,
  type = 'application/json',
) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function Metric({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`metric ${accent ? 'accent' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}
type Control = {
  key: Exclude<keyof Mission, 'linkMode'>;
  label: string;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  factor?: number;
};
const controls: Record<string, Control[]> = {
  swarm: [
    {
      key: 'radiusAU',
      label: 'Orbital radius',
      min: 0.3,
      max: 1,
      step: 0.01,
      suffix: 'AU',
    },
    {
      key: 'efficiency',
      label: 'Conversion efficiency',
      min: 10,
      max: 40,
      suffix: '%',
      factor: 100,
    },
    {
      key: 'panelKgM2',
      label: 'Collector mass',
      min: 0.5,
      max: 20,
      step: 0.5,
      suffix: 'kg/m²',
    },
    {
      key: 'radiatorRatio',
      label: 'Radiator area ratio',
      min: 0.5,
      max: 8,
      step: 0.1,
      suffix: '×',
    },
    {
      key: 'annualLoss',
      label: 'Annual retirement',
      min: 0,
      max: 20,
      step: 0.5,
      suffix: '%',
      factor: 100,
    },
  ],
  industry: [
    { key: 'seedPowerMW', label: 'Seed plant', min: 1, max: 200, suffix: 'MW' },
    {
      key: 'reinvestFraction',
      label: 'Power reinvestment',
      min: 0,
      max: 95,
      suffix: '%',
      factor: 100,
    },
    {
      key: 'expansionFraction',
      label: 'Factory expansion share',
      min: 0,
      max: 60,
      suffix: '%',
      factor: 100,
    },
    {
      key: 'oreYield',
      label: 'Ore recovery yield',
      min: 1,
      max: 80,
      suffix: '%',
      factor: 100,
    },
    {
      key: 'importedTechKt',
      label: 'Imported components',
      min: 0,
      max: 100,
      suffix: 'kt',
    },
    {
      key: 'launchMultiplier',
      label: 'Launch throughput',
      min: 0.1,
      max: 5,
      step: 0.1,
      suffix: '×',
    },
    {
      key: 'shockSeverity',
      label: 'Launcher loss from year 3',
      min: 0,
      max: 100,
      suffix: '%',
      factor: 100,
    },
  ],
  link: [
    {
      key: 'transmitterM',
      label: 'Transmitter diameter',
      min: 10,
      max: 1000,
      step: 10,
      suffix: 'm',
    },
    {
      key: 'receiverM',
      label: 'Optical relay receiver',
      min: 100,
      max: 10000,
      step: 100,
      suffix: 'm',
    },
    {
      key: 'pointingNrad',
      label: 'Pointing jitter',
      min: 0,
      max: 100,
      suffix: 'nrad',
    },
    {
      key: 'phaseDegrees',
      label: 'Earth phase angle',
      min: 0,
      max: 180,
      suffix: '°',
    },
    {
      key: 'groundReceiverKm',
      label: 'Ground receiver diameter',
      min: 0.1,
      max: 20,
      step: 0.1,
      suffix: 'km',
    },
  ],
};
function Trajectory({ rows, year }: { rows: Snapshot[]; year: number }) {
  const w = 900,
    h = 150,
    pad = 24,
    max = Math.max(1, ...rows.map((r) => r.gridW)),
    last = rows.at(-1)!;
  const points = rows
    .map(
      (r) =>
        `${pad + (r.year / last.year) * (w - pad * 2)},${h - pad - (r.gridW / max) * (h - pad * 2)}`,
    )
    .join(' ');
  return (
    <div className="trajectory">
      <div className="section-line">
        <span>EARTH POWER / PROJECTED TRAJECTORY</span>
        <small>0 — {formatSI(max, 'W')}</small>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        aria-label="Projected average electrical power delivered to Earth over time"
      >
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={pad}
            y1={h - pad - t * (h - pad * 2)}
            x2={w - pad}
            y2={h - pad - t * (h - pad * 2)}
            stroke="#20303c"
            strokeDasharray="3 5"
          />
        ))}
        <polygon
          points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`}
          fill="#84bfee0c"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#9bc9ec"
          strokeWidth="2"
        />
        <line
          x1={pad + (year / last.year) * (w - pad * 2)}
          x2={pad + (year / last.year) * (w - pad * 2)}
          y1="10"
          y2={h - pad}
          stroke="#f3c181"
        />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text
            key={t}
            x={pad + t * (w - pad * 2)}
            y={h - 4}
            textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'}
            fill="#8495a2"
            fontSize="10"
            fontFamily="monospace"
          >
            Y{fmt(last.year * t)}
          </text>
        ))}
      </svg>
    </div>
  );
}
export default function MissionControl() {
  const [mission, setMission] = useState<Mission>({ ...DEFAULT_MISSION });
  const [year, setYear] = useState(DEFAULT_MISSION.years),
    [playing, setPlaying] = useState(false);
  const [settings, setSettings] = useState('swarm'),
    [tab, setTab] = useState('mission'),
    [notice, setNotice] = useState('');
  const upload = useRef<HTMLInputElement>(null),
    sim = useMemo(() => simulate(mission), [mission]);
  const row = sim.rows[Math.min(sim.rows.length - 1, Math.round(year * 12))],
    link = powerLink(row.exportOfferedW, mission);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () =>
        setYear((y) => {
          if (y >= mission.years) {
            setPlaying(false);
            return mission.years;
          }
          return Math.min(mission.years, y + 0.1);
        }),
      65,
    );
    return () => clearInterval(id);
  }, [playing, mission.years]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(id);
  }, [notice]);
  const apply = (m: Mission) => {
    setMission(validateMission(m));
    setYear(m.years);
    setPlaying(false);
    setTab('mission');
    setNotice(
      'Experiment applied. Every displayed result has been recalculated.',
    );
  };
  return (
    <main className="starbound-app">
      <header className="app-header">
        <Link href="/" className="wordmark" aria-label="StarBound home">
          <Orbit size={25} strokeWidth={1.2} />
          <span>StarBound</span>
        </Link>
        <div className="header-mission">
          <span className="status-dot" />
          DYSON SWARM LABORATORY <span className="header-version">/ V1.1</span>
        </div>
        <a href={REPO} target="_blank" rel="noreferrer" className="source-link">
          <Github size={16} />
          <span>Open source</span>
          <ArrowUpRight size={14} />
        </a>
      </header>
      <div className="project-strip">
        <span>SUNLIGHT → INDUSTRY → EARTH</span>
        <span>AN EXPERIMENT IN STAR-SCALE ENGINEERING</span>
        <span className="simulation-tag">ILLUSTRATIVE SIMULATION</span>
      </div>
      <div className="live-telemetry" aria-live="polite" aria-atomic="true">
        <span className="telemetry-status"><i /> LIVE MISSION TELEMETRY</span>
        <span>YEAR <strong>{fmt(year, 1)}</strong></span>
        <span>ORBITAL OUTPUT <strong>{formatSI(row.grossPowerW, 'W')}</strong></span>
        <span className="earth-live">EARTH DELIVERY <strong>{formatSI(row.gridW, 'W')}</strong></span>
        <span className="telemetry-reason">{!sim.thermalValid ? 'Thermal shutdown' : link.sunBlocked ? 'Sun blocks transmission' : link.curtailedBeamW > 0 ? 'Receiver-limited · enlarge ground receiver to deliver more' : 'Recalculates with every mission change'}</span>
      </div>
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(String(v))}
        className="app-tabs"
      >
        <div className="navigation-row">
          <TabsList variant="line" className="main-nav">
            {[
              ['mission', 'Mission control'],
              ['robots', 'Robot control'],
              ['plant', 'Manufacturing'],
              ['collectors', 'Collector control'],
              ['energy', 'Earth power'],
              ['civilization', 'Civilization'],
              ['astra', 'Astra lab'],
              ['build', 'Build sequence'],
              ['methods', 'Research'],
            ].map(([id, title]) => (
              <TabsTrigger key={id} value={id}>
                {id === 'astra' && <Sparkles size={14} />} {title}
              </TabsTrigger>
            ))}
          </TabsList>
          <span className="audit-status">
            <ShieldCheck size={13} />
            {sim.audit.passed ? 'CONSERVATION CHECKS PASS' : 'CHECK FAILED'}
          </span>
        </div>
        <TabsContent value="mission" className="mission-layout">
          <aside className="controls">
            <div className="controls-title">
              <h2>Mission parameters</h2>
              <Settings2 size={16} />
            </div>
            <div className="segmented">
              {['swarm', 'industry', 'link'].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="ghost"
                  className={settings === s ? 'selected' : ''}
                  onClick={() => setSettings(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
            {settings === 'link' && (
              <>
                <label className="select-label" htmlFor="link-mode">
                  Transmission architecture
                </label>
                <select
                  id="link-mode"
                  value={mission.linkMode}
                  onChange={(e) =>
                    setMission((m) => ({
                      ...m,
                      linkMode: e.target.value as Mission['linkMode'],
                    }))
                  }
                >
                  <option value="optical-relay">
                    Optical → relay → microwave
                  </option>
                  <option value="direct-microwave">
                    Direct interplanetary microwave
                  </option>
                  <option value="space-only">Keep export power in space</option>
                </select>
              </>
            )}
            {controls[settings].map((c) => (
              <div className="param" key={c.key}>
                <div className="param-label">
                  <label>
                    {c.key === 'shockSeverity'
                      ? `Launcher loss from year ${mission.shockYear}`
                      : c.label}
                  </label>
                  <span>
                    {fmt(
                      mission[c.key] * (c.factor ?? 1),
                      c.step && c.step < 0.1 ? 2 : 1,
                    )}
                    <em>{c.suffix}</em>
                  </span>
                </div>
                <Slider
                  aria-label={c.label}
                  min={c.min}
                  max={c.max}
                  step={c.step ?? 1}
                  value={[mission[c.key] * (c.factor ?? 1)]}
                  onValueChange={(v) =>
                    setMission((m) => ({
                      ...m,
                      [c.key]: (Array.isArray(v) ? v[0] : v) / (c.factor ?? 1),
                    }))
                  }
                />
                {c.key === 'radiusAU' && (
                  <small>
                    {fmt(solarFlux(mission.radiusAU), 0)} W/m² incident sunlight
                  </small>
                )}
                {c.key === 'radiatorRatio' && (
                  <small>Radiating area per m² of collector</small>
                )}
                {c.key === 'phaseDegrees' && (
                  <small>
                    {link.sunBlocked
                      ? 'Sun blocks this line of sight'
                      : `${fmt(link.distanceM / C.AU, 2)} AU link distance`}
                  </small>
                )}
              </div>
            ))}
            {settings === 'swarm' && (
              <div
                className={`thermal-readout ${sim.thermalValid ? '' : 'danger'}`}
              >
                <span>DESIGN TEMPERATURE</span>
                <strong>
                  {fmt(sim.temperatureK, 0)} <em>K</em>
                </strong>
                <small>
                  {sim.thermalValid ? 'Within' : 'Exceeds'}{' '}
                  {mission.maxTemperatureK} K design limit
                </small>
                <div className="meter">
                  <i
                    style={{
                      width: `${Math.min(100, (sim.temperatureK / mission.maxTemperatureK) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {settings === 'link' && (
              <small className="assumption-note">
                Relay infrastructure is assumed. These controls do not establish
                its feasibility.
              </small>
            )}
            <div className="controls-footer">
              <Button
                variant="outline"
                onClick={() => {
                  setMission({ ...DEFAULT_MISSION });
                  setYear(DEFAULT_MISSION.years);
                  setPlaying(false);
                }}
              >
                <RotateCcw size={13} />
                Reset mission
              </Button>
              <small>
                Every change recalculates the complete {mission.years}-year
                scenario.
              </small>
            </div>
          </aside>
          <section className="mission-main">
            <ScenarioPicker
              set={(m) => {
                setMission(m);
                setYear(m.years);
                setPlaying(false);
              }}
            />
            <div className="mission-heading">
              <div>
                <div className="eyebrow">
                  MERCURY INDUSTRIAL SEED / SCENARIO 001
                </div>
                <h1>Build a star-powered future.</h1>
              </div>
              <span className="year-label">
                YEAR <strong>{fmt(year, 1).padStart(2, '0')}</strong>
              </span>
            </div>
            <div className="metrics-row">
              <Metric
                label="SWARM OUTPUT"
                value={formatSI(row.grossPowerW, 'W')}
                sub="Electrical power in orbit"
                accent
              />
              <Metric
                label="DELIVERED TO EARTH"
                value={formatSI(row.gridW, 'W')}
                sub="Average, after link losses"
              />
              <Metric
                label="COLLECTOR AREA"
                value={`${fmt(row.activeAreaM2 / 1e6)} km²`}
                sub="Active photovoltaic area"
              />
              <Metric
                label="CURRENT BOTTLENECK"
                value={row.bottleneck.toUpperCase()}
                sub={`${fmt(row.factoryModules)} factory equivalents`}
              />
            </div>
            <div className="scene">
              <div className="scene-topline">
                <span>
                  <i />
                  HELIOCENTRIC VIEW / 3D
                </span>
                <span>DRAG TO ORBIT · SCROLL TO ZOOM</span>
              </div>
              <OrbitalScene mission={mission} row={row} />
              <div className="scene-bottom">
                <span>
                  <i className="legend-dot amber" />
                  Swarm <i className="legend-dot blue" />
                  Earth link
                </span>
                <span>Illustrative bodies enlarged · orbit radii to scale</span>
              </div>
            </div>
            <div className="playback">
              <Button
                aria-label={playing ? 'Pause timeline' : 'Play timeline'}
                className="play-button"
                variant="outline"
                onClick={() => {
                  if (year >= mission.years) setYear(0);
                  setPlaying((p) => !p);
                }}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              <span>Y{fmt(year, 1)}</span>
              <Slider
                aria-label="Simulation year"
                value={[year]}
                min={0}
                max={mission.years}
                step={1 / 12}
                onValueChange={(v) => {
                  setPlaying(false);
                  setYear(Array.isArray(v) ? v[0] : v);
                }}
              />
              <span>Y{mission.years}</span>
              <span className="time-scale">12 MONTHLY STEPS / YEAR</span>
            </div>
            <Trajectory rows={sim.rows} year={year} />
            <div className="mission-insight">
              <FlaskConical size={18} />
              <p>
                {!sim.thermalValid
                  ? 'The thermal design fails. Add radiator area or move farther from the Sun before counting any orbital electricity.'
                  : row.bottleneck === 'imports'
                    ? 'Growth has reached the imported-component ceiling. More sunlight cannot manufacture missing precision electronics.'
                    : link.sunBlocked
                      ? 'The Sun is in the beam path. This geometry delivers zero power to Earth.'
                      : 'Collection is only the first step. Inspect the link budget to see how much power survives the journey to Earth.'}
              </p>
              <Button
                variant="ghost"
                onClick={() => setTab(!sim.thermalValid ? 'methods' : 'energy')}
              >
                Inspect
                <ArrowRight size={14} />
              </Button>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="robots">
          <RobotControl
            mission={mission}
            row={row}
            sim={sim}
            update={(changes) =>
              setMission((m) => validateMission({ ...m, ...changes }))
            }
          />
        </TabsContent>
        <TabsContent value="plant">
          <PlantControl
            mission={mission}
            row={row}
            sim={sim}
            update={(changes) =>
              setMission((m) => validateMission({ ...m, ...changes }))
            }
          />
        </TabsContent>
        <TabsContent value="collectors">
          <CollectorControl
            mission={mission}
            row={row}
            sim={sim}
            update={(changes) =>
              setMission((m) => validateMission({ ...m, ...changes }))
            }
          />
        </TabsContent>
        <TabsContent value="civilization">
          <CivilizationView
            mission={mission}
            row={row}
            sim={sim}
            update={(changes) =>
              setMission((m) => validateMission({ ...m, ...changes }))
            }
          />
        </TabsContent>
        <TabsContent value="build" className="content-page">
          <BuildView row={row} />
        </TabsContent>
        <TabsContent value="energy" className="content-page">
          <div className="power-control-strip">
            <Dial
              label="Earth phase angle"
              value={mission.phaseDegrees}
              min={0}
              max={180}
              unit="°"
              set={(v) => setMission((m) => ({ ...m, phaseDegrees: v }))}
            />
            <Dial
              label="Pointing jitter"
              value={mission.pointingNrad}
              min={0}
              max={100}
              unit="nrad"
              set={(v) => setMission((m) => ({ ...m, pointingNrad: v }))}
            />
            <Dial
              label="Ground receiver diameter"
              value={mission.groundReceiverKm}
              min={0.1}
              max={20}
              step={0.1}
              unit="km"
              set={(v) => setMission((m) => ({ ...m, groundReceiverKm: v }))}
            />
          </div>
          <EnergyView
            sim={sim}
            row={row}
            onLink={(mode) => setMission((m) => ({ ...m, linkMode: mode }))}
          />
        </TabsContent>
        <TabsContent value="astra" keepMounted className="content-page">
          <AstraLab mission={mission} apply={apply} />
        </TabsContent>
        <TabsContent value="methods" className="content-page">
          <MethodsView />
        </TabsContent>
      </Tabs>
      <footer className="app-footer">
        <span>
          StarBound <i>/</i> OPEN SCIENCE, OPEN QUESTIONS.
        </span>
        <div>
          <input
            type="file"
            accept=".json,application/json"
            ref={upload}
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                if (f.size > 100000)
                  throw new Error('Mission files must be smaller than 100 KB.');
                const data = JSON.parse(await f.text());
                apply(validateMission(data.mission ?? data));
              } catch (err) {
                setNotice(
                  err instanceof Error ? err.message : 'Invalid mission file.',
                );
              }
              e.target.value = '';
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => upload.current?.click()}
          >
            <Upload size={13} />
            Import
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              download(
                'starbound-mission.json',
                JSON.stringify(summary(sim), null, 2),
              )
            }
          >
            <Download size={13} />
            Export scenario
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              download(
                'starbound-trajectory.csv',
                'year,grid_MW,generated_GW,active_area_km2,mined_Mt,imported_kt,bottleneck\n' +
                  sim.rows
                    .map((r) =>
                      [
                        r.year,
                        r.gridW / 1e6,
                        r.grossPowerW / 1e9,
                        r.activeAreaM2 / 1e6,
                        r.minedKg / 1e9,
                        r.importedUsedKg / 1e6,
                        r.bottleneck,
                      ].join(','),
                    )
                    .join('\n'),
                'text/csv',
              )
            }
          >
            <Download size={13} />
            CSV
          </Button>
        </div>
      </footer>
      {notice && (
        <output className="notice">
          {notice}
          <Button variant="ghost" size="sm" onClick={() => setNotice('')}>
            Dismiss
          </Button>
        </output>
      )}
    </main>
  );
}
