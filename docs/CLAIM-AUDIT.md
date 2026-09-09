# Repository claim audit

September 8, 2026. Scope: README claims, supporting model/protocol/architecture documentation, implemented controls, and published numerical records. This checks agreement with code and evidence; it is not independent validation of Mercury industry or Dyson-swarm engineering.

## Corrections made

| Previous wording | Correction |
|---|---|
| Every slider reruns the same model | Monthly mission controls and separate landing, launcher and civilization calculators are distinguished |
| Ore alone balances all output mass | Consumed precision imports are included on the input side |
| Fixed 1e-7 kg mass-audit tolerance | The implementation uses 1e-8 × max(1 kg, cumulative manufactured mass), with monthly residuals recorded |
| Universal power-collapse / thermal language | 13.23 MW → 127 W and 783 K are conditional on the documented baseline and failure settings |
| Mining objective flat whenever expansion is zero | Several tested policies with both expansion and reinvestment zero tied; no universal optimization result is claimed |
| Half-millisecond performance without context | Recorded mean, 100 samples, macOS arm64 and Node version identified; not a browser/GPU benchmark |
| Stale renderer and tab descriptions | Research tab, numeric controls, separate concept navigation, live orbits and no-WebGL fallback described |
| Old model version, particle and pixel-ratio descriptions | Current v1.1 engine separated from v1.0 recorded experiments; current rendering limits documented |

## Independently recomputed from current source

No new inference was needed: saved model policies were evaluated again by the current engine.

| Scenario | Earth power | Mined ore | Temperature |
|---|---:|---:|---:|
| Default, year 30 | 13.23300655 MW | 3.92 Mt | 479.686 K |
| Default, year 10 | 13.23300655 MW | 3.92 Mt | 479.686 K |
| Direct microwave, year 30 | 127.00879 W | 3.92 Mt | 479.686 K |
| 0.3 AU / radiator ratio 0.5 | 0 W | 0.403122 Mt | 783.324 K |
| Recorded Astra best policy, year 10 | 13.23300655 MW | 0.1284940455 Mt | 599.233 K |
| Recorded Sol best policy, year 10 | 13.23300655 MW | 0.1284940455 Mt | 599.233 K |

All six accounting audits passed. The default maximum mass residual is about 5.36e-7 kg, illustrating why the former fixed 1e-7 kg claim was incorrect. Twenty numerical tests, strict type checking and lint passed in this review.

The Astra/Sol mining-score tie remains explicit. Their measured timings are one experiment each, not statistical performance evidence. A coarse search used a different evaluation budget. Construction readiness, exact robot motion, dense-swarm thermodynamics, orbital collision avoidance and economics remain outside validation. The near-total-capture calculator is separate from the monthly model's 1% projected-coverage limit.
