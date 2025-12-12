# UI lib folder guidance

- Shared data and utilities for the UI live here. Add or update tests under `test/interface/server/ui/lib` when changing agent lists or helper functions, keeping specs next to the modules they validate; if you skip tests, justify it in the PR.
- `agents.js` is the single source of truth for agent metadata used across the UI and referenced by API and documentation. Update downstream docs and endpoints when modifying this file.
- Keep exported structures minimal and typed via JSDoc so consumers understand expected shapes.
