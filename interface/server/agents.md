# Server folder guidance

- Backend routing and middleware live here. Add or update Jest tests under `test/interface/server` whenever you adjust handlers, Express wiring, or middleware behavior, keeping test files close to the modules they validate. If you cannot meaningfully test a change, mention why in the PR summary.
- Keep API behaviors consistent with `documentation/swagger.yaml` and update that spec when routes change.
- When wiring agent triggers, ensure IDs align with `../ui/lib/agents.js` so the UI and API remain synchronized.
