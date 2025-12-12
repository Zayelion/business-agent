# App folder guidance

- Top-level Next.js routes and layouts live here. When altering a page or layout, add/update tests under `test/interface/server/ui/app` to validate rendering and critical interactions, and keep specs adjacent to the routes or components they cover. If changes are cosmetic only, describe the reason no tests were added in the PR.
- Keep page metadata and navigation consistent with agent listings in `../lib/agents.js` so the sidebar and forms stay in sync.
- Coordinate global styling updates with `globals.css` to maintain consistent theming.
