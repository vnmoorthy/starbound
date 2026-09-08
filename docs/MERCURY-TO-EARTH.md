# From Mercury resources to useful power: the engineering roadmap

This is the complete **conceptual** mission sequence. The runnable v1 models aggregate material and energy flows; it does not establish that the required technology, cost or construction schedule is feasible. The simulated year count starts after a hypothetical seed installation is operating.

## Mission 0 — establish why this should exist

Compare a Mercury swarm with terrestrial renewables/storage and Earth-orbit space solar power on identical delivered-energy, capital, maintenance and lifecycle boundaries. Name the user and their alternative. A star-scale visual is not evidence of energy competitiveness. StarBound's practical near-term use is engineering education and AI evaluation.

## Mission 1 — characterize accessible Mercury resources

Map the surface and subsurface with instruments and sample-return or in-situ analysis. Test recovery from actual mineral phases, not just elemental abundance. Identify terrain, thermal cycling, abrasive dust, power availability, communications and scientific preservation constraints.

| Feedstock / component | Candidate role | What must be demonstrated |
|---|---|---|
| Silicate-derived silicon | Photovoltaic material or optical/glass substrates | High-purity separation, crystal/film production, contamination control |
| Magnesium- and aluminum-bearing minerals | Candidate structural alloys and reflective surfaces | Economical extraction and alloying; the metals are not ready-made surface stock |
| Ceramic / silicate material | Insulation, substrates and shielding | Manufacturability, thermal cycling and radiation durability |
| Iron | Limited candidate material from selected deposits | Mercury's metal-rich core is not an accessible mining plan; surface iron is relatively low |
| Imported precision technology | Electronics, sensors, lasers, dopants, advanced components | Finite import reserve; exact bill of materials and replacement schedule |

MESSENGER observations show magnesium-rich/low-aluminum ratios relative to common comparison rocks and surface iron below what the planet's core might suggest. They do not prove profitable ore deposits or industrial recovery yields. [NASA composition](https://science.nasa.gov/photojournal/major-element-composition-of-mercury-surface-materials/), [NASA mineralogy](https://ntrs.nasa.gov/citations/20160002643)

## Mission 2 — deliver a seed industrial base

Transport robotic excavation/refining equipment, solar power, thermal systems, communications, spare parts and precision-component stock. Include the mass and energy required to get from Earth to Mercury; low Mercury escape speed does not make the outbound Earth-to-Mercury mission easy. Choose actual trajectory solutions before estimating payloads or launch counts.

StarBound starts with an assumed 20 MW surface source, 2,000-tonne factory and 20,000-tonne precision-component reserve. These are explicit initial conditions, not recommendations derived from a launch architecture. A credible follow-on study must design their delivery and operating environment.

## Mission 3 — mine, separate and refine

Excavate, crush and sort feedstock; measure recovery and reagent recycling. Carry all tailings and process losses in the mass balance. Develop extraction chemistry for the actual reduced mineralogy. Identify how oxygen/other byproducts could be used without assuming they are all valuable or recoverable.

The simulator's single 25% yield collapses this chemistry into one input. One tonne of finished hardware requires 0.98 t local material and 0.02 t imported technology; at that yield, the local material starts as 3.92 t ore and leaves 2.94 t tailings. This is accounting, not a real recipe.

## Mission 4 — fabricate collectors and radiators

Manufacture bulk structures and substrates, integrate photovoltaic elements, power electronics, thermal surfaces and pointing systems, and perform optical/electrical/thermal tests. Use modular units with a known replacement strategy. Do not count “thin film” mass while forgetting radiator, wiring, structures, deployment mechanisms and attitude control.

