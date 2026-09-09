# StarBound — submission copy

## 1. Project description (three lines)

StarBound is an interactive Dyson swarm laboratory that explores turning Mercury's resources into solar collectors and delivering their energy to Earth.
Control robotic industry, manufacturing, collector orbits and power transmission, then see material, thermal and energy constraints change the outcome.
GPT-6 Astra proposes engineering policies; a deterministic physics engine tests them and publishes the evidence.

## 2. Use of OpenAI products

We used OpenAI Codex to research, build and refine StarBound's TypeScript simulation engine, interactive Three.js website, numerical tests, documentation and mission-briefing presentation. OpenAI image generation created the explicitly labeled Mercury-factory and solar-collector concept visuals. GPT-6 Astra is also part of the working experiment system: through the official Codex CLI, it receives a constrained engineering objective, proposes a structured policy, receives independently calculated feedback and revises its proposal across three rounds. The host validates its output and calculates all displayed physics and scores. The public website includes real recorded experiments; live Astra experiments run through an authenticated local adapter. We also ran GPT-5.6 Sol and a conventional search baseline, and published their results for comparison.

## 3. Feedback on GPT-6 Astra

GPT-6 Astra worked well as a policy proposer when we gave it explicit constraints, a structured output schema and numerical feedback. It found a feasible policy that met our fixed Earth-power target with substantially less mining than the starting policy. In this recorded experiment, Astra completed its three rounds in about 162 seconds versus Sol's 249 seconds, but both models and conventional search reached the same best mining score; this does not establish general superiority. The most useful pattern was separating the model's proposals from an independent simulator that could reject invalid designs. We would like to evaluate longer tasks, harder coupled constraints and recovery from changing requirements. The current implementation uses successive calls and does not test native mid-turn steering.

## Links

- Demo: https://starbound.vnmoorthy.chatgpt.site
- Source: https://github.com/vnmoorthy/starbound
- Presentation: [27-slide PowerPoint](../deliverables/StarBound-Mission-Briefing.pptx)
- Video: [one-minute recording script](ONE-MINUTE-DEMO.md)

## Honest accuracy statement

This is a working reduced-order engineering simulation. It uses sourced physical constants and explicit equations for energy, thermal balance, material flow and simplified power propagation, with tested accounting and input boundaries. Mining chemistry, autonomous robot dynamics, manufacturing readiness, N-body trajectories, beam-network operations and costs are not independently validated. Detailed imagery is conceptual. It is not a construction-ready Dyson sphere design.
