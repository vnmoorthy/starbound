/** StarBound mission briefing. Requires the Codex presentation artifact runtime.
 * Run from the repository root with RUNTIME_NODE_MODULES and PRESENTATIONS_SKILL_DIR.
 * Every numerical slide is generated from the same engine or recorded experiments.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const ROOT = process.cwd();
const MODULES = process.env.RUNTIME_NODE_MODULES;
const SKILL = process.env.PRESENTATIONS_SKILL_DIR;
if (!MODULES || !SKILL)
  throw new Error(
    'Set RUNTIME_NODE_MODULES and PRESENTATIONS_SKILL_DIR to the supplied presentation runtime.',
  );
const requireRuntime = createRequire(path.join(MODULES, 'package.json'));
const { Presentation, PresentationFile } = await import(
  pathToFileURL(requireRuntime.resolve('@oai/artifact-tool')).href
);
const {
  resolvePresentationFont,
  applyPresentationChartFont,
  finalizePresentation,
} = await import(
  pathToFileURL(path.join(SKILL, 'container_tools/artifact_tool_utils.mjs'))
    .href
);
const { simulate, impacts, DEFAULT_MISSION } = await import(
  pathToFileURL(path.join(ROOT, 'lib/simulation/engine.ts')).href
);
const { massDriver, seedDelivery, civilization, spaceUses } = await import(
  pathToFileURL(path.join(ROOT, 'lib/simulation/engineering.ts')).href
);
const FONT = resolvePresentationFont();
const P = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const S = [],
  chartOwners = [],
  tableOwners = [];
const BG = '#050608',
  FG = '#F3F3F1',
  MUTED = '#9A9FA5',
  LINE = '#39414A',
  GOLD = '#C5A16E',
  BLUE = '#96B3C9';
const sim = simulate(),
  b = sim.final,
  uses = impacts(b.gridW);
const comp = JSON.parse(
  await fs.readFile(path.join(ROOT, 'results/comparison.json'), 'utf8'),
);
const direct = simulate({ ...DEFAULT_MISSION, linkMode: 'direct-microwave' });
const n = (x, d = 2) => x.toLocaleString('en-US', { maximumFractionDigits: d });
function box(
  s,
  x,
  y,
  w,
  h,
  fill = 'none',
  stroke = 'none',
  width = 0,
  geometry = 'rect',
) {
  return s.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { fill: stroke, width },
  });
}
function text(
  s,
  str,
  x,
  y,
  w,
  h,
  size = 24,
  color = FG,
  bold = false,
  alignment = 'left',
) {
  const t = box(s, x, y, w, h);
  t.text = str;
  t.text.style = {
    typeface: FONT,
    fontSize: size,
    color,
    bold,
    alignment,
    autoFit: 'none',
  };
  return t;
}
function line(s, x, y, w, color = LINE, width = 1) {
  return box(s, x, y, w, 0, 'none', color, width, 'line');
}
function note(s, str) {
  s.speakerNotes.textFrame.setText(str);
}
function slide(title, notes = '') {
  const s = P.slides.add();
  s.background.fill = BG;
  S.push(s);
  if (title) text(s, title, 64, 54, 1152, 132, 46, FG, true);
  text(
    s,
    `StarBound  /  ${String(S.length).padStart(2, '0')}`,
    64,
    675,
    220,
    20,
    11,
    MUTED,
  );
  note(s, notes);
  return s;
}
function label(s, str, x, y, w = 1000) {
  text(s, str, x, y, w, 25, 13, MUTED, false);
}
function metric(s, value, labelText, x, y, w = 330, color = FG) {
  text(s, value, x, y, w, 88, 62, color, true);
  text(s, labelText, x, y + 90, w, 58, 20, MUTED);
}
function arrow(s, x, y, w) {
  return box(s, x, y, w, 13, LINE, 'none', 0, 'rightArrow');
}
function orbit(s, cx, cy, r = 190) {
  for (let i = 0; i < 9; i++) {
    const e = box(
      s,
      cx - r,
      cy - r * 0.33,
      r * 2,
      r * 0.66,
      'none',
      i % 2 ? LINE : '#73716C',
      0.8,
      'ellipse',
    );
    e.position = {
      left: cx - r,
      top: cy - r * 0.33,
      width: r * 2,
      height: r * 0.66,
      rotation: (i - 4) * 13,
    };
  }
  box(s, cx - 22, cy - 22, 44, 44, GOLD, 'none', 0, 'ellipse');
  for (let i = 0; i < 60; i++) {
    const a = i * 2.399963,
      y = cy + Math.sin(a) * r * 0.36,
      x = cx + Math.cos(a) * r;
    box(s, x, y, 2.5, 2.5, i % 3 ? FG : GOLD);
  }
}
function table(s, values, top = 220, widths = [300, 370, 482], height = 340) {
  const t = s.tables.add({
    rows: values.length,
    columns: values[0].length,
    left: 64,
    top,
    width: 1152,
    height,
    columnWidths: widths,
    values,
  });
  t.styleOptions = { headerRow: true, bandedRows: false };
  t.borders.assign({ fill: LINE, width: 0.6 });
  for (let r = 0; r < values.length; r++)
    for (let c = 0; c < values[0].length; c++) {
      const cell = t.getCell(r, c);
      cell.fill = r === 0 ? '#171B20' : BG;
      cell.text.style = {
        typeface: FONT,
        fontSize: r === 0 ? 18 : 21,
        bold: r === 0,
        color: r === 0 ? FG : MUTED,
        autoFit: 'none',
      };
    }
  tableOwners.push(S.length);
  return t;
}
function chart(
  s,
  type,
  categories,
  series,
  x = 64,
  y = 230,
  w = 1152,
  h = 350,
  yTitle = '',
) {
  const c = s.charts.add(type, {
    position: { left: x, top: y, width: w, height: h },
    categories,
    series,
    hasLegend: series.length > 1,
    chartFill: BG,
    plotAreaFill: BG,
    chartLine: { fill: 'none', width: 0 },
    plotAreaLine: { fill: 'none', width: 0 },
    legend: {
      position: 'bottom',
      overlay: false,
      textStyle: { typeface: FONT, fontSize: 17, fill: MUTED },
    },
    xAxis: {
      textStyle: { typeface: FONT, fontSize: 17, fill: MUTED },
      line: { fill: LINE, width: 1 },
      majorGridlines: null,
    },
    yAxis: {
      min: 0,
      title: yTitle
        ? {
            text: yTitle,
            textStyle: { typeface: FONT, fontSize: 17, fill: MUTED },
          }
        : undefined,
      textStyle: { typeface: FONT, fontSize: 17, fill: MUTED },
      majorGridlines: { fill: LINE, width: 0.5 },
      line: { fill: 'none', width: 0 },
    },
    barOptions: { direction: 'column', grouping: 'clustered', gapWidth: 100 },
    lineOptions: { smooth: false },
    dataLabels: {
      showValue: type === 'bar',
      position: 'outEnd',
      textStyle: { typeface: FONT, fontSize: 20, fill: FG },
    },
  });
  applyPresentationChartFont(c, { fontFamily: FONT });
  chartOwners.push(S.length);
  return c;
}
// 01 — original mission-briefing cover, SpaceX-inspired typography and restraint.
{
  const s = slide(
    '',
    `Original SpaceX-inspired visual direction requested by the user. No SpaceX logo, affiliation or endorsement. StarBound is an illustrative engineering simulator. Repository: https://github.com/vnmoorthy/starbound ; demo: https://starbound.vnmoorthy.chatgpt.site`,
  );
  text(s, 'StarBound', 64, 70, 640, 135, 104, FG, true);
  line(s, 69, 224, 116, GOLD, 3);
  text(s, 'BUILD A\nSTAR-POWERED\nFUTURE.', 64, 280, 700, 258, 65, FG, true);
  orbit(s, 990, 365, 206);
  text(s, 'MERCURY → SWARM → EARTH', 70, 602, 800, 34, 20, MUTED);
}
// 02
{
  const s = slide(
    'AN AMBITIOUS PLAN\nSHOULD SURVIVE A TEST.',
    'Product framing: the present artifact is a coupled engineering education and model-evaluation testbed. It does not establish startup demand, commercial viability, or a physical Dyson swarm design.',
  );
  text(
    s,
    'Astra proposes.\nPhysics keeps the score.',
    65,
    244,
    650,
    145,
    44,
    FG,
    true,
  );
  text(
    s,
    'Change the mission. Track every kilogram and joule.\nFind the constraint that breaks the plan.',
    66,
    428,
    620,
    100,
    25,
    MUTED,
  );
  line(s, 785, 251, 390, LINE);
  metric(s, '01', 'shared numerical engine', 790, 280, 370);
  metric(
    s,
    '03',
    'Astra proposals, measured independently',
    790,
    454,
    370,
    GOLD,
  );
}
// 03
{
  const s = slide(
    'INDEPENDENT ORBITS.\nSHARED PURPOSE.',
    'Wright, Jason T. (2020), Dyson Spheres. https://arxiv.org/abs/2006.16734 . The review discusses shell instability and radiative coupling. StarBound uses separate collectors and does not implement dense-sphere feedback.',
  );
  orbit(s, 332, 393, 214);
  text(s, 'A sparse Dyson swarm', 700, 247, 500, 48, 31, FG, true);
  text(
    s,
    'Individual collectors intercept sunlight while orbiting the Sun. A rigid shell is not the construction target.',
    700,
    320,
    485,
    128,
    26,
    MUTED,
  );
  text(
    s,
    'V1 models a sparse swarm only.\nDense coverage and collision-free flight\nrequire further physics.',
    700,
    495,
    485,
    110,
    23,
    MUTED,
  );
}
// 04
{
  const s = slide(
    'SIX MISSIONS. ONE ENERGY CHAIN.',
    'Complete conceptual engineering sequence: docs/MERCURY-TO-EARTH.md. The model starts after the seed plant and factory are installed. No physical completion date is predicted.',
  );
  const names = ['SURVEY', 'REFINE', 'BUILD', 'LAUNCH', 'HARVEST', 'DELIVER'];
  const desc = [
    'Map accessible\nMercury resources',
    'Separate feedstock\nand track tailings',
    'Fabricate collectors\nand new factories',
    'Escape, insert\nand commission',
    'Reinvest power\nwithin real limits',
    'Receive power\nand serve demand',
  ];
  names.forEach((v, i) => {
    const x = 64 + i * 195;
    text(s, `0${i + 1}`, x, 252, 160, 56, 37, GOLD);
    line(s, x, 333, 155, LINE);
    text(s, v, x, 365, 180, 44, 23, FG, true);
    text(s, desc[i], x, 436, 174, 104, 20, MUTED);
    if (i < 5) arrow(s, x + 157, 288, 25);
  });
  label(
    s,
    'A conceptual roadmap, with separate technology gates before each real-world scale-up.',
    64,
    608,
  );
}
// 05
{
  const s = slide(
    'MERCURY IS FEEDSTOCK.\nIT IS NOT A READY-MADE FACTORY.',
    'Sources: https://science.nasa.gov/photojournal/major-element-composition-of-mercury-surface-materials/ ; https://ntrs.nasa.gov/citations/20160002643 . Candidate uses below are engineering proposals, not proven industrial extraction routes. Mercury surface iron is relatively low; the core is not treated as a mine.',
  );
  table(
    s,
    [
      ['INPUT', 'POSSIBLE ROLE', 'VALIDATION NEEDED'],
      [
        'Silicate-derived silicon',
        'PV material / optical substrates',
        'Purity, recovery and manufacturing',
      ],
      [
        'Mg / Al-bearing minerals',
        'Structures and reflective surfaces',
        'Extraction chemistry and alloying',
      ],
      [
        'Ceramic / silicate material',
        'Thermal layers and substrates',
        'Durability under heat and radiation',
      ],
      [
        'Imported precision technology',
        'Electronics, lasers, sensors, dopants',
        'Finite supply and replacement plan',
      ],
    ],
    224,
    [300, 365, 487],
    330,
  );
  text(
    s,
    'An iron-rich core does not imply accessible iron-rich surface ore.',
    67,
    591,
    1120,
    48,
    24,
    GOLD,
  );
}
// 06
{
  const s = slide(
    'START WITH A SEED.\nCOUNT WHAT YOU IMPORT.',
    'Baseline scenario initial conditions: engine.ts DEFAULT_MISSION and ASSUMPTIONS. These are hypothetical starting endowments; delivery, installation, capital cost and initial power-plant/factory maintenance are excluded.',
  );
  metric(s, '20 MW', 'constant surface power', 65, 263, 350, GOLD);
  metric(s, '2,000 t', 'initial factory mass', 452, 263, 350);
  metric(s, '20,000 t', 'imported precision reserve', 839, 263, 370);
  line(s, 64, 456, 1152, LINE);
  text(
    s,
    'The scenario starts after this infrastructure exists.',
    64,
    500,
    1120,
    52,
    31,
    FG,
    true,
  );
  text(
    s,
    'It does not make transport to Mercury, landing or installation free.\nThose costs and engineering tasks remain outside the current model.',
    65,
    575,
    1110,
    69,
    23,
    MUTED,
  );
}
// 07
{
  const s = slide(
    'EVERY TONNE HAS A HISTORY.',
    'Illustrative incremental mass balance per 1 tonne manufactured. Local fraction 0.98; imported fraction 0.02; ore yield 0.25; factory expansion share 0.18. Model arithmetic, not a refinery recipe.',
  );
  label(
    s,
    'ILLUSTRATIVE FLOW PER 1 TONNE OF NEW FACTORIES + COLLECTORS',
    65,
    173,
    1150,
  );
  table(
    s,
    [
      ['IN', 'TONNES', 'OUT', 'TONNES'],
      ['Ore excavated', '3.92', 'Tailings', '2.94'],
      ['Imported components', '0.02', 'New factories', '0.18'],
      ['', '', 'New collectors', '0.82'],
      ['TOTAL', '3.94', 'TOTAL', '3.94'],
    ],
    230,
    [360, 160, 460, 172],
    310,
  );
  text(
    s,
    'No invisible imports. No disappearing waste.',
    65,
    580,
    1120,
    57,
    31,
    GOLD,
    true,
  );
}
// 08
{
  const s = slide(
    'ESCAPE IS ONLY\nTHE FIRST MANEUVER.',
    'Mercury reference: https://ssd.jpl.nasa.gov/planets/phys_par.html and https://ssd.jpl.nasa.gov/astro_par.html . v_escape=sqrt(2GM/R), E_escape=GM/R. The model assumes 50% launcher efficiency and 25 MJ/kg additional transfer energy. No trajectory is solved.',
  );
  metric(
    s,
    n(sim.escapeSpeedMs / 1000) + ' km/s',
    'Mercury escape-speed scale',
    64,
    235,
    360,
    GOLD,
  );
  metric(
    s,
    n(sim.escapeLowerBoundJkg / 1e6) + ' MJ/kg',
    'escape-energy lower bound',
    460,
    235,
    360,
  );
  text(s, n(sim.launchJkg / 1e6), 854, 235, 365, 88, 62, FG, true);
  text(s, 'MJ/kg · launch + transfer input', 854, 325, 365, 58, 20, MUTED);
  line(s, 64, 428, 1152, LINE);
  text(
    s,
    'ACCELERATE → INSERT → UNFOLD → VERIFY',
    64,
    483,
    1152,
    59,
    33,
    FG,
    true,
  );
  text(
    s,
    'Launcher throughput is a constraint. Navigation, payload loads,\nstation keeping and collision avoidance remain engineering work.',
    65,
    572,
    1090,
    76,
    24,
    MUTED,
  );
}
// 09
{
  const s = slide(
    'RADIATORS ARE PART\nOF THE POWER PLANT.',
    'Design thermal screen: T=[flux*(absorptivity-efficiency)/(emissivity*sigma*radiatorRatio)]^(1/4). Baseline and two perturbations are calculated using the same engine. 600 K is an assumed material limit, not a qualified operating temperature. No transient failure temperature is predicted.',
  );
  const failed = simulate({ radiusAU: 0.3, radiatorRatio: 0.5 }),
    repaired = simulate({ radiusAU: 0.3, radiatorRatio: 2 });
  chart(
    s,
    'bar',
    ['0.4 AU / ratio 2', '0.3 AU / ratio 0.5', '0.3 AU / ratio 2'],
    [
      {
        name: 'Design temperature K',
        values: [
          Math.round(sim.temperatureK),
          Math.round(failed.temperatureK),
          Math.round(repaired.temperatureK),
        ],
        fill: BLUE,
        points: [{ idx: 1, fill: '#B47462' }],
      },
    ],
    64,
    240,
    790,
    342,
    'Temperature / K',
  );
  text(s, '600 K', 923, 282, 290, 80, 55, FG, true);
  text(s, 'ASSUMED LIMIT', 927, 369, 280, 35, 16, MUTED);
  text(
    s,
    'Above the limit:\nzero orbital\nelectrical output.',
    927,
    430,
    279,
    132,
    27,
    GOLD,
  );
}
// 10
{
  const s = slide(
    'GROWTH STOPS\nWHEN COMPONENTS RUN OUT.',
    'Baseline model scenario; not a construction forecast. Data are from simulate(DEFAULT_MISSION), annually sampled endpoint output. Aggressive assumed manufacturing and areal masses produce fast bootstrap growth. The 20 kt precision reserve is exhausted and retired collectors are not automatically replaced.',
  );
  const annual = sim.rows.filter((_, i) => i % 12 === 0);
  chart(
    s,
    'line',
    annual.map((r) => String(r.year)),
    [
      {
        name: 'Orbital electrical power',
        values: annual.map((r) => Number((r.grossPowerW / 1e9).toFixed(6))),
        line: { fill: GOLD, width: 3 },
        marker: { symbol: 'none' },
      },
    ],
    64,
    232,
    1152,
    355,
    'Orbital output / GW',
  );
  text(
    s,
    'More sunlight cannot manufacture missing precision electronics.',
    65,
    607,
    1140,
    40,
    25,
    MUTED,
  );
}
// 11
{
  const s = slide(
    'COLLECTED POWER\nIS NOT DELIVERED POWER.',
    'Default year-30 endpoint scenario. Calculated by engine.ts. The offered link budget excludes the industrial reinvestment share. Earth output includes Gaussian capture, conversion, atmosphere, availability, peak-intensity and grid limits. Relay construction and detailed cooling are excluded.',
  );
  const nodes = [
    ['SUNLIGHT', n(b.interceptedW / 1e12) + ' TW'],
    ['ORBITAL DC', n(b.grossPowerW / 1e9) + ' GW'],
    ['EARTH OFFER', n(b.exportOfferedW / 1e9) + ' GW'],
    ['EARTH GRID', n(b.gridW / 1e6) + ' MW'],
  ];
  nodes.forEach(([l, v], i) => {
    const x = 65 + i * 300;
    label(s, l, x, 264, 280);
    text(s, v, x, 315, 281, 78, 45, i === 3 ? BLUE : GOLD, true);
    if (i < 3) arrow(s, x + 264, 342, 27);
  });
  line(s, 64, 461, 1152, LINE);
  text(
    s,
    'The fixed receiving facility saturates.',
    64,
    505,
    1140,
    59,
    34,
    FG,
    true,
  );
  text(
    s,
    'Building more collectors does not automatically expand the grid connection.',
    65,
    580,
    1140,
    49,
    24,
    MUTED,
  );
}
// 12
{
  const s = slide(
    'DISTANCE CHANGES\nTHE TRANSMISSION PROBLEM.',
    'Default 30-year endpoint, same collection mission and hardware diameters. Optical relay and direct microwave comparison. Ideal Gaussian beams; centering/jitter approximation. This is a propagation screen, not proof that enormous relay optics can be built. https://www.rp-photonics.com/gaussian_beams.html',
  );
  table(
    s,
    [
      ['ARCHITECTURE', 'FIRST-LEG BEAM RADIUS', 'GRID OUTPUT'],
      [
        'Direct microwave',
        n(direct.link.beamRadiusM / 1e6) + ' million m',
        n(direct.final.gridW, 0) + ' W',
      ],
      [
        'Optical + near-Earth relay',
        n(sim.link.beamRadiusM / 1000) + ' km',
        n(b.gridW / 1e6) + ' MW',
      ],
    ],
    252,
    [430, 397, 325],
    235,
  );
  text(
    s,
    'The optical relay is a major unproven infrastructure assumption.',
    65,
    540,
    1150,
    75,
    27,
    GOLD,
  );
  label(
    s,
    'Shared intensity cap and numerical engine. Architecture-specific conversion stages.',
    65,
    620,
  );
}
// 13
{
  const s = slide(
    'WHAT COULD USE\nTHE ELECTRICITY?',
    `Calculated alternatives using baseline endpoint ${b.gridW} W average grid output. 8,766 hours/year; 4 kWh/m³ water; 55 kWh/kg hydrogen; 4,000 kWh/household-year. These are illustrative intensities, not regional forecasts. All four alternatives consume the same full power budget and cannot be added. DOE electrolysis context: https://www.energy.gov/cmei/fuels/hydrogen-production-electrolysis`,
  );
  metric(
    s,
    n(uses.waterM3 / 1e6, 1) + 'M m³',
    'desalinated water per year',
    65,
    235,
    500,
    GOLD,
  );
  metric(
    s,
    n(uses.hydrogenKg / 1000, 0) + ' t',
    'hydrogen per year',
    705,
    235,
    500,
  );
  metric(
    s,
    n(uses.households, 0),
    'household energy equivalents',
    65,
    436,
    500,
  );
  metric(
    s,
    n(uses.computeMW) + ' MW',
    'continuous computing facility load',
    705,
    436,
    505,
    BLUE,
  );
  label(
    s,
    'Choose one full-budget equivalent. Plant capital, materials, storage and distribution still matter.',
    65,
    626,
  );
}
// Additional engineering briefings requested for the StarBound expansion.
{
  const s = slide(
    'DELIVER THE ROBOTS.\nCOMMISSION THE SEED.',
    'Conceptual robotic deployment architecture; ESA BepiColombo overview provides an orbiter precedent, not a landing design. https://www.esa.int/Science_Exploration/Space_Science/BepiColombo_overview2 . StarBound landing estimator assumes 4.5 km/s Δv, 450 s Isp and a lander dry mass equal to 20% of payload.',
  );
  const d = seedDelivery(2000, 0.2);
  const steps = [
    ['SURVEY', 'Map terrain and test feedstock.'],
    ['DELIVER', 'Launch cargo; design transit and capture.'],
    ['LAND', 'Powered descent and robotic unloading.'],
    ['COMMISSION', 'Power, thermal control and process tests.'],
  ];
  steps.forEach(([a, b], i) => {
    const x = 65 + i * 296;
    label(s, `0${i + 1}`, x, 225, 250);
    text(s, a, x, 278, 270, 44, 27, FG, true);
    text(s, b, x, 345, 250, 114, 24, MUTED);
  });
  line(s, 65, 493, 1150);
  text(
    s,
    `2,000 t payload → ${n(d.wetTonnes, 0)} t before descent`,
    65,
    530,
    1130,
    64,
    39,
    GOLD,
    true,
  );
  label(
    s,
    'Independent landing-mass exercise. Earth launch, transit and Mercury capture are additional.',
    65,
    621,
    1150,
  );
}
{
  const s = slide(
    'THE FACTORY IS\nA CONTROLLED PROCESS.',
    'Generated concept artwork. StarBound v1.1 robot, refinery and assembly availability multiply the corresponding production capacities. Throughput is still aggregate and just-in-time; no robot navigation or refinery chemistry is solved.',
  );
  const blob = await fs.readFile(
    path.join(ROOT, 'public/assets/mercury-factory.png'),
  );
  s.images.add({
    blob,
    contentType: 'image/png',
    fit: 'contain',
    alt: 'AI-generated Mercury factory concept',
    position: { left: 65, top: 241, width: 733, height: 345 },
  });
  text(
    s,
    'Excavation\nRefining\nFabrication\nInspection',
    861,
    256,
    330,
    230,
    35,
    FG,
    true,
  );
  text(
    s,
    'An offline stage stops\nnew production.',
    861,
    534,
    330,
    81,
    25,
    GOLD,
  );
  label(
    s,
    'AI-GENERATED CONCEPT · MACHINE-LEVEL CONTROL REMAINS FUTURE WORK',
    65,
    628,
    1150,
  );
}
{
  const s = slide(
    'A SHORTER RAIL\nMEANS HIGHER LOADS.',
    'Calculated by engineering.ts massDriver(0.4,10,1000,20) and the 100 g variant. Patched-conic and constant-acceleration approximation. The separate calculator does not replace the main trajectory launch-energy assumption.',
  );
  const a = massDriver(0.4, 10, 1000, 20),
    b = massDriver(0.4, 100, 1000, 20);
  metric(
    s,
    n(a.trackM / 1000, 1) + ' km',
    'minimum track at 10 g',
    65,
    248,
    500,
    GOLD,
  );
  metric(
    s,
    n(b.trackM / 1000, 1) + ' km',
    'minimum track at 100 g',
    705,
    248,
    500,
  );
  line(s, 65, 446, 1150);
  text(
    s,
    '1,000 kg payload · 20 MW average charging power',
    65,
    483,
    1150,
    58,
    31,
    FG,
    true,
  );
  text(
    s,
    `${n(a.chargeSeconds, 0)} s ideal recharge · ${n(a.peakMechanicalW / 1e6, 0)} MW peak mechanical power at 10 g`,
    65,
    562,
    1140,
    63,
    25,
    MUTED,
  );
  label(
    s,
    `Arrival correction remains ${n(a.arrivalDeltaMs / 1000, 2)} km/s. Payload packaging and orbital insertion still require design.`,
    65,
    633,
    1150,
  );
}
{
  const s = slide(
    'NEAR-TOTAL CAPTURE\nCHANGES THE PROBLEM.',
    'Independent random projected-overlap screen: Wright (2023) §IV.5, equations 47–49. https://arxiv.org/html/2309.06564v2 . f=1-exp(-A/4πr²). Mass uses current default density and ore yield. Not a full radiative-transfer or orbital solution.',
  );
  const x = civilization(DEFAULT_MISSION, 0.9, 350);
  metric(
    s,
    '90%',
    'intercepted sunlight in this scaling case',
    65,
    258,
    555,
    GOLD,
  );
  metric(
    s,
    n(x.mercuryFraction, 2) + ' ×',
    'Mercury-equivalent ore at assumed yield',
    705,
    258,
    505,
  );
  text(
    s,
    'A uniform swarm leaves Earth 10% of direct sunlight.',
    65,
    481,
    1140,
    100,
    37,
    FG,
    true,
  );
  text(
    s,
    'Preserve illumination. Reject heat. Solve dense dynamics.',
    65,
    589,
    1140,
    56,
    27,
    MUTED,
  );
  label(
    s,
    'SEPARATE THOUGHT EXPERIMENT · THE MONTHLY SWARM MODEL STOPS AT 1% COVERAGE',
    65,
    642,
    1150,
  );
}
{
  const s = slide(
    'COMPUTE. TRAVEL.\nBUILD NEW ENVIRONMENTS.',
    'Independent engineering bounds for a 1 GW power budget; 350 K radiator, 1,000 kg vehicle at 0.1c, and 2 rpm habitat. Stefan-Boltzmann cooling, relativistic kinetic energy and centripetal acceleration. Every use takes the entire budget separately; hardware, losses and life support are additional. NASA NIAC context: https://www.nasa.gov/general/a-breakthrough-propulsion-architecture-for-interstellar-precursor-missions/ ; habitat context: https://ntrs.nasa.gov/citations/19770014162/',
  );
  const x = spaceUses(1e9, 350, 1000, 0.1, 2);
  const data = [
    [
      'DATA CENTERS',
      n(x.computeCoolingM2 / 1e6, 2) + ' km²',
      'ideal radiator surface\nfor 1 GW at 350 K',
    ],
    [
      'INTERSTELLAR',
      n(x.idealAccelerationYears, 1) + ' years',
      'energy supply at 1 GW\nfor 1 tonne to 0.1c',
    ],
    [
      'HABITATS',
      n(x.habitatRadiusM, 0) + ' m',
      'radius for 1 g at the rim\nwith 2 rpm rotation',
    ],
  ];
  data.forEach(([a, b, c], i) => {
    const x = 65 + i * 414;
    label(s, a, x, 244, 350);
    text(s, b, x, 316, 355, 93, 51, i === 0 ? GOLD : FG, true);
    text(s, c, x, 431, 349, 105, 25, MUTED);
  });
  line(s, 65, 581, 1150);
  text(
    s,
    'Energy enables a design. It does not finish one.',
    65,
    610,
    1140,
    53,
    29,
    GOLD,
    true,
  );
}
// 14
{
  const s = slide(
    'ASTRA PROPOSES.\nTHE ENGINE DECIDES.',
    'Implementation: scripts/astra-runner.mjs, lib/simulation/experiment.ts. Real authenticated local Codex calls; three sequential structured proposals. No native mid-turn steering is claimed. The model cannot edit physical constants, fixed budgets, or the grader.',
  );
  const xs = [65, 480, 895],
    titles = ['PROPOSE', 'EVALUATE', 'REVISE'],
    desc = [
      'A bounded policy in\nvalidated JSON.',
      'Independent physics,\naccounting and score.',
      'Measured feedback\nfor the next attempt.',
    ];
  xs.forEach((x, i) => {
    text(s, `0${i + 1}`, x, 258, 290, 65, 43, GOLD);
    line(s, x, 350, 285);
    text(s, titles[i], x, 389, 300, 48, 31, FG, true);
    text(s, desc[i], x, 470, 295, 89, 25, MUTED);
    if (i < 2) arrow(s, x + 323, 315, 55);
  });
  label(
    s,
    'Fixed challenge: ≥10 MW at month 120, after availability, with minimum cumulative Mercury mining.',
    65,
    616,
  );
}
// 15
{
  const s = slide(
    'PUBLISH THE COMPARISON.\nEVEN WHEN IT IS A TIE.',
    'Measured records: results/astra.json, results/sol.json, results/search.json, results/comparison.json. One experiment per model with three successive proposals, requested high effort, same initial mission and own prior feedback. Search has 1,008 evaluations and is not equal-budget. No general capability or statistical latency claim.',
  );
  table(
    s,
    [
      ['METHOD', 'EVALUATIONS', 'BEST ORE MINED', 'GRID POWER'],
      [
        'GPT-6 Astra',
        '3',
        n(comp.astra.best.result.minedMt, 6) + ' Mt',
        n(comp.astra.best.result.gridMW, 3) + ' MW',
      ],
      [
        'GPT-5.6 Sol',
        '3',
        n(comp.sol.best.result.minedMt, 6) + ' Mt',
        n(comp.sol.best.result.gridMW, 3) + ' MW',
      ],
      [
        'Coarse grid',
        '1,008',
        n(comp.search.best.result.minedMt, 6) + ' Mt',
        n(comp.search.best.result.gridMW, 3) + ' MW',
      ],
    ],
    238,
    [400, 215, 287, 250],
    277,
  );
  text(
    s,
    'This task does not establish an Astra-only capability.',
    65,
    552,
    1120,
    55,
    30,
    GOLD,
    true,
  );
  label(
    s,
    `Observed 3-round wall time: Astra ${n(comp.astra.totalSeconds, 1)} s / Sol ${n(comp.sol.totalSeconds, 1)} s. One run, not a latency benchmark.`,
    65,
    622,
  );
}
// 16
{
  const s = slide(
    'THE USEFUL ANSWER:\nSTOP OVERBUILDING.',
    'Astra first-round proposal and engine result, results/astra.json. Compare with its ten-year initial mission, not the 30-year overview. The fixed receiver saturates. The selected policy uses zero orbital reinvestment and zero factory expansion. It remains an idealized fixed-policy model; a stoppable production controller is future work.',
  );
  metric(
    s,
    n(comp.astra.best.result.minedMt, 3) + ' Mt',
    'Astra policy: ore mined over 10 years',
    65,
    267,
    555,
    GOLD,
  );
  const baseline = JSON.parse(
    await fs.readFile(path.join(ROOT, 'results/astra.json'), 'utf8'),
  ).baseline;
  metric(
    s,
    n(baseline.minedMt, 2) + ' Mt',
    'initial policy: ore mined over 10 years',
    704,
    267,
    500,
  );
  text(
    s,
    'Same endpoint Earth power. Less construction.',
    64,
    471,
    1140,
    70,
    38,
    FG,
    true,
  );
  text(
    s,
    'The model contribution is a testable engineering decision.\nThe comparison shows that Sol can discover it too.',
    65,
    568,
    1120,
    72,
    24,
    MUTED,
  );
}
// 17
{
  const s = slide(
    'RUN THE\nMISSION.',
    'StarBound includes mission, robot, manufacturing, collector, Earth-power, civilization, Astra, build and research tabs. Image is an AI-generated engineering concept, not a screenshot or flight-qualified design. Public website supports simulation and recorded experiments; live inference uses the local Codex adapter.',
  );
  text(
    s,
    'Change the orbit.\nBreak the thermal design.\nInspect the power link.\nApply an Astra proposal.',
    65,
    260,
    394,
    230,
    30,
    MUTED,
  );
  text(s, 'Export every result.', 65, 557, 395, 60, 27, GOLD, true);
  const image = await fs.readFile(
    path.join(ROOT, 'public/assets/solar-collector.png'),
  );
  s.images.add({
    blob: image,
    contentType: 'image/png',
    fit: 'contain',
    alt: 'AI-generated solar collector engineering concept',
    position: { left: 484, top: 80, width: 732, height: 565 },
  });
  label(s, 'AI-GENERATED COLLECTOR CONCEPT', 492, 610, 720);
}
// 18
{
  const s = slide(
    'ONE ENGINE.\nEVERYWHERE.',
    'Architecture: docs/ARCHITECTURE.md. Public React site has no inference credentials. Loopback adapter uses a temporary token, fixed origins, bounded requests and a read-only local Codex call. Model proposal is validated before host grading.',
  );
  const boxes = [
    {
      x: 65,
      y: 253,
      w: 320,
      t: 'PUBLIC SIMULATOR',
      b: 'React + Three.js\nControls / replay / export',
    },
    {
      x: 480,
      y: 253,
      w: 320,
      t: 'NUMERICAL CORE',
      b: 'Pure TypeScript\nMass / heat / links',
    },
    {
      x: 895,
      y: 253,
      w: 320,
      t: 'LOCAL ASTRA LAB',
      b: 'Codex inference\nSchema + host grade',
    },
  ];
  boxes.forEach((q) => {
    line(s, q.x, q.y, q.w);
    text(s, q.t, q.x, q.y + 25, q.w, 58, 23, FG, true);
    text(s, q.b, q.x, q.y + 108, q.w, 90, 25, MUTED);
  });
  arrow(s, 411, 317, 50);
  arrow(s, 824, 317, 50);
  text(
    s,
    'MODEL OUTPUT CANNOT REWRITE THE PHYSICS',
    65,
    550,
    1150,
    59,
    31,
    GOLD,
    true,
  );
  label(
    s,
    'Documented contracts · finite input bounds · reproducible JSON · no public model credential',
    65,
    618,
  );
}
// 19
{
  const s = slide(
    'EXECUTE IN\nMEASURABLE STAGES.',
    'Execution plan in docs/ARCHITECTURE.md. Stage 1 is the hackathon release. Follow-on stages require research and domain validation; no construction calendar is promised.',
  );
  const rows = [
    [
      '01 / SHIP THE LAB',
      'Conservation-tested engine, interactive mission, recorded models, source and deck.',
    ],
    [
      '02 / ADD INDUSTRIAL FIDELITY',
      'Inventory, factory lead times, material grades, repair and controllable production.',
    ],
    [
      '03 / MODEL REAL GEOMETRY',
      'Transfers, ephemerides, receiver networks, pointing and relay cooling.',
    ],
    [
      '04 / EVALUATE ROBUSTLY',
      'Held-out failures, repeated trials, uncertainty, conventional optimizers and cost.',
    ],
  ];
  rows.forEach(([a, b], i) => {
    const y = 231 + i * 100;
    line(s, 65, y, 1150);
    text(s, a, 65, y + 23, 335, 64, 23, i === 0 ? GOLD : FG, true);
    text(s, b, 465, y + 22, 735, 68, 24, MUTED);
  });
}
// 20
{
  const s = slide(
    'THE OPEN QUESTIONS\nARE PART OF THE DESIGN.',
    'Scientific limitations: docs/PHYSICS.md and docs/MERCURY-TO-EARTH.md. NASA OTPS assessment: https://www.nasa.gov/organizations/otps/space-based-solar-power-report/ . Its specific Earth-orbit concepts do not validate a Mercury swarm.',
  );
  const cols = [
    [
      'MATERIALS',
      'Extraction chemistry.\nPrecision imports.\nLifetime and replacement.',
    ],
    [
      'PHYSICS',
      'Orbital collisions.\nRelay heat rejection.\nDense-swarm feedback.',
    ],
    [
      'USEFULNESS',
      'Delivered-energy cost.\nLifecycle emissions.\nDemand and alternatives.',
    ],
  ];
  cols.forEach(([a, b], i) => {
    const x = 65 + i * 415;
    line(s, x, 258, 320);
    text(s, a, x, 296, 320, 54, 28, FG, true);
    text(s, b, x, 388, 320, 165, 27, MUTED);
  });
  label(
    s,
    'A conserved numerical model is necessary. It is not sufficient evidence of a buildable megastructure.',
    65,
    624,
  );
}
// 21
{
  const s = slide(
    'THE THREE-MINUTE\nDEMONSTRATION.',
    'Suggested rehearsal, not a guaranteed judging schedule. Start a live run early if local inference is available; keep the explicitly labeled recorded run available because measured inference takes minutes. Never present replay as live.',
  );
  const beats = [
    [
      '00:00',
      'Open mission control',
      'Show the swarm and the difference between orbital and Earth power.',
    ],
    [
      '00:30',
      'Break a real constraint',
      'Move inward with too little radiator area. Output goes to zero.',
    ],
    [
      '01:00',
      'Test the journey',
      'Switch to direct microwave; inspect the transmission loss.',
    ],
    [
      '01:35',
      'Apply Astra’s policy',
      'Recalculate the low-mining proposal and inspect its host score.',
    ],
    [
      '02:20',
      'Show the evidence',
      'Publish the Sol tie, source assumptions and the engineering roadmap.',
    ],
  ];
  beats.forEach(([t, title, desc], i) => {
    const y = 220 + i * 80;
    text(s, t, 65, y, 120, 40, 23, GOLD);
    text(s, title, 211, y, 310, 52, 25, FG, true);
    text(s, desc, 560, y, 645, 60, 22, MUTED);
    if (i < 4) line(s, 65, y + 66, 1150);
  });
}
// 22
{
  const s = slide(
    '',
    'All project material is available at https://github.com/vnmoorthy/starbound . Demo: https://starbound.vnmoorthy.chatgpt.site . Built by vnmoorthy with AI assistance. No affiliation with SpaceX, NASA, YC or scientific-source authors. No hackathon outcome is guaranteed.',
  );
  text(s, 'THE NEXT MISSION\nIS TO TEST IT.', 64, 110, 1120, 218, 76, FG, true);
  line(s, 69, 387, 150, GOLD, 3);
  text(
    s,
    'Explore the swarm. Challenge the assumptions.\nReproduce the experiment.',
    65,
    434,
    1120,
    98,
    31,
    MUTED,
  );
  text(s, 'github.com/vnmoorthy/starbound', 65, 570, 1140, 42, 27, FG, true);
  label(s, 'LIVE DEMO: starbound.vnmoorthy.chatgpt.site', 65, 633, 1150);
}
const build = path.join(ROOT, '.build', 'deck');
await fs.mkdir(build, { recursive: true });
await fs.mkdir(path.join(ROOT, 'deliverables'), { recursive: true });
const candidate = path.join(build, 'candidate-starbound-v3.pptx');
await (await PresentationFile.exportPptx(P)).save(candidate);
console.log(`Created ${S.length} slides with ${FONT}; exporting previews.`);
for (let i = 0; i < S.length; i++) {
  const png = await P.export({ slide: S[i], format: 'png', scale: 1 });
  await fs.writeFile(
    path.join(build, `slide-${String(i + 1).padStart(2, '0')}.png`),
    new Uint8Array(await png.arrayBuffer()),
  );
  if ((i + 1) % 4 === 0) console.log(`Rendered ${i + 1}/${S.length}`);
}
const finalPath = path.join(
  ROOT,
  'deliverables',
  'StarBound-Mission-Briefing-Release.pptx',
);
const result = await finalizePresentation({
  workspaceDir: ROOT,
  candidatePath: candidate,
  finalPath,
  pythonExecutable: process.env.RUNTIME_PYTHON,
  integrityValidatorPath: path.join(
    SKILL,
    'container_tools/inspect_presentation_package_integrity.py',
  ),
  layoutValidatorPath: path.join(
    SKILL,
    'container_tools/inspect_presentation_layout_geometry.py',
  ),
  layoutArgs: [
    '--expected-slide-size-emu',
    '12192000,6858000',
    '--validate-bullet-geometry',
    '--validate-heading-fit',
    ...tableOwners.flatMap((n) => ['--require-native-table-slide', String(n)]),
  ],
  requiredNativeTableOwnerSlides: tableOwners,
  requiredNativeChartOwnerSlides: chartOwners,
  materializeLiteralChartWorkbooks: true,
  fontPolicy: { basis: 'design', families: [FONT] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(build, 'validation-release.json'),
});
console.log(JSON.stringify(result));
await fs.writeFile(
  path.join(build, 'manifest.json'),
  JSON.stringify(
    { slideCount: S.length, font: FONT, chartOwners, tableOwners, finalPath },
    null,
    2,
  ),
);