The runnable path is a photovoltaic swarm. The linked Kurzgesagt explainer also discusses lightweight mirrors and centralized collection; a mirror/receiver architecture needs a separate optical and thermal model before comparison. We do not mix mirror mass assumptions with photovoltaic efficiency. [Video inspiration](https://www.youtube.com/watch?v=pP44EPBMb8A)

## Mission 5 — launch, insert and commission

Package robust folded assemblies. Develop an electromagnetic accelerator and its thermal/power system. Qualify launch loads, terrain length, exit trajectory, collision risk and payload survivability. Give each assembly the propulsion/navigation needed to enter an appropriate heliocentric orbit; escape alone does not do this. Verify deployment and power before counting the unit as productive.

In v1, launcher capacity and a separate transfer-energy allowance limit the flow. Actual launch windows, flight times, collector injection and commissioning are future fidelity work.

## Mission 6 — grow while keeping accounts

Return part of orbital electrical output to Mercury industry. Invest some finished mass in more industrial modules. Keep imports, ore quotas, thermal limits, launch capacity and retirements explicit. Allow stopping growth when useful demand is already served—otherwise a model can confuse more construction with a better plan.

Astra's role is to propose policies under a fixed scenario, receive measured feedback and revise. The independent engine decides whether the plan meets its target. A broad future mission planner should optimize phased policies with explicit operating/commissioning delays, rather than extrapolate unconstrained exponential doubling.

## Mission 7 — build a power-delivery network

The proposed Earth chain is optical transmission to a near-Earth receiver, conversion to electricity, microwave transmission to a ground rectenna, then conversion and grid integration. Receiver and transmitter diameters determine diffraction capture; pointing and thermal limits matter as much as harvested power. Include receiver build mass and radiator needs in the next engineering revision.

Provide fail-off controls, independent beam-path verification, satellite/airspace coordination, redundancy, receiver switching, demand matching and thermal limits. The simulator's peak-intensity ceiling is a design input, not certification. A network of receivers can potentially serve more demand than one, but its material, electrical and operational costs must also grow.

## Mission 8 — prioritize useful outcomes

- **Water:** electricity for desalination and pumping, coupled with real intake, brine and distribution plans.
- **Industry:** electricity for electrolytic hydrogen, industrial feedstocks and process heat, with materials and storage accounted for.
- **Resilient electricity:** additional generation where grid topology, storage and receiving infrastructure can use it.
- **Research and computing:** facility power for simulations and computation; chips, cooling and useful work remain separate resources.
- **Space industry:** process materials or compute in orbit, avoiding the final Earth delivery link. This is a conceptual option, not a modeled facility in v1.

These are conditional uses of electricity. No scenario alone establishes cheaper power, zero lifecycle emissions, solved water scarcity or unlimited AI computation. A useful engineering result can be a reason **not** to enlarge a swarm when downstream constraints dominate.

## Real-world validation sequence

Material experiments → integrated robotic process pilot → collector thermal/vacuum qualification → small launch/insertion demonstration → small power-link demonstration → independent lifecycle/cost comparison → staged fleet design. Each step should have measured acceptance criteria and a stop condition. There is no justified calendar estimate for a complete Mercury-to-Earth Dyson swarm in this project.

## Expanded operational sequence in StarBound

1. **Survey and choose a site:** characterize materials, terrain, thermal exposure and line of sight. Test samples before committing to an extraction route.
2. **Ship an industrial manifest:** launch survey robots, landers, factory modules, a seed power system, thermal-control equipment and finite precision spares. Transit uses a designed propulsion/gravity-assist campaign, not free fall toward the Sun.
3. **Land and commission:** perform orbit capture and powered descent, then deploy radiators, communications, power cables, work pads and shelters. The Robot tab sizes a hypothetical landing mass; these phases are not a mission calendar.
4. **Run surface robots:** excavators feed haulers; manipulators handle processing; assembly and inspection machines qualify output. Local autonomy handles delays and loss of Earth contact. Availability controls affect aggregate throughput; autonomous navigation remains future work.
5. **Create material streams:** classify feedstock, recover candidate metals and silicates, refine to useful grades and manage tailings. Reagents, electrodes, seals, tooling and contamination must be accounted for in a real process model.
6. **Manufacture collectors:** form structural film, deposit or bond photovoltaic material, add radiators and support members, install imported electronics/optics, test, fold and package. A 100 × 100 m collector is a sizing example, not a flight design.
7. **Launch a protected payload:** charge storage, accelerate along a mass-driver track, recover its carrier if applicable and verify exit state. Peak pulse power and average charging power are different constraints. Payload protection must survive acceleration.
8. **Insert and deploy:** correct the heliocentric orbit, unfold, point the active surface toward the Sun and establish thermal equilibrium. Arrival propulsion and deployment energy are not made unnecessary by electromagnetic launch.
9. **Close the energy-growth loop:** send a controlled portion of collected electrical energy back to Mercury. After losses it powers extraction, processing and more production. Count finite imports, factory growth, component failure and retirement.
10. **Expand a useful network:** add appropriately spaced orbital populations and power relays only where output can be received or used. A dense swarm needs a new validated dynamics/radiative model, not merely more rendered satellites.
11. **Deliver power to a load:** compare an Earth rectenna/grid route with computing or manufacturing in space. Account for every beam, conversion and cooling stage. The present Mercury-return link is a lumped assumption; the Earth link has a separate diffraction screen.
12. **Evaluate a civilization-scale architecture:** preserve Earth illumination; provide waste-heat escape; compare raw material demand with extractable stocks. Use energy bounds for interstellar travel and artificial-gravity geometry for habitats, then design the many missing propulsion and life-support systems.

The [research register](RESEARCH.md) distinguishes conceptual studies, reference data and unverified engineering assumptions. The [scientific model](PHYSICS.md#9-starbound-v11-operational-and-civilization-calculators) gives the implemented calculations.
