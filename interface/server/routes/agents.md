# Routes folder guidance

- Express routers reside here. Add or update Jest specs under `test/interface/server/routes`, co-locating tests beside the routes they verify (for example, `agents.test.js` next to `agents.js`). If a routing change cannot be exercised meaningfully, explain why in the PR.
- Keep endpoints synchronized with `documentation/swagger.yaml` and with upstream service layers in `../../services`.
- Validate that any route referencing agents stays consistent with `../ui/lib/agents.js` so API and UI lists match.
