import { CronJob } from 'cron';
import { loadAgentProfile } from '../../services/agentLoader.js';
import { startAgentRun } from '../../../services/agentService.js';

/**
 * Queues an agent using its default governance task and expected output notes.
 * @param {string} agentId Identifier of the agent to trigger.
 * @returns {Promise<{runId: string, agentId: string, status: string}|null>} Metadata describing the queued run or null when the agent cannot be loaded.
 */
async function triggerAgentFromProfile(agentId) {
  const profile = await loadAgentProfile(agentId);
  if (!profile) {
    return null;
  }

  const defaultTask = profile.defaultTask ?? 'Execute the responsibilities defined by your agent profile.';
  const input = {
    task: defaultTask,
    from_agent: 'HourlyScheduler',
    expected_output: 'Provide a governance summary and assign the CEO a concrete task with timing and success criteria.',
    context: {
      constraints: {
        cadence: 'hourly'
      },
      history: [
        {
          agentId,
          profile: profile.path
        }
      ]
    }
  };

  return startAgentRun(agentId, input);
}

/**
 * Starts the BoardOfDirectors agent during the hourly cron run.
 * @returns {Promise<{runId: string, agentId: string, status: string}|null>} Metadata describing the queued run or null when unavailable.
 */
async function hourlyTask() {
  return triggerAgentFromProfile('BoardOfDirectors');
}

/**
 * Starts the hourly cron job that triggers the BoardOfDirectors agent via the interface server.
 * @returns {CronJob} The initialized hourly CronJob instance.
 */
export function startHourlyJobs() {
  const job = new CronJob('0 * * * *', () => {
    hourlyTask();
  }, null, true);
  return job;
}
