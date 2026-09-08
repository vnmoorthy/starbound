# Astra's role and the experiment contract

Astra acts as a mission-policy proposer. It sees a fixed mission, formulas, engineering assumptions and measured feedback, then proposes a bounded change. The host engine recomputes the full trajectory and assigns the grade. The model cannot redefine physical constants, add imports, increase the seed plant or write its own result into the UI.

This is a **real local Codex integration**, not a simulated AI response. The included `@openai/codex` version uses the machine's existing ChatGPT login. The public site has no model secret; it displays recorded runs and lets visitors recalculate their policies. Live runs require the local adapter and the temporary URL it prints. [Official CLI documentation](https://developers.openai.com/codex/cli)

## Run it

```bash
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3000
```

In another terminal:

```bash
npx codex login status
# If needed, use: npx codex login
npm run lab
```

Open the local URL printed by the lab. Keep its temporary token private. A model run uses the signed-in user's Codex quota. Stop the lab with Ctrl+C when finished.

For reproducible command-line records:

```bash
npm run experiment:astra
npm run experiment:sol
npm run experiment:search
```

## Fixed challenge

Deliver **at least 10 MW at the month-120 endpoint**, with the 75% link-availability factor already applied, while minimizing cumulative Mercury ore mined. This is neither the tenth year's mean power nor a ten-year energy average. The initial defaults are the same for both model runs; only the horizon is set to ten years.

Allowed fields: orbital radius, radiator ratio, power reinvestment fraction, mass allocated to factory expansion, and transmission architecture. Other mission values are fixed. The numerical engine constrains all fields to finite bounds.

```text
feasible = thermal check AND accounting check AND endpoint grid power ≥ 10 MW
score = 1 / (1 + cumulative mined megatonnes), if feasible; otherwise 0
```

The initial mission overbuilds for the fixed ground receiver. A successful proposer may discover that it should reduce expansion instead of collecting more sunlight. This says something about the declared scenario, not about globally optimal Dyson swarm construction.

## Protocol

- One experiment per model, three successive proposals. This is a small demonstration, not a statistically supported benchmark.
- Requested models: `gpt-6-astra` and `gpt-5.6-sol`.
- Same initial mission, assumptions, formula briefing, schema, baseline output, requested high effort and three-proposal limit.
- Each model sees its own prior proposals and the independently computed feedback, never the other model's answers.
- Per-round wall-clock limit: 180 seconds. Record actual timing. Equal effort settings do not imply equal tokens, FLOPs or monetary cost.
- Structured output must pass schema and allowed-field validation. Invalid output fails explicitly; it is not silently repaired or replaced with a hand-authored answer.
- Host-side calculations provide all result numbers. Private model reasoning and credentials are not published.
- Conventional search uses a declared 1,008-point grid. It gets many more evaluations than the model trials and is not presented as equal-budget competition.

`results/astra.json`, `results/sol.json` and `results/search.json` are the evidence. Inspect all iterations, including unsuccessful ones. An initial access failure caused by an older globally installed CLI was corrected with a project-local supported version; it was not a scored model attempt.

## What this does and does not demonstrate

It demonstrates whether Astra can interpret a coupled model, choose a policy, use measured feedback and explain a binding constraint. The engine—not the language model—is qualified to perform the documented arithmetic, and even that engine requires further domain validation before engineering use.

It does **not** establish that Sol cannot do the same task, that Astra has validated a real Dyson swarm, or that general model benchmarks transfer to this domain. The application can run with either model. A truthful submission should report a tie if both obtain the same feasible mining score.

The current adapter runs successive structured CLI calls. It does **not** implement Astra's native mid-turn steering or async tool API. Those are possible next experiments with a scoped hosted API integration, proper credentials and a controlled test protocol. Do not label ordinary turn-by-turn revision as native mid-turn steering. [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model), [steering documentation](https://developers.openai.com/api/docs/guides/steering)

## Stronger follow-on evaluation

Use a preregistered collection of held-out missions with material shortages, broken launchers, changed receiver availability and tighter temperature margins. Repeat trials with matched inference budgets; compare response quality, constraint violations, ore use, total delivered energy and adaptation after an intervention. Add robust feasibility margins so a policy at 599 K against a 600 K limit is not treated as a proven design. Include conventional optimization and prohibit changes to the numerical grader.
