# StarBound design decision

Date: 2026-09-08 · Mode: gstack office-hours Builder / hackathon · Branch: main

The user selected a laptop-only Dyson swarm simulator and authorized implementation, research, a SpaceX-inspired PowerPoint, a public demo and a new GitHub repository. This document records that direction; it does not claim YC endorsement or proven startup demand.

## Problem

A cinematic megastructure animation tells us almost nothing about whether a proposed construction policy respects materials, energy and infrastructure. StarBound lets a viewer change a policy and immediately inspect what fails. Its present practical output is an auditable engineering-education and AI-evaluation testbed, not affordable electricity from Mercury.

## What makes this worth showing

A judge can move collectors closer to the Sun, watch their thermal design fail, restore cooling, switch to direct microwave transmission and see Earth output collapse. Astra receives the same numerical constraints, proposes a policy, sees the measured result and revises. All proposed policies can be applied to the live simulator. No canned narrative controls the physics.

## Premises and constraints

- A Dyson swarm consists of separate orbiting collectors. A rigid shell is not the engineering target.
- A credible hackathon artifact should cover the entire conceptual material-and-energy chain while explicitly bounding numerical fidelity.
- Sparse-swarm monthly stock-and-flow modeling fits one laptop. Full multi-body orbital dynamics, detailed refinery chemistry and validated economics do not fit this first release.
- User preference is ambitious space science, not finance, drones or generic business automation.
- A model-specific advantage must be measured. This project must not assert that Sol cannot do a task simply because Astra can.
- The user requested a SpaceX-inspired deck. Use an original black/white mission-briefing aesthetic; do not imply SpaceX affiliation or reuse its logo.

## Approaches considered

| Approach | Scope | Strength | Limitation |
|---|---|---|---|
| Minimal visual explainer | Orbital scene, sliders and simple sunlight arithmetic | Fastest usable visual | Little evidence that AI adds engineering value |
| Coupled engineering laboratory — selected | Material/energy model, thermal and link budgets, repeatable model experiments, source and deck | Runnable end-to-end and auditable | Aggregate factories, assumed future technologies |
| Research-grade orbital/industrial digital twin | Multi-body integration, trajectories, refinery chemistry, uncertainty and costs | Best long-term scientific usefulness | Requires domain validation and substantially more research |

The selected approach uses React, a pure TypeScript engine, Canvas for functional orbit visualization, a local Codex inference adapter and an independent host-side grader. It can evolve toward the research-grade version without making the interface depend on a language model for arithmetic.

## Office-hours builder assessment

| Criterion | Evidence / honest status |
|---|---|
| Core delight | A design changes visibly and quantitatively when a real constraint binds |
| Showable artifact | Working simulator, numerical exports, recorded real model experiments and deck are required deliverables |
| Specific audience | Hackathon judges and space/AI builders; no named paying customer or user research is claimed |
| Narrowest useful version | Test one construction policy and one Earth-power target under fixed assumptions |
| Existing alternatives | Space construction games optimize entertainment; orbit libraries solve dynamics; SBSP research studies specific systems. StarBound joins a small transparent industrial model to repeatable LLM experiments |
| Demand | Not established. A startup/YC demand test is not passed by a polished hackathon demo |
| Model necessity | Not established. Publish a Sol comparison and ordinary-search baseline where available |

## Acceptance criteria

1. Every user-editable mission produces bounded, deterministic results or a clear validation error.
2. Monthly material accounting closes and process energy never exceeds the available industrial energy budget.
3. Thermal failure and solar occultation disable the relevant output; beaming capture and grid output stay physically bounded.
4. A real Astra experiment produces three independently evaluated policies, with failure honestly reported if access or inference fails.
5. Sol receives the same schema, model effort, initial mission, feedback budget and scoring rule. A conventional search baseline is separately labeled with its evaluation count.
6. The public site runs without a model credential. Live inference is local and uses the user's own authenticated Codex session.
7. README, source references, architecture, scientific limitations, build commands and a validated PowerPoint ship together.
8. Repository history initially attributes authored commits only to vnmoorthy, with all required dependency licenses preserved.

## Next milestones

Finish model tests and public interface; measure model experiments; render and inspect the deck; publish source and demo; rehearse the three-minute narrative. Then observe one independent viewer using the simulator without coaching. Record confusion and whether they can explain why orbital power differs from Earth power.

## Open questions

Real users and demand; Astra's comparative advantage on a broader benchmark; physically attainable areal density, manufacturing intensities, Mercury power return, giant relay optics and cooling; launch and orbital maintenance; real total cost and lifecycle emissions. These are research questions, not features a hackathon can silently assume solved.

## Reproducible release contract (review revision 1)

The minimum release is the tested numerical engine, five-view interface and canonical demo below. Then run real inference, build the presentation, and publish the exact validated source. All user-requested deliverables remain release work; this ordering is not permission to omit them. A logged inference failure is honest evidence of a blocker, not a successful Astra experiment. Missing Sol access does not block the simulator, but blocks any comparative superiority claim.

### Canonical demo fixture

Start from the complete `DEFAULT_MISSION` object in `lib/simulation/engine.ts`, not browser state from an earlier experiment. It uses a 30-year horizon, 0.4 AU collectors, radiator ratio 2, 30% conversion, 20 MW seed, 20 kt imported reserve, 65% power reinvestment, 18% mass reinvestment and the optical-relay architecture at 120° phase.

