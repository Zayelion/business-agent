# Cron folder guidance

- Scheduled jobs live here. Add/update tests under `test/cron` to validate scheduling logic or job helpers, keeping specs near the jobs they cover. If a job remains a no-op, note that in the PR instead of adding tests.
- Keep cron intervals documented in README or related runbooks when they change.
- Ensure any agent triggers inside cron jobs use valid IDs from `../ui/lib/agents.js` to avoid drift.
