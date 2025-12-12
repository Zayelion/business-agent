import { CronJob } from 'cron';

/**
 * No-operation task executed by the daily cron job.
 * @returns {void} Returns nothing.
 */
function dailyTask() {}

/**
 * Starts the daily cron job that currently performs no actions.
 * @returns {CronJob} The initialized daily CronJob instance.
 */
export function startDailyJobs() {
  const job = new CronJob('0 0 * * *', dailyTask, null, true);
  return job;
}
