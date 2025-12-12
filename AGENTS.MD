# Project Agent Guidelines

Welcome! This guide distills the expectations, tooling, and conventions that govern work in this repository so future agents can contribute safely and consistently. Start by reading the README.md file.

- When gathering project-specific directions, read both `AGENTS.md` and any `TODO.md`
  files that fall within the active scope.
- If you need to pause work on a large, time-sensitive task, record the remaining
  actions in the relevant `TODO.md` before wrapping up.
- When documenting visual flows or processes, prefer Mermaid diagrams so the format stays consistent across the repository.


## Stack & platform snapshot
- **Runtime:** Node.js 18+ with npm 9+ (`package.json` enforces ESM via `"type": "module"`).
- **Backend:** Express 5 API (`interface/server/`) displays a UI to speak with the CEO agent in a virtual board room.
- **Frontend:** Next.js under `interface/server/ui`, styled with Tailwind CSS 4 and FontAwesome icons.

### Public routes
- `/` a UI showing the company name, all the agents in the system, and a UI to send a command to each one.
- `/reports` company status of task, and fincial reports.
- `/logs` a list of all UI, logs of all actions and thoughts/reasoning of the agents, a graph linking calls to services and other agent calls to and from each other.

## Instruction discovery
Use the index below to locate every scoped `AGENTS.md` file quickly.

### Repository root
| Location | Description | Common tasks |
| --- | --- | --- |
| [`AGENTS.md`](<AGENTS.md>) | Repository-wide guardrails covering the stack, coding standards, and contributor workflows. | Consult before making any change to understand the baseline expectations and required tooling. |

### Documentation
| Location | Description | Common tasks |
| --- | --- | --- |
| [`docs/AGENTS.md`](<docs/AGENTS.md>) | Central hub for project documentation standards and upkeep. | Review when drafting or updating docs, runbooks, or reference material. |
| [`docs/milestones/AGENTS.md`](<docs/milestones/AGENTS.md>) | Milestone planning guidance emphasising ownership, timelines, and linked runbooks. | Use when adjusting strategic milestone plans or documenting deployment runbooks. |

## Key directories
- **Docs:** Review the `docs/` folder for milestone plans, runbooks, and project documentation before starting any scoped work.
- **Employees:** Agents that act as the employees of the company.
- **Interface:** Website that triggers the agents to run.

## Linting & code style (`.eslintrc.js`)
- **Never use `else`:** `no-else/no-else` and `no-else-return` enforce early returns / guard clauses.
- **Syntax preferences:** single quotes, required semicolons, 2-space indentation, template literals over concatenation, `const`/`let` (no `var`).
- **Forbidden patterns:** `++`/`--`, bitwise ops, nested ternaries, extending natives, `eval`/`new Function`/implicit evals, `with`, and unused vars.
- **Best practices:** Always use strict equality (`eqeqeq`), avoid lonely `if`s, and keep spacing consistent (`keyword-spacing`, `object-curly-spacing`, etc.).
- **Documentation:** Every function must include a JSDoc comment that explains its purpose, parameters, and return value.

## Contribution guardrails
- **Dependencies:** Avoid adding new npm packages unless absolutely necessary; prefer existing utilities or targeted helpers. Any new dependencies must pass `npm audit` without introducing unresolved vulnerabilities.
- **npm audit:** Resolve all outstanding `npm audit` findings before opening a pull request, including transitive vulnerabilities reported at the configured audit level.
- **Search efficiently:** Use ripgrep (`rg`) with scoping flags (`--files-with-matches`, `--iglob`) instead of `grep -R` for faster lookups.
- **Background jobs:** Confirm cron tasks log appropriately and respect configured backup directories.

## Pull request expectations
- Summarize changes clearly, flag new routes, env vars, migrations, or operational steps.
- Keep descriptions self-contained—no external AI/chat links.
- Run relevant tests/linters locally and report results.
- Rebase your branch onto the latest parent branch before opening a pull request so reviews start from an up-to-date codebase.
- Do not use emojis in repository documentation, templates, or contribution notes.
- Following these guidelines will keep contributions aligned with the project’s architecture, tooling, and operational practices.
- For expanded contribution standards, review [CONTRIBUTING.md](CONTRIBUTING.md) and follow the policies described there.
