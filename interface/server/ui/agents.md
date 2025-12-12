# UI folder guidance

- This is the Next.js app. When adjusting components or data hooks, add/update React tests under `test/interface/server/ui` (using your preferred testing library) and keep specs adjacent to the components they validate. For purely presentational tweaks, note the visual change in the PR if no test is added.
- The authoritative list of agents used by the UI is defined in `lib/agents.js`; keep it aligned with backend expectations and documentation when modifying.
- Coordinate style updates with `app/globals.css` and layout structure to avoid regressions across pages.
