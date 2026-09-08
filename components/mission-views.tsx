'use client';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronRight, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Metric, REPO, fmt } from './mission-control';
import {
  formatSI,
  impacts,
  powerLink,
  type Mission,
  type Snapshot,
  type Simulation,
} from '@/lib/simulation/engine';
const stages = [
  [
    'Survey & seed',
    'Characterize accessible silicates. Land an imported power plant, factory and precision-component reserve. The simulation starts after this infrastructure exists.',
    'Starting endowment: 20 MW + 2,000 t factory',
    'Gate: robotic processing demonstration on Mercury.',
  ],
  [
    'Mine & refine',
    'Excavate surface material; separate useful feedstock from tailings. Ore yield is an assumption, not a measured industrial recovery rate.',
    'Silicon · magnesium-bearing silicates · aluminum-bearing minerals',
    'Gate: verified extraction yields, reagents and impurity control.',
  ],
  [
    'Manufacture',
    'Combine local bulk material and imported precision components into collectors, radiators and more factory capacity. Every kilogram is counted.',
    '98% local bulk / 2% imported technology — an assumption',
    'Gate: durable photovoltaics, power electronics and optical manufacturing.',
  ],
  [
    'Launch & insert',
    'An electromagnetic launcher supplies escape energy; a separate transfer allowance represents propulsion and insertion. Panels unfold after deployment.',
    'Escape lower bound: 9.03 MJ/kg · modeled launch + transfer: 43.1 MJ/kg',
    'Gate: launch loads, terrain, navigation, braking and orbital insertion.',
  ],
  [
    'Harvest & reinvest',
    'Collectors orbit independently. Some output returns to industry through an assumed power link. Factory capacity and imported components bound growth.',
    'Solar flux and radiator temperature calculated from physical equations',
    'Gate: collision avoidance, pointing, maintenance and return-link design.',
  ],
  [
    'Deliver & use',
    'An optical link feeds a near-Earth receiver. A microwave link sends part of that power to a rectenna and grid. Conversion and capture losses remain visible.',
    '100 m optical transmitter · 1 km relay receiver · 5 km ground receiver',
    'Gate: enormous optics, thermal rejection, grid integration and beam shutdown.',
  ],
];
export function BuildView({ row }: { row: Snapshot }) {
  return (
    <>
      <div className="page-intro">
        <span className="eyebrow">THE INDUSTRIAL PATH</span>
        <h1>
          From Mercury dust
          <br />
          to an orbital power station.
        </h1>
        <p>
          A hypothetical construction sequence. Each stage has a material
          ledger, an energy requirement, and a technology gate.
        </p>
      </div>
      <div className="build-grid">
        {stages.map(([title, text, material, gate], i) => (
          <article key={title} className="build-stage">
            <span className="stage-number">0{i + 1}</span>
            <h2>{title}</h2>
            <p>{text}</p>
            <div className="material-line">{material}</div>
            <small>{gate}</small>
          </article>
        ))}
      </div>
      <div className="ledger">
        <h2>Material ledger at year {fmt(row.year)}</h2>
        <div className="metrics-row">
          <Metric
            label="ORE EXCAVATED"
            value={formatSI(row.minedKg / 1000, 't')}
          />
          <Metric
            label="TAILINGS"
            value={formatSI(row.tailingsKg / 1000, 't')}
          />
          <Metric
            label="IMPORTED TECH USED"
            value={formatSI(row.importedUsedKg / 1000, 't')}
          />
          <Metric
            label="NEW FACTORY MASS"
            value={formatSI(row.factoryKg / 1000, 't')}
          />
          <Metric
            label="ACTIVE + RETIRED SWARM"
            value={formatSI((row.activeKg + row.retiredKg) / 1000, 't')}
          />
        </div>
        <p className="equation">
          ORE + IMPORTS = TAILINGS + FACTORIES + ACTIVE SWARM + RETIRED SWARM
        </p>
        <small>
          Seed infrastructure is excluded from this incremental ledger. No metal
          is assumed to come from Mercury’s core.
        </small>
      </div>
    </>
  );
}
export function EnergyView({
  sim,
  row,
  onLink,
}: {
  sim: Simulation;
  row: Snapshot;
  onLink: (m: Mission['linkMode']) => void;
}) {
  const m = sim.mission,
    l = powerLink(row.exportOfferedW, m),
    use = impacts(row.gridW),
    [selected, setSelected] = useState('water');
  const uses = [
    {
      id: 'water',
      title: 'Fresh water',
      value: `${fmt(use.waterM3 / 1e6)} million m³ / year`,
      text: 'Power reverse-osmosis desalination. Assumes 4 kWh per m³. Intake, brine management, membranes and water distribution still require infrastructure.',
    },
    {
      id: 'hydrogen',
      title: 'Clean hydrogen',
      value: `${fmt(use.hydrogenKg / 1000)} tonnes / year`,
      text: 'Supply electrolyzers for fertilizer or industrial feedstock. Assumes 55 kWh per kg of hydrogen. Water, compression, storage and transport are additional.',
    },
    {
      id: 'homes',
      title: 'Grid electricity',
      value: `${fmt(use.households, 0)} household equivalents`,
      text: 'Compare with households using 4,000 kWh annually. An energy equivalent, not a promise of uninterrupted service or an estimate of homes actually connected.',
    },
    {
      id: 'compute',
      title: 'Scientific computing',
      value: `${fmt(use.computeMW)} MW continuous facility load`,
      text: 'Run scientific simulation, climate modeling or AI research. This allocates the whole facility power budget. Chips, cooling overhead and useful compute performance are not estimated.',
    },
  ];
  const chosen = uses.find((u) => u.id === selected)!;
  return (
    <>
      <div className="page-intro">
        <span className="eyebrow">
          THE ENERGY JOURNEY / YEAR {fmt(row.year)}
        </span>
        <h1>
          The Sun is generous.
          <br />
          The journey is expensive.
        </h1>
        <p>
          Follow each conversion from captured sunlight to useful electricity.
          Collector output and grid delivery are different quantities.
        </p>
      </div>
      <div className="energy-chain">
        {[
          {
            title: 'SUNLIGHT INTERCEPTED',
            v: row.interceptedW,
            s: 'Projected collector area × solar flux',
          },
          {
            title: 'ORBITAL ELECTRICITY',
            v: row.grossPowerW,
            s: `${fmt(m.efficiency * 100)}% conversion at rated temperature`,
          },
          {
            title: 'OFFERED TO EARTH LINK',
            v: row.exportOfferedW,
            s: `${fmt(m.reinvestFraction * 100)}% reserved for industrial return`,
          },
          {
            title: 'EARTH GRID',
            v: row.gridW,
            s: 'After capture, conversion, duty and caps',
          },
        ].map((n, i) => (
          <div className="energy-node" key={n.title}>
            <span>
              0{i + 1} / {n.title}
            </span>
            <strong>{formatSI(n.v, 'W')}</strong>
            <p>{n.s}</p>
            {i < 3 && <ArrowRight className="flow-arrow" size={21} />}
          </div>
        ))}
      </div>
      <div className="link-experiment">
        <div>
          <h2>Try the transmission problem.</h2>
          <p>
            At interplanetary range, an ordinary microwave beam spreads
            enormously. Compare it with a speculative optical relay using the
            same collector output.
          </p>
          <div className="link-buttons">
            <Button
              variant={m.linkMode === 'optical-relay' ? 'default' : 'outline'}
              onClick={() => onLink('optical-relay')}
            >
              Optical relay
            </Button>
            <Button
              variant={
                m.linkMode === 'direct-microwave' ? 'default' : 'outline'
              }
              onClick={() => onLink('direct-microwave')}
            >
              Direct microwave
            </Button>
            <Button
              variant={m.linkMode === 'space-only' ? 'default' : 'outline'}
              onClick={() => onLink('space-only')}
            >
              Keep in space
            </Button>
          </div>
        </div>
        <div className="link-stat">
          <span>FIRST-LEG BEAM RADIUS</span>
          <strong>{formatSI(l.beamRadiusM, 'm')}</strong>
          <small>Gaussian 1/e² intensity radius</small>
        </div>
        <div className="link-stat">
          <span>EXPORT → GRID EFFICIENCY</span>
          <strong>{fmt(l.efficiency * 100, 6)}%</strong>
          <small>
            {l.sunBlocked
              ? 'Sun blocks the link'
              : l.curtailedBeamW > 0
                ? 'Ground beam / grid cap active'
                : 'Including all modeled link stages'}
          </small>
        </div>
      </div>
      <div className="impact-section">
        <div>
          <span className="eyebrow">WHAT COULD THIS POWER DO?</span>
          <h2>Choose where it matters.</h2>
          <p>
            Each scenario uses the entire Earth electricity budget.
            <br />
            These alternatives cannot be added together.
          </p>
          <div className="impact-options">
            {uses.map((u) => (
              <Button
                variant="ghost"
                className={selected === u.id ? 'selected' : ''}
                key={u.id}
                onClick={() => setSelected(u.id)}
              >
                {u.title}
                <ChevronRight size={15} />
              </Button>
            ))}
          </div>
        </div>
        <article className="impact-detail">
          <span>{chosen.title.toUpperCase()}</span>
          <strong>{chosen.value}</strong>
          <p>{chosen.text}</p>
          <div className="impact-divider" />
          <small>
            {fmt(use.annualTWh, 3)} TWh annual energy equivalent at this
            snapshot’s average power. Real deployment and lifecycle benefits are
            not established.
          </small>
        </article>
      </div>
      <div className="reality-note">
        <h3>Most of a future swarm’s power may belong in space.</h3>
        <p>
          Orbital industry, propulsion and computing could avoid the
          interplanetary-to-ground chain. StarBound does not model those
          facilities. Beaming ever more power to Earth also adds heat: this
          scenario’s received-power footprint averages{' '}
          {l.earthHeatWm2.toExponential(2)} W/m² across Earth’s surface.
        </p>
        <p>
          NASA’s 2024 assessment found its studied space-solar concepts more
          expensive than terrestrial sustainable alternatives. This simulation
          does not establish an economic case for a Mercury swarm.
        </p>
      </div>
    </>
  );
}
const sources = [
  [
    'Wright (2023): thermodynamics, computation and random swarms',
    'https://arxiv.org/html/2309.06564v2',
    'Optical-depth screen and heat-rejection context; not a dense-swarm engineering solution.',
  ],
  [
    'Shubov (2021): guided self-replicating factories',
    'https://arxiv.org/abs/2110.15198',
    'Speculative industrial growth with continued complex imports and human guidance.',
  ],
  [
    'ESA: BepiColombo mission architecture',
    'https://www.esa.int/Science_Exploration/Space_Science/BepiColombo_overview2',
    'Gravity assists and propulsion for a real Mercury orbiter.',
  ],
  [
    'NASA NIAC: beam-powered interstellar precursor concept',
    'https://www.nasa.gov/general/a-breakthrough-propulsion-architecture-for-interstellar-precursor-missions/',
    'Propulsion research context; no StarBound vehicle is validated.',
  ],
  [
    'Dyson Spheres — Jason T. Wright (2020)',
    'https://arxiv.org/abs/2006.16734',
    'Swarm interpretation; shell stability; radiative feedback.',
  ],
  [
    'NASA / JPL planetary parameters',
    'https://ssd.jpl.nasa.gov/planets/phys_par.html',
    'Mercury mass, radius and escape-speed reference.',
  ],
  [
    'Mercury mineralogy — NASA NTRS',
    'https://ntrs.nasa.gov/citations/20160002643',
    'An iron-rich core does not imply iron-rich surface ore.',
  ],
  [
    'NASA space-based solar power assessment',
    'https://www.nasa.gov/organizations/otps/space-based-solar-power-report/',
    'Capability gaps and comparison with terrestrial energy alternatives.',
  ],
  [
    'Solar irradiance — NASA',
    'https://sunclimate.gsfc.nasa.gov/sun-and-climate',
    'Reference solar flux near Earth.',
  ],
  [
    'Kurzgesagt: How to Build a Dyson Sphere',
    'https://www.youtube.com/watch?v=pP44EPBMb8A',
    'Narrative inspiration for the Mercury industrial feedback loop.',
  ],
];
export function MethodsView() {
  return (
    <>
      <div className="page-intro">
        <span className="eyebrow">TRACEABLE BY DESIGN</span>
        <h1>Ambition. With a ledger.</h1>
        <p>
          Astra proposes experiments. A deterministic numerical engine evaluates
          them. Evidence, assumptions and unresolved engineering stay separate.
        </p>
      </div>
      <div className="method-columns">
        <section>
          <h2>Calculated</h2>
          <ul>
            <li>
              Inverse-square solar flux and equilibrium collector temperature.
            </li>
            <li>
              Monthly material throughput, expansion, component depletion and
              retirement.
            </li>
            <li>
              Escape-energy lower bound, Gaussian beam capture, conversion
              losses and solar occultation.
            </li>
            <li>
              Grid output, receiver intensity cap, energy equivalents and
              conservation residuals.
            </li>
          </ul>
        </section>
        <section>
          <h2>Assumed</h2>
          <ul>
            <li>Seed factory and 20 MW surface plant already exist.</li>
            <li>
              98% local material; 2% imported technology per finished kilogram.
            </li>
            <li>
              30% conversion, 50% power return and 75% Earth-link availability.
            </li>
            <li>
              External relay, fixed energy intensities and ideal just-in-time
              production.
            </li>
          </ul>
        </section>
        <section>
          <h2>Still unresolved</h2>
          <ul>
            <li>Mercury extraction chemistry, cost, reagents and readiness.</li>
            <li>
              Launch trajectories, collisions, propellant and station keeping.
            </li>
            <li>
              Relay cooling, giant optics, weather, grid infrastructure and beam
              authorization.
            </li>
            <li>
              Dense-swarm dynamics, radiative feedback and a full Dyson sphere.
              A separate optical-depth screen is available.
            </li>
          </ul>
        </section>
      </div>
      <div className="source-list">
        {sources.map(([title, url, desc]) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            <div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
            <ArrowUpRight size={18} />
          </a>
        ))}
      </div>
      <div className="method-actions">
        <a
          href={`${REPO}/blob/main/docs/PHYSICS.md`}
          target="_blank"
          rel="noreferrer"
        >
          Equations & assumptions
          <ArrowUpRight size={15} />
        </a>
        <a
          href={`${REPO}/blob/main/docs/ARCHITECTURE.md`}
          target="_blank"
          rel="noreferrer"
        >
          System architecture
          <ArrowUpRight size={15} />
        </a>
        <a href="/StarBound-Mission-Briefing.pptx" download>
          Mission briefing PowerPoint
          <Download size={15} />
        </a>
      </div>
    </>
  );
}
