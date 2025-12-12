# Agents folder guidance

- Use this folder for shared agent-related assets or future definitions. Add or update tests under `test/agents` for any logic introduced here, keeping specs next to the assets or modules they validate; if the folder only holds configuration, document why tests are unnecessary in the PR.
- Keep artifacts in sync with the canonical agent metadata in `../interface/server/ui/lib/agents.js`.
- Note cross-references to services or UI flows when adding files so future edits preserve alignment.
