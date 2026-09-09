# Console guide

| Tab | What you control | What pushes back |
|---|---|---|
| **Mission control** | Orbit radius, efficiency, collector mass, radiator ratio, retirement | Live 3D swarm, design temperature, 30-year power trajectory, bottleneck readout |
| **Robot control** | Excavation availability, safe mode, comms-loss drill, seed delivery, landing mass | Feedstock starvation propagating downstream |
| **Manufacturing** | Refinery and assembly availability, ore yield, factory expansion, energy reinvestment | Conserved mass ledger, collector bill of materials |
| **Collector control** | Orbit, radiator ratio, retirement, launcher throughput; separate acceleration, payload and charging-power inputs | Calculated track length, pulse power, escape and transfer bounds |
| **Earth power** | Ground receiver diameter, pointing jitter, phase geometry, link mode; additional apertures in Mission control → link | Gaussian capture, assumed 10 W/m² peak-intensity ceiling, grid cap, occultation |
| **Civilization** | Capture fraction, habitat geometry, computing radiators, kinetic energy | Near-total-capture mass and heat bounds |
| **Build sequence** | Read the six-stage construction sequence | Material ledger for the current mission |
| **Astra lab** | A bounded policy objective | Independent grading, Sol baseline, brute-force search |
| **Research** | Read methods and follow source links | Documented equations, assumptions and limitations |

Import or export a complete mission as JSON. Download the monthly trajectory as CSV. No account required.


## Two ways to explore the swarm

**Explore swarm** opens automatically with generated Sun/swarm artwork and animated representative collectors. Drag to pan, scroll or use the buttons to zoom, and pause or resume the animation. This is an interactive concept illustration; the artwork and overlay do not integrate orbital dynamics.

**Live orbits** opens the separate orbital visualization. Drag to rotate, scroll to zoom, select swarm/system/polar cameras, or freeze motion. If WebGL is unavailable, a projected canvas retains camera controls, animation, keyboard navigation and representative-collector inspection. The visualization does not drive the numerical ledger.

## Reproduce a visible power change

1. Reset to **Baseline / finite imports**. Earth delivery is approximately **13.23 MW**.
2. Open **Earth power** and set **Ground receiver diameter** to **1 km** using the numeric input. Delivery falls to approximately **3.48 MW**.
3. Restore the baseline, then load **Sun blocks Earth transmission**. Delivery becomes **0 W**.
4. Restore the baseline, then use **Robot control → Fleet safe mode**. New production stops and this replayed mission delivers **0 W**.

Availability controls rerun the mission from its start; safe mode is not a time-local intervention into an existing live fleet. The launcher-failure preset is the separate year-specific intervention. A saturated ground receiver can keep Earth power nearly constant even when orbital generation increases.

Mission controls change the monthly simulation. Landing, detailed launcher sizing, and civilization inputs are separately labeled calculators. Public Astra results are recorded experiments; actual live inference requires the local adapter and your own Codex login.