1. Run the default fixture. Check material and process-energy conservation; inspect the final import bottleneck.
2. Set orbital radius to 0.3 AU and radiator ratio to 0.5. The modeled design temperature is about 783 K, above 600 K; orbital electricity is exactly zero. The external seed plant can still manufacture hardware.
3. Set radiator ratio to 2. Temperature falls below 600 K and orbital generation resumes.
4. Reset. Switch only to direct microwave: Earth output is less than 0.001 MW with this mission, versus more than 10 MW with the optical relay. This is a property of the stated aperture and flux limits, not every microwave design.
5. Set Earth phase to 180°. Geometric solar blockage sets link output to zero.

Exact run outputs are generated into `results/baseline.json`; tests assert invariants and scientifically meaningful ranges, rather than fitting results to marketing claims.

### Numerical contract

SI units; monthly 1/12-year forward steps. Read starting hardware and power; retire collectors; calculate just-in-time production as the minimum of independent capacity, material and energy ceilings; allocate manufactured mass to factories and launched collectors; activate new hardware at the next step. Track extracted ore, tailings, imported components used, incremental factory mass, active collectors and retired collectors. The imported seed factory is outside this incremental ledger. No implicit recycling or replacement imports.

Mass residual is ore + used imports − tailings − new factories − active collectors − retired collectors. Tolerance is 1e-8 times max(1 kg, cumulative manufactured kg). Cumulative processing energy must not exceed allocated surface energy within relative tolerance 1e-10. Each stage utilization must be in [0,1] within roundoff. Grid output cannot exceed its offered orbital electricity; interception, conversion, reinvestment, link capture and every downstream loss are explicit. Detailed relay thermodynamics and capital equipment mass are outside this screening model and must be disclosed.

The user-selected phase is a fixed link geometry for the entire scenario; its line of sight is checked against the Sun. A separate 75% availability assumption represents aggregate additional interruptions. It is NOT an ephemeris or annual occultation integration. The animated circular orbits are representative geometry, do not drive stock flows, and are not validated collision-free trajectories.

### Experiment contract

Three successive proposals in one experiment, each evaluated independently by the host engine. They are not three independent statistical trials. The fixed challenge is at least 10 MW average Earth electricity at year 10 with minimum cumulative Mercury mining. Grade = 1/(1 + mined megatonnes) if thermal and accounting checks pass and the target is met; otherwise zero. Allowed policy fields: orbital radius, radiator ratio, power reinvestment, factory expansion and link mode. All other initial values are fixed per experiment.

Both models receive the same complete base mission, numerical assumptions, formula summary, schema, baseline output and earlier proposals/results. Both request high effort and get at most three proposals, with a 180-second limit per inference. Record requested model identifier, timestamps, effort, every proposal, host feedback and wall time. Equal effort labels do not guarantee equal FLOPs, tokens or cost. Invalid schema or forbidden changes fail the run explicitly; no silent repair or fabricated score. Public records omit private credentials and internal reasoning traces.

The ordinary-search reference uses a declared 1,008-point coarse grid and is explicitly not an equal-budget comparison. Save its full search dimensions, count, best policy and elapsed time. All valid model policies can be applied; invalid ones receive validation errors.

### Runtime and availability

Mission validation enforces every numeric bound, including 1–100 years (12–1,200 steps), finite values and the known link-mode enum. Target: a single simulation under 100 ms on the development laptop; measure it and report the reference environment rather than treating that as a universal guarantee. Rendering samples at most 1,600 collectors at up to 30 frames/s and respects reduced-motion preference.

The local adapter binds only to 127.0.0.1, uses a per-process random token, allows only the two local development origins, rejects oversized requests, and allows one model run at a time. Model inference occurs in a read-only sandbox with structured output and fixed command arguments. Test invalid input, missing authorization and the full real model path. The static public replay remains readable without model access, with status and provenance plainly visible.

Review refinement 2: the target is the **month-120 endpoint electrical power**, after multiplying by the assumed 75% link availability, not the mean over the tenth year or over ten years. Each model receives only its own earlier proposals and measured feedback. Tests also check every monthly increment of processing energy against that month’s allocated budget, with a 1e-8 relative roundoff allowance and 1 J absolute floor. No month may borrow unmodeled energy from a later month.

Independent office-hours review: two rounds completed; six initial issues addressed, followed by these two measurement clarifications. Reviewer score after round two: 9/10. This is a specification assessment, not a scientific validation, YC endorsement or forecast of hackathon success.


## StarBound scope refinement

The user renamed the project to StarBound and requested more realistic visuals and explicit robot, manufacturing, collector and Earth-power tabs. The v1.1 release adds a Three.js view and clearly labeled generated factory/collector concepts. Three new availability inputs affect the monthly production model. Separate engineering calculators cover landing mass, transfer/launch sizing, near-total projected coverage, computing cooling, interstellar energy and rotating habitats. None is described as a full mission solver or physical controller.

The practical demo remains an inspectable engineering experiment; no customer demand or Astra-exclusive capability is invented. The historical v1 comparison remains a tie. Ten predeclared failure fixtures expose controls and boundaries, and a short demo still focuses on one thermal failure, one link failure and one measured Astra policy. The expansion is documented in RESEARCH.md, PHYSICS.md and ARCHITECTURE.md.
