# Root folder guidance

- Keep this file aligned with `AGENTS.MD` and refresh each directory's `agents.md` when files move or new areas are created.
- When updating root-level files (README, package metadata, entrypoints), add or update Jest tests under `test/root` to cover any new behaviors. Keep test files adjacent to the code they validate (for example, `file.test.js` beside `file.js`). If a change is documentation-only, note that in the PR summary instead of adding tests.
- Use this folder as the source of truth for high-level conventions and make sure any new directories you add also get their own `agents.md` with testing notes and context.
