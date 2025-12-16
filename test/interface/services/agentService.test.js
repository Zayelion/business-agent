import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';
import { getAgentRun, startAgentRun } from '../../../interface/services/agentService.js';

async function waitForRunCompletion(runId) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const snapshot = getAgentRun(runId);
    if (snapshot?.status === 'completed' || snapshot?.status === 'failed') {
      return snapshot;
    }

    await delay(10);
  }

  throw new Error('Agent run did not complete in time.');
}

test('applies requested agent file edits after a run completes', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-'));
  const originalAgentsDir = process.env.AGENTS_DIR;
  process.env.AGENTS_DIR = directory;

  t.after(async () => {
    process.env.AGENTS_DIR = originalAgentsDir;
    await rm(directory, { recursive: true, force: true });
  });

  const run = startAgentRun('CEO', {
    task: 'Update playbook',
    requested_file_edit: {
      fileName: 'CEO.md',
      content: 'Updated CEO guidance.'
    }
  });

  const snapshot = await waitForRunCompletion(run.runId);
  assert.equal(snapshot.status, 'completed');

  const agentContent = await readFile(path.join(directory, 'CEO.md'), 'utf8');
  assert.equal(agentContent, 'Updated CEO guidance.');
  const appliedLog = snapshot.logs.find((entry) => entry.message === 'Agent file edit applied');
  assert.ok(appliedLog);
});
