# Release validation

StarBound v1.1, September 8, 2026.

- **20 numerical tests pass:** reference irradiance, Mercury escape scale, monthly material/energy invariants, resource and import limits, thermal shutdown, equipment outages, receiver/grid limits, occultation, reproducibility, model-output boundaries, rocket equation, Hohmann transfer bounds, mass-driver energy, random projected coverage, radiator scaling, relativistic energy and habitat geometry.
- **Type checking and project lint pass.** Unmodified scaffold UI primitives and its mobile hook are excluded from project lint; their generated behavior is not claimed to have been independently audited.
- **Production build succeeds.** Three.js is loaded on demand; the large renderer chunk is expected. A GPU frame-rate or browser interaction benchmark has not been performed.
- **Production dependency audit:** zero reported vulnerabilities at the time of the final check. This is a package-advisory result, not a security certification.
- **Local Astra bridge transport checks pass:** ready response, missing-token rejection, origin rejection, authenticated progress, invalid-model rejection and recovery to idle. This transport check made no inference calls.
- **Actual inference:** retained v1 records contain three completed proposals each from GPT-6 Astra and GPT-5.6 Sol. The host independently computed their results. Their mining score tied. A conventional 1,008-evaluation search is disclosed separately.
- **PowerPoint:** 27 slides rendered and individually inspected. The final correction affected slides 22–23; the other 25 final renderings were byte-identical to their reviewed versions. Package structure, geometry/font policy, import, four editable tables and two editable charts with embedded data passed the presentation finalizer. Native Microsoft PowerPoint execution was not tested.
- **Generated imagery:** two inspected concept images, visibly labeled as generated concepts. Their realism does not establish physical feasibility.

The engine is a reduced-order model. Validation is of the stated equations, numerical boundaries and accounting, not of a physical Mercury factory or a complete Dyson sphere. Website controls for robots operate aggregate availability; individual robot motion and manufacturing equipment dynamics are not integrated. The civilization, mass-driver and landing calculators are separately labeled bounds.
