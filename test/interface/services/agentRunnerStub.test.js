import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAgentRunner } from '../../../interface/services/agentRunnerStub.js';

test('stub agent runner returns structured output', async () => {
  const runner = createAgentRunner();
  const result = await runner.run({ agentId: 'QA', input: { task: 'demo' } });

  assert.equal(result.agentId, 'QA');
  assert.equal(result.status, 'completed');
  assert.ok(Array.isArray(result.recommendations));
  assert.equal(result.handoff_to, null);
});
