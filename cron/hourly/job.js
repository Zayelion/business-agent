import { CronJob } from 'cron';

/**
 * No-operation task executed by the hourly cron job.
 * @returns {void} Returns nothing.
 */
function hourlyTask() {}

/**
 * Starts the hourly cron job that currently performs no actions.
 * @returns {CronJob} The initialized hourly CronJob instance.
 */
export function startHourlyJobs() {
  const job = new CronJob('0 * * * *', hourlyTask, null, true);
  return job;
}
