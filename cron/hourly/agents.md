# Hourly cron guidance

- Jobs in this folder run hourly. Add or update tests under `test/cron/hourly` for any scheduling utilities or side effects introduced, keeping specs close to the job files they exercise. If the job remains a placeholder, mention that in the PR instead of adding tests.
- Keep logging or telemetry decisions consistent with the main cron guidance one level up.
- If you wire agents here, reuse IDs from `../../interface/server/ui/lib/agents.js` so schedules and UI remain aligned.
