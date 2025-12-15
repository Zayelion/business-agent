# Daily cron guidance

- Jobs in this folder run daily. Add/update tests under `test/cron/daily` for any added logic, keeping specs next to the job files they validate; if the job stays empty, explain in the PR why no test is needed.
- Mirror logging and scheduling patterns documented in `../agents.md` to keep behavior predictable.
- If daily jobs trigger agents, ensure IDs align with `../../ui/lib/agents.js` and update docs as needed.
