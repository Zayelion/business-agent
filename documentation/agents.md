# Documentation folder guidance

- Document API contracts and references here. When you modify specs or guides, add/update companion tests under `test/documentation` that validate example payloads or schema shapes, keeping specs adjacent to the docs or schemas they exercise. If a doc-only change is not testable, call that out in the PR description.
- Keep references to agent definitions in sync with the authoritative list in `interface/server/ui/lib/agents.js` and mirror changes in any published docs.
- When introducing new docs, include context links back to relevant services or UI flows so future updates stay aligned.
