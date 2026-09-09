# StarBound numerical model

Current monthly model: **1.1.0**; recorded model comparisons retain **1.0.0**. Implementation: [`lib/simulation/engine.ts`](../lib/simulation/engine.ts). All scenario results are conditional on the explicit assumptions below. This is a reduced-order engineering model, not a validated construction design or a research-grade orbital simulation.

## 1. System boundary

A hypothetical Mercury base already has one 2,000-tonne industrial module, a constant 20 MW surface power plant, and a finite reserve of 20,000 tonnes of imported precision technology. These starting endowments are not obtained for free in reality; their launch from Earth, transport, landing, installation, capital cost and maintenance are outside the model. So is construction of the assumed Earth power relay.

The model follows **incremental** ore extraction, conversion to manufactured mass, factory expansion, launched collectors, retirement, electricity, industrial reinvestment and power delivery to Earth. It does not assume autonomous manufacture of every part. Imported technology is a hard resource limit.

Jason Wright’s review motivates independently orbiting collectors and warns that a monolithic shell does not have passive mechanical/orbital stability. It also discusses radiative coupling and waste heat. StarBound does not implement that paper’s dense-sphere radiative-feedback model: we stay below 1% geometric coverage and make no claim to simulate completion of a whole sphere. [Wright, 2020](https://arxiv.org/abs/2006.16734)

## 2. Units and reference constants

All internal masses are kilograms, distances metres, durations seconds, energies joules and powers watts. The interface scales units for readability. A model year is 365.25 days. One megawatt-hour is 3.6e9 J.

| Constant | Model value | Basis |
|---|---:|---|
| Astronomical unit | 149,597,870,700 m | IAU defined length |
| Solar irradiance at 1 AU | 1,361 W/m² | Reference irradiance, not a live solar measurement |
| Stefan–Boltzmann constant | 5.670374419e-8 W m⁻² K⁻⁴ | SI physical constant |
| Mercury mean radius | 2,439,400 m | JPL |
| Mercury mass | 3.30103e23 kg | JPL |
| Mercury gravitational parameter | 2.203186855e13 m³/s² | JPL-scale reference |
| Earth mean radius | 6,371,000 m | Rounded mean radius |

References: [NASA irradiance](https://sunclimate.gsfc.nasa.gov/sun-and-climate), [JPL planetary parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html), [JPL astrodynamic constants](https://ssd.jpl.nasa.gov/astro_par.html).

## 3. Solar collection and thermal screen

At radius r in AU:

```text
flux = 1361 / r²                                [W/m²]
collector areal mass = panel mass + radiator ratio × 1 + 0.2 [kg/m²]
active area = active collector mass / areal mass [m²]
intercepted power = active area × flux           [W]
electrical power = intercepted power × efficiency
```

The final 0.2 kg/m² is an assumed balance-of-plant allowance. It is not a demonstrated mass budget for giant transmission optics, propulsion or shielding. Baseline photovoltaic conversion is an optimistic **30% scenario assumption**, fixed with temperature while within the design limit. It is not a proven Mercury-manufactured silicon system. Cell-level space solar technology and complete installed systems are different boundaries. [NASA power subsystem survey](https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/)

For solar absorptivity α=0.9, emissivity ε=0.85, electrical conversion η, and radiating area ratio R:

```text
T_design = [ flux × (α − η) / (ε × σ × R) ]^(1/4)
```

This assumes steady state, deep-space radiative rejection, no mutual irradiation and electrical power removed from the collector thermal boundary. R is effective radiating area, including whichever emitting surfaces the design counts. It must not be counted again as an extra factor of two. The baseline is about 480 K at 0.4 AU with R=2.

If this **rated-operation** temperature exceeds the material limit (600 K by default), the model marks the design invalid and sets orbital electrical output to zero. It does not predict the subsequent transient temperature, mechanical damage or repair. Manufacturing powered by the separate seed plant can continue, illustrating why deploying a thermally invalid design is wasteful. The reported thermal-waste power then treats absorbed sunlight as unconverted; that does not turn the invalid design into a stable operating solution.

Retirement removes a fraction of active collector mass each month, using `1 − (1 − annualLoss)^(1/12)`. Retired hardware remains in the material ledger. There is no implicit recycling, debris clearance or degradation-related recovery.

## 4. Industrial model

The six-stage construction story is represented numerically as an ideal just-in-time production batch. There are no intermediate inventory queues, transportation delays, reagents or separate industrial material grades in v1. Each factory equivalent has the following assumed annual capacity:

| Stage | Capacity per factory equivalent |
|---|---:|
| Mining | 40 million kg of ore |
| Refining | 10 million kg of recovered local material |
| Manufacturing | 8 million kg of finished hardware |
| Launch | 6 million kg of collector assemblies × launcher multiplier |

A finished kilogram is 98% local bulk and 2% imported precision components, for both new factory mass and collectors. Ore yield is 25% by default. These are simplifying design inputs, not measured Mercury industrial statistics. The baseline factory expansion share is 18% of new manufactured mass; the rest is launched. New factory equivalents equal accumulated new factory mass divided by 2 million kg, added to the initial factory equivalent.

Energy intensity assumptions:

| Process | Input energy |
|---|---:|
| Mining | 4 MJ / kg ore |
| Refining | 80 MJ / kg recovered local material |
| Manufacturing | 40 MJ / kg finished hardware |
| Escape accelerator | Mercury escape-energy lower bound / 50% efficiency |
| Transfer and insertion | Additional 25 MJ / kg launched hardware |

For expansion fraction f, local share l=0.98 and ore yield y, energy per manufactured kilogram is:

```text
E_kg = (l/y) × E_mine + l × E_refine + E_manufacture
       + (1−f) × E_launch
```

The industrial power budget is the seed plant plus 50% of the orbital electricity allocated to industrial return. The 50% is an aggregate return-link assumption; an actual orbit-to-Mercury link requires its own geometry, receiving hardware, pointing, thermal and availability design. Eight percent of surface power is reserved for operations. Unused process energy is not stored for future months.

The monthly batch is the minimum supported by mining, refining, manufacturing, launch, energy, remaining imported components, remaining ore quota and sparse-swarm coverage. A launcher shock changes its capacity from a configured year onward. This balanced batch avoids accidentally producing more final mass than an upstream stage can supply. It is an ideal scheduling assumption, not a detailed plant controller.

### Update order and conservation

1. Read starting hardware and calculate this month’s power.
2. Retire the applicable fraction of collectors.
3. Calculate independent production ceilings from starting factory capacity.
4. Produce the minimum feasible batch; debit ore, imported components and energy.
5. Divide the batch into factories and launched collectors.
6. Record the endpoint state. Newly built hardware generates or manufactures in the next step.
7. Integrate grid energy using starting-month power times the month duration.

```text
ore + imported components used
= tailings + new factory mass + active collector mass + retired collector mass

manufactured mass = new factory mass + cumulative launched mass
cumulative launched mass = active mass + retired mass
```

Each step and cumulative trajectory must conserve mass within floating-point tolerance. Process energy cannot exceed allocated energy, and stage utilization cannot exceed one. These are numerical consistency tests; conservation alone does not validate the technologies or assumptions.

## 5. Mercury launch and orbital fidelity

```text
escape energy lower bound = GM / R ≈ 9.03 MJ/kg
escape speed = sqrt(2GM/R) ≈ 4.25 km/s
modeled launch energy = (GM/R)/0.5 + 25 MJ/kg ≈ 43.1 MJ/kg
```

Escape is not a complete mission. A collector must acquire the appropriate heliocentric trajectory, avoid Mercury and other objects, unfold, orient and maintain its orbit. The fixed transfer allowance is a placeholder for that engineering, not a trajectory solution. Accelerator length under constant acceleration a would be v²/(2a); allowable payload acceleration and site constraints must be established before choosing a launcher. [JPL parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html)

The Three.js visualization projects representative inclined circular Kepler orbits; its angular rates scale as r^(-3/2). The no-WebGL canvas is an illustrative interactive projection with accelerated display motion, not a Kepler-rate integrator. Body sizes are enlarged for readability. These are not integrated ephemerides, collision-avoidance solutions or actual collector counts. Manufacturing and link calculations use aggregate state, not animated particle positions.

## 6. Earth transmission

Two architectures are compared:

- **Direct microwave:** orbital electrical power → 70% microwave conversion → interplanetary propagation → atmosphere → ground rectenna → grid.
- **Optical relay:** electrical power → 40% optical conversion → interplanetary propagation → 50% optical-to-electrical receiver → 70% microwave conversion → GEO-to-ground propagation → atmosphere → rectenna → grid.

The default optical transmitter is 100 m diameter and the relay receiver 1 km diameter. The GEO microwave transmitter is 1 km diameter, ground receiver 5 km. These very large, unproven engineering assumptions are external to the manufactured-mass ledger. Relay heat rejection and capital cost are not silently included in the small collector allowance. The comparison screens propagation; it does not prove that the optical relay is economical or buildable.

For wavelength λ, source waist w₀=D_tx/2, range L and approximate pointing jitter j:

```text
w_diffraction = sqrt(w₀² + [λL/(πw₀)]²)
w_effective   = sqrt(w_diffraction² + [2Lj]²)
capture       = 1 − exp(−2 [R_receiver / w_effective]²)
```

This is an ideal Gaussian beam and centered circular receiver, not a hard-aperture Airy pattern. Aperture truncation, sidelobes, aberrations, wavefront control and detailed tracking dynamics are omitted. Microwave wavelength is 0.0517 m; optical wavelength 1.064 micrometres. [Gaussian beam reference](https://www.rp-photonics.com/gaussian_beams.html)

Range follows a fixed selected Sun-centered phase angle: `AU × sqrt(1 + r² − 2r cos(phase))`. A line-segment check disables the link when it crosses the solar disk. The phase stays fixed throughout a scenario; **this is not an annual orbital/occultation integration**. A separate fixed 75% duty factor approximates other interruptions. Atmospheric transmission is 85%, rectenna conversion 85%, grid conversion 95%. No lower-level weather model is implied.

Final-beam power is limited by a **10 W/m² peak-intensity design ceiling** and the instantaneous grid limit. The design ceiling is not a human exposure standard or a legal/operational authorization. Apply Gaussian peak intensity, not receiver-average intensity. Cap transmission before accounting for average duty. Curtailed power is shown; receiver infrastructure is not assumed to grow with the swarm.

Thus a single fixed receiving facility can saturate while orbital generation grows dramatically. In the baseline the final ground-link output is about 13.23 MW. At the same apertures, direct interplanetary microwave output is only on the order of 100 W. The exact results are in `results/baseline.json` and are regenerated from code.

## 7. What useful power means

Electricity equivalents use a snapshot’s average grid power × 8,766 hours/year. Each use allocates the **entire** same budget, so the outcomes are alternatives, not additive benefits:

| Use | Explicit illustrative conversion |
|---|---|
| Desalinated water | 4 kWh/m³ |
| Electrolytic hydrogen | 55 kWh/kg |
| Households | 4,000 kWh per household-year |
| Computing facility | MW of continuous facility electrical load; no FLOP estimate |

These values are scenario inputs, not regional demand estimates. Water intake and brine, plant capital, electrolyzer materials, compression/storage, grid reliability, cooling and hardware remain necessary. We do not infer avoided lifecycle emissions or solved climate change from a power number. [DOE electrolysis overview](https://www.energy.gov/cmei/fuels/hydrogen-production-electrolysis)

Received power ultimately contributes heat. The model reports average added heat flux as received power divided by `4πR_Earth²`. It is not a climate model and does not calculate avoided fossil heat or radiative-forcing offsets. Most hypothetical stellar-scale energy should not be assumed suitable for unlimited export to Earth.

## 8. Interpretation and validation priorities

The baseline is a scenario, not a dated forecast. Aggressive manufacturing and mass assumptions make replication fast; timestep refinement, infrastructure lead times and chemical process validation are necessary before interpreting growth curves as engineering evidence. The next scientific model should add explicit inventories, factory construction delays, return-link geometry, orbital trajectories, detailed radiator/relay masses, uncertainty distributions and cost/lifecycle boundaries. Dense-swarm radiative coupling requires a different model.

NASA’s assessment of specific Earth-orbit solar concepts identifies assembly, autonomy, power beaming and launch/manufacturing as substantial gaps; its studied concepts cost more than terrestrial alternatives under its baseline assumptions. That report does not evaluate or endorse StarBound’s Mercury architecture. [NASA OTPS](https://www.nasa.gov/organizations/otps/space-based-solar-power-report/)

## 9. StarBound v1.1 operational and civilization calculators

`robotAvailability`, `refineryAvailability` and `plantAvailability` multiply the respective stage capacities, each bounded to [0,1]. Defaults of 1 preserve v1 default results. Zero-capacity utilization is defined as zero rather than NaN. No material accumulates between stages in the current aggregate model.

`engineering.ts` contains separate diagnostic calculators, not additions to the monthly trajectory:

- **Landing mass:** dry lander mass is a selected fraction of payload; wet mass = dry mass × exp(Δv/(g₀ Isp)). The UI assumes Δv = 4.5 km/s and Isp = 450 s. It excludes Earth launch, transit and Mercury capture propellant.
- **Circular coplanar transfer:** vis-viva determines velocities at the ends of a Hohmann transfer between the selected orbit and Mercury's 0.3871 AU circular reference. Transfer time is half its elliptical period. Mercury eccentricity, launch phase, finite burns and perturbations are absent.
- **Electromagnetic launch:** muzzle² = escape² + heliocentric departure-Δv², under a patched-conic approximation. Track length = muzzle²/(2a); input energy = payload × muzzle²/(2η), with η = 0.5. Recharge time uses average charging power. Peak mechanical power = mass × acceleration × muzzle speed. An arrival burn remains necessary. None of this certifies the payload or the rail.
- **Random projected coverage:** τ = A/(4πr²), f = 1 − exp(−τ). Inversion gives A = −4πr² ln(1−f). The UI accepts 0.1–99.9%; 100% is undefined in this approximation. This formula is from Wright (2023), §IV.5, equations 47–49. No dense radiative-transfer or orbital solution is implemented.
- **Resource screen:** total collector hardware = A × current areal density; local ore = hardware × 0.98 / yield; precision imports = hardware × 0.02. The seed, process plants, mining access and transport system are additional. Planet-equivalent ore is not a mineable reserve estimate.
- **Space computing:** ideal radiator area = dissipated power/(0.9 σ T⁴), effective emitting surface with an unobstructed cold sky. Practical heat transport, solar shielding, radiator mass and self-view penalties are excluded.
- **Interstellar energy:** kinetic-energy lower bound = (γ−1)mc², γ = 1/sqrt(1−β²). Time = energy/selected power at 100% coupling; zero power gives no finite time. This is not a lightsail acceleration trajectory. Braking, beam capture, propulsion and vehicle mass growth add requirements.
- **Rotating habitat:** r = g₀/ω², with ω from the selected rpm. Only rim acceleration is calculated; habitability is not inferred from this number.

The `Civilization` tab lets users select actual Earth-grid power, the current orbital export offer, or a separate future electrical upper estimate. Every use assumes the full selected budget independently. Fixed conversion efficiency at dense coverage is only an upper scenario estimate, not a thermodynamic solution. A fully dissipative closed capture system ultimately radiates its captured power; exported nonthermal energy requires a different boundary.
