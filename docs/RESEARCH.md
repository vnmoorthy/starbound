# StarBound research notes

This is a targeted engineering literature review, not a claim to have read every Dyson-sphere paper. Sources establish context or equations; they do not certify the proposed robots, manufacturing routes, collectors or energy network.

| Reference | Contribution to this project | Boundary |
|---|---|---|
| [Wright, *Dyson Spheres* (2020)](https://arxiv.org/abs/2006.16734) | General framework for stellar energy interception and radiative behavior | A conceptual review, not a Mercury construction specification |
| [Wright, *Application of the Thermodynamics of Radiation…* (2023), §IV.5](https://arxiv.org/html/2309.06564v2) | Random-swarm optical depth and intercepted fraction, equations 47–49 | Used only in the separate Civilization calculator; dense dynamics are absent |
| [Shubov, *Guided Self Replicating Factory…* (2021), §§2, 6](https://arxiv.org/abs/2110.15198) | Industrial bootstrapping and continued dependence on complex imports | Speculative preprint; its guided factories involve people, not demonstrated autonomous Mercury robots |
| [Smith, *Review and viability of a Dyson Swarm…* (2022)](https://doi.org/10.1088/1402-4896/ac9e78) | Comparison of construction locations and transportation difficulties | Publisher text available through indexed extracts; full publisher page could not be retrieved reliably. We do not adopt its feasibility claims |
| [NASA, *Advanced automation for space missions: Technical summary* (1980)](https://ntrs.nasa.gov/citations/19810006399) | Historical context for automated space industry | Catalog/abstract consulted; complete report retrieval failed. No numerical default is attributed to it |
| [ESA, BepiColombo overview](https://www.esa.int/Science_Exploration/Space_Science/BepiColombo_overview2) | Real Mercury mission architecture uses gravity assists and propulsion | Orbiter precedent, not a landing or industrial cargo demonstration |
| [NASA, electromagnetic launcher technical brief (2013)](https://ntrs.nasa.gov/api/citations/20130014525/downloads/20130014525.pdf) | Electromagnetic launcher concept context | Does not qualify a Mercury mass driver |
| [NASA NIAC, *A Breakthrough Propulsion Architecture for Interstellar Precursor Missions* (2018)](https://www.nasa.gov/general/a-breakthrough-propulsion-architecture-for-interstellar-precursor-missions/) | Beam-powered propulsion research context | Does not establish StarBound's interstellar vehicle or conversion assumptions |
| [NASA SP-413, *Space Settlements: A Design Study* (1977)](https://ntrs.nasa.gov/citations/19770014162/) | Habitat systems must include much more than power | Historical design study; no existing habitat is claimed |
| [NASA/JPL planetary parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html) and [astrodynamic parameters](https://ssd.jpl.nasa.gov/astro_par.html) | Mercury radius/mass, solar and Mercury gravitational parameters | Reference constants; not a trajectory solution |
| [MESSENGER mineralogy results](https://ntrs.nasa.gov/citations/20160002643) | Accessible surface mineralogy | An iron-rich core is not treated as accessible iron ore |
| [NASA OTPS space solar power assessment](https://www.nasa.gov/organizations/otps/space-based-solar-power-report/) | Technology and economic comparison boundaries | Earth-orbit scenarios do not establish Mercury economics |

## Consequences for the proposed mission

The construction sequence needs five separate demonstrations: deliver and commission a seed; qualify mineral extraction and materials; manufacture and test collectors; launch and insert them into heliocentric orbits; and transmit useful energy while rejecting heat. Success at one stage does not demonstrate the next.

The current numerical mission assumes its seed has already been installed. The Robot tab therefore includes an independent landing-mass estimate and a conceptual arrival sequence. It does not hide an unmodeled Earth-to-Mercury transport campaign inside the first month of industrial growth.

Three controllable availabilities now scale excavation, refining and manufacturing capacity. A zero-availability stage stops just-in-time production; material is not manufactured through an offline process. Robot path planning, surface traffic, contact mechanics and machine-level scheduling require another simulation layer.

Collector design is explicit about bulk mass, radiator mass and imported components. The illustrative 100 × 100 m module is a convenient accounting unit. Semiconductor purity, optical manufacture, folding mechanisms and acceleration tolerance remain qualification work.

The mass-driver calculator separates acceleration, track length, kinetic energy, average recharge power and peak mechanical power. It includes a patched-conic departure-speed estimate and a separate heliocentric arrival correction. The main production model retains its documented aggregate launch/transfer energy; the calculator is not silently substituted into historical experiments.

Energy reinvestment is already coupled to industrial production with a one-month activation delay. Growth can stop despite abundant power when components or capacity run out. That is why a fixed receiver can make additional construction wasteful within this objective.

Near-total capture is a separate thought experiment. Its projected-overlap screen and mass estimates cannot establish orbital stability or a dense swarm's thermal behavior. A uniform distribution also reduces the direct sunlight reaching Earth. Illumination-preserving corridors or other explicit solutions are a missing requirement, not a feature solved by exporting electricity.

## What Astra contributes, and what remains unproven

Astra provides structured policy proposals and explanations, receives independent numerical feedback, and revises. The deterministic host owns the calculations and the grade. This is useful engineering assistance, but is not a physics credential.

The completed v1 Astra, Sol and grid-search trials tied on the declared mining score. The v1.1 availability controls preserve v1 default numerical behavior but are new interfaces and failure parameters, not a new capability benchmark. There is no defensible claim that Sol cannot build or operate this simulator.

A stronger future evaluation should lock a held-out suite before running either model: coupled equipment outages, changing objectives, uncertain materials, multimodal fault evidence, and time-limited recovery. Both models must receive equivalent data, valid actions and budgets; a classical controller should be included. Record constraint violations, success rate, latency and cost across repeated trials. Native steering can be tested separately if supported, without confusing interface differences with intelligence.
