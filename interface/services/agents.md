# Services folder guidance

- Service modules for backend logic live here. Add/update Jest tests under `test/interface/services` to cover edge cases and integration points, keeping specs alongside the modules they validate; if a change cannot be tested meaningfully, document the rationale in the PR.
- Keep service APIs aligned with Express routes in `../server/routes` and the Swagger spec in `documentation/swagger.yaml`.
- Ensure any agent-facing logic stays consistent with the IDs and roles defined in `interface/server/ui/lib/agents.js`.
