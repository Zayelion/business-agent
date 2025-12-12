# Interface folder guidance

- This directory hosts the Express server and Next.js UI stack. Add or update Jest tests under `test/interface` for any routing, middleware, or integration flows you touch, keeping specs adjacent to the files they cover (for example, `route.test.js` next to `route.js`). If a change is purely structural or config-only, explain the lack of tests in the PR.
- Cross-check UI references to agents with `interface/server/ui/lib/agents.js` whenever you adjust navigation, layouts, or API wiring.
- Keep README snippets or developer notes aligned with server configuration here so future edits have a single source of context.
