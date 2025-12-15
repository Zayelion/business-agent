import { randomUUID } from 'node:crypto';
import * as Agents from 'agents';

const runs = new Map();

/**
 * Attempts to resolve a factory function from the agents package.
 * @returns {Function|null} The factory function if available or null when missing.
 */
function resolveFactory() {
  if (typeof Agents.createAgentRunner === 'function') {
    return Agents.createAgentRunner;
  }

  if (typeof Agents.default === 'object' && typeof Agents.default.createAgentRunner === 'function') {
    return Agents.default.createAgentRunner;
  }

  return null;
}

/**
 * Triggers an agent execution using the installed agents package when available.
 * @param {string} agentId Identifier of the agent to execute.
 * @param {unknown} input Optional input passed to the agent.
 * @returns {Promise<object>} A promise with the agent result or a stubbed payload.
 */
export async function triggerAgentRun(agentId, input) {
  const createAgentRunner = resolveFactory();
  if (!createAgentRunner) {
    return {
      status: 'unavailable',
      note: 'agents package did not expose a runner factory',
      agentId,
      input
    };
  }

  const runner = createAgentRunner();
  if (typeof runner?.run !== 'function') {
    return {
      status: 'unavailable',
      note: 'agents package did not expose a runnable agent',
      agentId,
      input
    };
  }

  const result = await runner.run({ agentId, input });
  if (result) {
    return result;
  }

  return {
    status: 'triggered',
    agentId,
    input
  };
}

/**
 * Appends a new log entry to the given run record when present.
 * @param {string} runId Identifier of the run receiving a log entry.
 * @param {string} message Human-readable description of the event.
 * @param {object} [payload] Optional structured payload to record alongside the message.
 * @returns {void} Returns nothing.
 */
function appendLog(runId, message, payload) {
  const run = runs.get(runId);
  if (!run) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    message
  };

  if (payload) {
    entry.payload = payload;
  }

  run.logs.push(entry);
}

/**
 * Executes an agent in the background and records lifecycle logs.
 * @param {string} runId Unique identifier for the queued run.
 * @returns {Promise<void>} Resolves when execution completes.
 */
async function runAgentInBackground(runId) {
  const run = runs.get(runId);
  if (!run) {
    return;
  }

  run.status = 'running';
  appendLog(runId, 'Agent run started');

  try {
    const result = await triggerAgentRun(run.agentId, run.input);
    run.result = result;
    run.status = 'completed';
    appendLog(runId, 'Agent run completed', { result });

    if (typeof result?.handoff_to === 'string' && result.handoff_to.trim().length > 0) {
      appendLog(runId, 'Agent requested handoff', { to: result.handoff_to });
      const handoffInput = {
        task: result?.handoff_task ?? `Follow up on ${run.agentId} findings.`,
        from_agent: run.agentId,
        expected_output: 'Respond to the previous agent findings and return the standard structured object.',
        context: {
          constraints: run.input?.context?.constraints ?? {},
          history: [
            {
              agentId: run.agentId,
              input: run.input,
              result
            }
          ]
        }
      };

      startAgentRun(result.handoff_to, handoffInput);
    }
    return;
  } catch (error) {
    run.status = 'failed';
    appendLog(runId, 'Agent run failed', { error: error.message });
  }
}

/**
 * Queues an agent run without holding the HTTP connection open.
 * @param {string} agentId Identifier of the agent to trigger.
 * @param {unknown} input Optional payload forwarded to the agent.
 * @returns {{runId: string, agentId: string, status: string}} Metadata describing the queued run.
 */
export function startAgentRun(agentId, input) {
  const runId = randomUUID();
  const runRecord = {
    runId,
    agentId,
    input,
    status: 'queued',
    logs: []
  };

  runs.set(runId, runRecord);
  appendLog(runId, 'Agent run queued', { input });
  setImmediate(() => {
    runAgentInBackground(runId);
  });
  return {
    runId,
    agentId,
    status: runRecord.status
  };
}

/**
 * Fetches a snapshot of a recorded agent run, including logs and status.
 * @param {string} runId Identifier of the run to load.
 * @returns {object|null} Run snapshot or null when not found.
 */
export function getAgentRun(runId) {
  const run = runs.get(runId);
  if (!run) {
    return null;
  }

  return {
    runId: run.runId,
    agentId: run.agentId,
    status: run.status,
    logs: [...run.logs],
    result: run.result ?? null
  };
}
