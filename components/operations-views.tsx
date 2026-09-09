'use client';
import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Check,
  Cpu,
  Factory,
  Radio,
  ShieldAlert,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  ASSUMPTIONS,
  DEFAULT_MISSION,
  arealDensity,
  formatSI,
  type Mission,
  type Simulation,
  type Snapshot,
} from '@/lib/simulation/engine';
import {
  civilization,
  massDriver,
  seedDelivery,
  spaceUses,
  transferEstimate,
} from '@/lib/simulation/engineering';
import { Metric, fmt } from './mission-control';
type Props = {
  mission: Mission;
  row: Snapshot;
  sim: Simulation;
  update: (changes: Partial<Mission>) => void;
};
export function Dial({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  set,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  set: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="ops-dial">
      <div>
        <span>{label}</span>
        <strong className="dial-value">
          <input aria-label={`${label} value`} type="number" min={min} max={max} step={step} value={value}
            onChange={(e) => { const n = e.currentTarget.valueAsNumber; if (Number.isFinite(n)) set(Math.min(max, Math.max(min, n))); }} />
          <em>{unit}</em>
        </strong>
      </div>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => set(Array.isArray(v) ? v[0] : v)}
      />
      {hint && <small>{hint}</small>}
    </div>
  );
}
function Intro({
  phase,
  title,
  children,
}: {
  phase: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ops-intro">
      <span className="eyebrow">{phase}</span>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}
function ConceptImage({ kind }: { kind: 'factory' | 'collector' }) {
  return (
    <figure className="concept-scene">
      <Image
        unoptimized
        src={`/assets/${kind === 'factory' ? 'mercury-factory' : 'solar-collector'}.png`}
        alt={
          kind === 'factory'
            ? 'Engineering concept of robotic excavation, panel manufacturing and an electromagnetic launcher on Mercury'
            : 'Engineering concept of a solar collector with photovoltaic wings and radiators in space'
        }
        width={1672}
        height={941}
      />
      <figcaption>
        AI-GENERATED ENGINEERING CONCEPT · APPEARANCE IS NOT A VALIDATED DESIGN
      </figcaption>
    </figure>
  );
}
const stages = [
  [
    '01',
    'Earth departure',
    'Launch surveyors, cargo tugs, robotic landers, seed power and imported precision components.',
  ],
  [
    '02',
    'Mercury approach',
    'Use a planned gravity-assist / electric-propulsion trajectory. Match Mercury’s velocity before capture.',
  ],
  [
    '03',
    'Powered landing',
    'Brake into orbit, survey the landing area, then land with propulsion. Mercury provides no useful aerobraking atmosphere.',
  ],
  [
    '04',
    'Commission the seed',
    'Deploy power, communications and radiators. Robots grade pads, assemble shelters and qualify the first process line.',
  ],
];
export function RobotControl({ mission, row, update }: Props) {
  const [manifest, setManifest] = useState(2000),
    [dry, setDry] = useState(0.2),
    [contact, setContact] = useState(true);
  const delivery = seedDelivery(manifest, dry),
    trip = transferEstimate(0.3871, 1),
    capacity =
      ASSUMPTIONS.miningKgPerYear *
      row.factoryModules *
      mission.robotAvailability;
  return (
    <div className="ops-page">
      <Intro
        phase="01 / MERCURY SURFACE OPERATIONS"
        title="Robots build the first foothold."
      >
        Deliver the industrial seed, qualify the terrain, and keep the
        excavation fleet operating. Commands below affect the simulated mission.
      </Intro>
      <ConceptImage kind="factory" />
      <div className="ops-workspace">
        <section>
          <div className="ops-section-title">
            <Bot size={19} />
            <h2>Robot control</h2>
            <span
              className={mission.robotAvailability ? 'state-good' : 'state-bad'}
            >
              {mission.robotAvailability ? 'OPERATING' : 'SAFE MODE'}
            </span>
          </div>
          <Dial
            label="Excavation fleet availability"
            value={mission.robotAvailability * 100}
            min={0}
            max={100}
            unit="%"
            set={(v) => update({ robotAvailability: v / 100 })}
            hint="Scales the mining capacity of every factory equivalent. Zero stops new production."
          />
          <div className="ops-actions">
            <Button
              variant="outline"
              onClick={() => update({ robotAvailability: 0 })}
            >
              <ShieldAlert size={15} />
              Fleet safe mode
            </Button>
            <Button
              variant="outline"
              onClick={() => update({ robotAvailability: 1 })}
            >
              <Check size={15} />
              Resume fleet
            </Button>
          </div>
          <div className="ops-stat">
            <span>Available ore throughput</span>
            <strong>{fmt(capacity / 1e6)} kt / year</strong>
          </div>
          <div className="robot-roster">
            {[
              [
                'Excavators + haulers',
                'Recover and deliver surface feedstock',
                mission.robotAvailability,
              ],
              [
                'Refinery manipulators',
                'Sort, process and handle hot material',
                mission.refineryAvailability,
              ],
              [
                'Assembly robots',
                'Form, join, coat and fold collectors',
                mission.plantAvailability,
              ],
            ].map(([name, job, a]) => (
              <div key={String(name)}>
                <Bot size={18} />
                <span>
                  <strong>{name}</strong>
                  <small>{job}</small>
                </span>
                <b>{fmt(Number(a) * 100, 0)}%</b>
              </div>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setContact((x) => !x)}>
            <Radio size={15} />
            {contact
              ? 'Simulate loss of Earth contact'
              : 'Restore Earth contact'}
          </Button>
          <p className="ops-note">
            {contact
              ? 'Earth contact available in this operational exercise.'
              : 'Earth contact lost. Local production continues under its existing policy; recovery requires local autonomy.'}{' '}
            No robot navigation or communications network is being solved.
          </p>
        </section>
        <section>
          <div className="ops-section-title">
            <Radio size={19} />
            <h2>Getting the seed to Mercury</h2>
          </div>
          <Dial
            label="Dry surface payload"
            value={manifest}
            min={100}
            max={30000}
            step={100}
            unit="t"
            set={setManifest}
          />
          <Dial
            label="Lander dry mass / payload"
            value={dry * 100}
            min={5}
            max={100}
            unit="%"
            set={(v) => setDry(v / 100)}
          />
          <div className="compact-metrics">
            <Metric
              label="LANDING PROPELLANT"
              value={`${fmt(delivery.propellantTonnes, 0)} t`}
            />
            <Metric
              label="PRE-LANDING MASS"
              value={`${fmt(delivery.wetTonnes, 0)} t`}
            />
          </div>
          <p className="ops-note">
            Sizing exercise: 4.5 km/s landing Δv and 450 s specific impulse are
            assumptions. Payload + dry lander + propellant are counted. This is
            separate from the main mission’s installed 2,000 t factory, 20 MW
            seed and precision reserve.
          </p>
          <p className="ops-note">
            A circular, coplanar Earth-to-Mercury transfer requires about{' '}
            {fmt(trip.totalDeltaMs / 1000)} km/s of heliocentric velocity
            changes and {fmt(trip.transferDays, 0)} days in this idealization.
            Real gravity assists, escape, capture and landing require mission
            design.
          </p>
        </section>
      </div>
      <div className="sequence-grid">
        {stages.map(([n, title, body]) => (
          <article key={n}>
            <span>{n}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
export function PlantControl({ mission, row, sim, update }: Props) {
  const mass = arealDensity(mission) * 10000;
  return (
    <div className="ops-page">
      <Intro
        phase="02 / INDUSTRIAL BOOTSTRAP"
        title="Sunlight becomes manufacturing capacity."
      >
        Process Mercury’s surface minerals, import what the seed cannot make,
        and divide production between new factories and collectors.
      </Intro>
      <div className="plant-flow">
        {[
          ['EXCAVATE', 'Surface ore', row.minedKg],
          ['REFINE', 'Recovered bulk', row.minedKg * mission.oreYield],
          ['MANUFACTURE', 'Finished hardware', row.manufacturedKg],
          ['LAUNCH', 'Collectors deployed', row.launchedKg],
        ].map(([a, b, n], i) => (
          <div key={String(a)}>
            <span>{a}</span>
            <strong>{fmt(Number(n) / 1e6)} kt</strong>
            <small>{b}</small>
            {i < 3 && <ArrowRight />}
          </div>
        ))}
      </div>
      <div className="ops-workspace">
        <section>
          <div className="ops-section-title">
            <Factory size={19} />
            <h2>Manufacturing plant control</h2>
          </div>
          <Dial
            label="Refinery availability"
            value={mission.refineryAvailability * 100}
            min={0}
            max={100}
            unit="%"
            set={(v) => update({ refineryAvailability: v / 100 })}
          />
          <Dial
            label="Assembly line availability"
            value={mission.plantAvailability * 100}
            min={0}
            max={100}
            unit="%"
            set={(v) => update({ plantAvailability: v / 100 })}
          />
          <Dial
            label="Ore recovery yield"
            value={mission.oreYield * 100}
            min={1}
            max={80}
            unit="%"
            set={(v) => update({ oreYield: v / 100 })}
          />
          <Dial
            label="Swarm power returned to Mercury"
            value={mission.reinvestFraction * 100}
            min={0}
            max={95}
            unit="%"
            set={(v) => update({ reinvestFraction: v / 100 })}
            hint="The main model assumes 50% return-link efficiency. That link is not separately engineered."
          />
          <Dial
            label="New hardware retained as factories"
            value={mission.expansionFraction * 100}
            min={0}
            max={60}
            unit="%"
            set={(v) => update({ expansionFraction: v / 100 })}
          />
          <div className="ops-stat">
            <span>Surface power at selected year {fmt(row.year)}</span>
            <strong>{formatSI(row.surfacePowerW, 'W')}</strong>
          </div>
          <small>
            The seed starts the process; new collectors return energy next
            month. Precision imports remain finite.
          </small>
        </section>
        <section>
          <div className="ops-section-title">
            <Cpu size={19} />
            <h2>One 100 × 100 m collector</h2>
            <span>DESIGN EXAMPLE</span>
          </div>
          <div className="bom-table">
            {[
              ['PV + support film', mission.panelKgM2 * 10000],
              ['Radiator surfaces', mission.radiatorRatio * 10000],
              ['Other installed hardware', 2000],
              ['Total delivered module', mass],
              ['Imported share (included)', mass * 0.02],
              ['Local recovered share (included)', mass * 0.98],
            ].map(([name, m]) => (
              <div key={String(name)}>
                <span>{name}</span>
                <strong>{fmt(Number(m) / 1000)} t</strong>
              </div>
            ))}
          </div>
          <p className="ops-note">
            The 100 m module is an illustrative packing unit, not a
            flight-qualified satellite. Panel mass, radiator area and efficiency
            come from the shared mission.
          </p>
          <ol className="process-list">
            <li>
              <strong>Recover bulk feedstock.</strong> Excavate, classify and
              qualify Mg/Al-bearing silicates and other candidate materials.
            </li>
            <li>
              <strong>Separate and purify.</strong> Establish extraction
              chemistry and high-purity silicon routes. Process yield is a
              scenario parameter.
            </li>
            <li>
              <strong>Form and assemble.</strong> Roll substrates, deposit
              cells, add structure and radiators, integrate imported electronics
              and optics.
            </li>
            <li>
              <strong>Qualify the batch.</strong> Test electrical output,
              thermal cycling, deployment and acceleration loads before launch.
            </li>
          </ol>
          <div className="ops-alert">
            <strong>
              {sim.audit.passed
                ? 'Material and energy accounting passes.'
                : 'Accounting check failed.'}
            </strong>
            <p>
              Process closure, factory self-repair and semiconductor fabrication
              on Mercury remain unproven.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
export function CollectorControl({ mission, row, sim, update }: Props) {
  const [accel, setAccel] = useState(10),
    [payload, setPayload] = useState(1000),
    [charge, setCharge] = useState(20);
  const launch = massDriver(mission.radiusAU, accel, payload, charge),
    panelMass = arealDensity(mission) * 10000;
  return (
    <div className="ops-page">
      <Intro
        phase="03 / LAUNCH AND HELIOCENTRIC FLIGHT"
        title="Launch. Insert. Unfold. Track the Sun."
      >
        An electromagnetic mass driver accelerates a packaged payload. Orbital
        insertion and collector deployment are separate maneuvers.
      </Intro>
      <ConceptImage kind="collector" />
      <div className="ops-workspace">
        <section>
          <div className="ops-section-title">
            <Sun size={19} />
            <h2>Solar collector control</h2>
          </div>
          <Dial
            label="Collector orbit radius"
            value={mission.radiusAU}
            min={0.3}
            max={1}
            step={0.01}
            unit="AU"
            set={(v) => update({ radiusAU: v })}
          />
          <Dial
            label="Radiator / collector area"
            value={mission.radiatorRatio}
            min={0.5}
            max={8}
            step={0.1}
            unit="×"
            set={(v) => update({ radiatorRatio: v })}
          />
          <Dial
            label="Annual retirement"
            value={mission.annualLoss * 100}
            min={0}
            max={20}
            step={0.5}
            unit="%"
            set={(v) => update({ annualLoss: v / 100 })}
          />
          <Dial
            label="Launcher throughput"
            value={mission.launchMultiplier}
            min={0.1}
            max={5}
            step={0.1}
            unit="×"
            set={(v) => update({ launchMultiplier: v })}
          />
          <div className="compact-metrics">
            <Metric
              label="DESIGN TEMPERATURE"
              value={`${fmt(sim.temperatureK, 0)} K`}
              sub={
                sim.thermalValid ? 'Below assumed limit' : 'THERMAL SHUTDOWN'
              }
            />
            <Metric
              label="ORBITAL PERIOD"
              value={`${fmt(launch.periodDays)} days`}
            />
            <Metric
              label="CIRCULAR SPEED"
              value={`${fmt(launch.orbitalSpeedMs / 1000)} km/s`}
            />
            <Metric
              label="100 M MODULE EQUIVALENTS"
              value={fmt(row.activeKg / panelMass, 0)}
            />
          </div>
          <p className="ops-note">
            Track the Sun, reject waste heat, maintain orbit and avoid
            conjunctions. The 3D scene samples circular orbits; it does not
            verify collision-free control.
          </p>
        </section>
        <section>
          <div className="ops-section-title">
            <ArrowRight size={19} />
            <h2>Mass-driver sizing</h2>
            <span>SEPARATE CALCULATOR</span>
          </div>
          <Dial
            label="Payload acceleration"
            value={accel}
            min={1}
            max={1000}
            unit="g"
            set={setAccel}
          />
          <Dial
            label="Packaged launch payload"
            value={payload}
            min={100}
            max={100000}
            step={100}
            unit="kg"
            set={setPayload}
          />
          <Dial
            label="Average charging power"
            value={charge}
            min={1}
            max={200}
            unit="MW"
            set={setCharge}
          />
          <div className="compact-metrics">
            <Metric
              label="MUZZLE SPEED"
              value={`${fmt(launch.muzzleMs / 1000, 2)} km/s`}
            />
            <Metric
              label="MINIMUM TRACK"
              value={`${fmt(launch.trackM / 1000, 2)} km`}
            />
            <Metric
              label="ENERGY / LAUNCH"
              value={formatSI(launch.inputJ, 'J')}
            />
            <Metric
              label="RECHARGE TIME"
              value={`${fmt(launch.chargeSeconds)} s`}
            />
          </div>
          <div className="ops-alert">
            <strong>
              Arrival correction: {fmt(launch.arrivalDeltaMs / 1000, 2)} km/s
            </strong>
            <p>
              {fmt(launch.transferDays)} days for the ideal circular coplanar
              transfer. Payload protection, launch windows, steering and
              insertion propulsion are not designed here.
            </p>
          </div>
          <p className="ops-note">
            L = v² / 2a. A higher acceleration shortens the rail but increases
            structural loads. Peak mechanical power is{' '}
            {formatSI(launch.peakMechanicalW, 'W')}; average charging power is
            not pulse power. This calculator does not overwrite the main model’s
            aggregate launch-energy assumption.
          </p>
        </section>
      </div>
    </div>
  );
}
export const SCENARIOS = [
  { name: 'Baseline / finite imports', changes: {} },
  { name: 'Excavation robots offline', changes: { robotAvailability: 0 } },
  { name: 'Refinery shutdown', changes: { refineryAvailability: 0 } },
  { name: 'Factory assembly shutdown', changes: { plantAvailability: 0 } },
  {
    name: 'Collector thermal failure',
    changes: { radiusAU: 0.3, radiatorRatio: 0.5 },
  },
  { name: 'Launcher failure at year 3', changes: { shockSeverity: 1 } },
  { name: 'No precision imports', changes: { importedTechKt: 0 } },
  { name: 'Sun blocks Earth transmission', changes: { phaseDegrees: 180 } },
  { name: 'High pointing jitter', changes: { pointingNrad: 100 } },
  {
    name: 'Direct microwave challenge',
    changes: { linkMode: 'direct-microwave' as const },
  },
];
export function ScenarioPicker({ set }: { set: (m: Mission) => void }) {
  return (
    <div className="scenario-picker">
      <label htmlFor="scenario">Mission scenario</label>
      <select
        id="scenario"
        defaultValue=""
        onChange={(e) => {
          const s = SCENARIOS[Number(e.target.value)];
          if (s) set({ ...DEFAULT_MISSION, ...s.changes });
          e.target.value = '';
        }}
      >
        <option value="" disabled>
          Load a failure case…
        </option>
        {SCENARIOS.map((s, i) => (
          <option value={i} key={s.name}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
export function CivilizationView({ mission, row }: Props) {
  const [capture, setCapture] = useState(90),
    [temp, setTemp] = useState(350),
    [ship, setShip] = useState(1000),
    [speed, setSpeed] = useState(0.1),
    [rpm, setRpm] = useState(2),
    [powerSource, setPowerSource] = useState<'earth' | 'space' | 'future'>(
      'space',
    );
  const scale = civilization(mission, capture / 100, temp),
    power =
      powerSource === 'earth'
        ? row.gridW
        : powerSource === 'space'
          ? row.exportOfferedW
          : scale.electricalUpperW,
    uses = spaceUses(power, temp, ship, speed, rpm);
  return (
    <div className="ops-page">
      <Intro
        phase="05 / CIVILIZATION SCALE"
        title="A star is an energy source. Heat is still the limit."
      >
        Explore a near-total-capture thought experiment, then size a computing
        load, a vehicle’s kinetic energy, or a rotating habitat. These
        calculators do not extend the validated sparse trajectory.
      </Intro>
      <div className="scale-disclosure">
        <ShieldAlert size={20} />
        <p>
          Current mission captures{' '}
          {(row.coverageFraction * 100).toExponential(3)}% geometrically. The
          main model stops at 1%. Everything below is a separate scaling
          exercise.
        </p>
      </div>
      <div className="ops-workspace">
        <section>
          <h2>Surround the Sun</h2>
          <Dial
            label="Target intercepted sunlight"
            value={capture}
            min={0.1}
            max={99.9}
            step={0.1}
            unit="%"
            set={setCapture}
          />
          <Dial
            label="Heat rejection temperature"
            value={temp}
            min={250}
            max={1000}
            unit="K"
            set={setTemp}
          />
          <div className="compact-metrics">
            <Metric
              label="CAPTURED SUNLIGHT"
              value={formatSI(scale.capturedW, 'W')}
            />
            <Metric
              label="ELECTRICAL UPPER ESTIMATE"
              value={formatSI(scale.electricalUpperW, 'W')}
            />
            <Metric
              label="MERCURY ORE EQUIVALENT"
              value={`${fmt(scale.mercuryFraction, 2)} × planet`}
            />
            <Metric
              label="COLLECTOR AREA"
              value={`${scale.collectorAreaM2.toExponential(2)} m²`}
            />
          </div>
          <p className="ops-note">
            Random projected overlap: f = 1 − exp(−A / 4πr²). Approaching 100%
            needs increasing optical depth. This screen omits collisions,
            shadowing control, radiative exchange and stellar feedback.
          </p>
          <div className="ops-alert">
            <strong>
              Earth would retain only {fmt(100 - capture, 1)}% of direct
              sunlight in a uniform swarm.
            </strong>
            <p>
              Preserving Earth’s illumination requires excluded directions or
              another explicit illumination design. Returning electricity cannot
              replace its present climate and sunlight automatically.
            </p>
          </div>
          <p className="ops-note">
            Required precision imports: {formatSI(scale.precisionKg, 'kg')}.
            Mercury is not a limitless source of complete machines. The
            constant-density ore estimate does not establish extractability.
          </p>
        </section>
        <section>
          <h2>Choose where the power is used</h2>
          <div className="ops-source-selector">
            {(['earth', 'space', 'future'] as const).map((s) => (
              <Button
                key={s}
                variant="outline"
                className={powerSource === s ? 'selected' : ''}
                onClick={() => setPowerSource(s)}
              >
                {s === 'earth'
                  ? 'Earth grid'
                  : s === 'space'
                    ? 'Orbital export'
                    : 'Future upper bound'}
              </Button>
            ))}
          </div>
          <div className="ops-stat">
            <span>
              {powerSource === 'space'
                ? 'Orbital electrical offer before a use-specific link'
                : powerSource === 'future'
                  ? 'Independent scaling case, not delivered power'
                  : 'Selected mission average Earth grid power'}
            </span>
            <strong>{formatSI(power, 'W')}</strong>
          </div>
          <div className="future-use">
            <Cpu size={24} />
            <div>
              <h3>Data centers</h3>
              <p>
                At {temp} K, a fully dissipative space computing load needs{' '}
                <strong>{fmt(uses.computeCoolingM2 / 1e6, 2)} km²</strong> of
                ideal radiating surface. Vacuum provides no convective cooling.
              </p>
            </div>
          </div>
          <div className="future-use">
            <ArrowRight size={24} />
            <div>
              <h3>Interstellar energy</h3>
              <Dial
                label="Vehicle mass"
                value={ship}
                min={1000}
                max={1000000}
                step={1000}
                unit="kg"
                set={setShip}
              />
              <Dial
                label="Target fraction of light speed"
                value={speed}
                min={0.01}
                max={0.5}
                step={0.01}
                unit="c"
                set={setSpeed}
              />
              <p>
                Kinetic-energy lower bound:{' '}
                <strong>{formatSI(uses.kineticJ, 'J')}</strong>. At perfect
                coupling, the selected power takes{' '}
                {uses.idealAccelerationYears === null
                  ? 'an unbounded time'
                  : `${fmt(uses.idealAccelerationYears, 2)} years`}{' '}
                to supply it. Braking, diffraction and propulsion losses are
                additional.
              </p>
            </div>
          </div>
          <div className="future-use">
            <Sun size={24} />
            <div>
              <h3>Artificial environments</h3>
              <Dial
                label="Habitat rotation"
                value={rpm}
                min={0.5}
                max={6}
                step={0.1}
                unit="rpm"
                set={setRpm}
              />
              <p>
                A radius of <strong>{fmt(uses.habitatRadiusM, 0)} m</strong>{' '}
                yields 1 g at the rim. Pressure vessels, shielding, atmosphere,
                food, water and ecosystem stability require separate designs.
              </p>
            </div>
          </div>
          <small>
            Each use assumes the entire selected power budget. They cannot be
            added together. No direct route from electrical watts to a working
            habitat or spacecraft is implied.
          </small>
        </section>
      </div>
      <div className="scale-disclosure">
        <ArrowDown size={20} />
        <p>
          A closed dissipative system must radiate what it captures. At this
          temperature, the future capture case needs{' '}
          {scale.radiatingAreaM2.toExponential(2)} m² of effective
          outward-facing radiating area, before view-factor and engineering
          penalties.
        </p>
      </div>
    </div>
  );
}
