import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { applyAgentFileEdit } from '../../../interface/services/agentFileService.js';

async function createIsolatedAgentsDir() {
  const directory = await mkdtemp(path.join(tmpdir(), 'agents-dir-'));
  return directory;
}

test('applies replace and append edits within the agents directory', async (t) => {
  const directory = await createIsolatedAgentsDir();
  const originalAgentsDir = process.env.AGENTS_DIR;
  process.env.AGENTS_DIR = directory;

  t.after(async () => {
    process.env.AGENTS_DIR = originalAgentsDir;
    await rm(directory, { recursive: true, force: true });
  });

  const firstEdit = await applyAgentFileEdit({ fileName: 'CTO.md', content: 'Initial brief.' });
  assert.ok(firstEdit.path.endsWith(path.join('CTO.md')));
  assert.equal(firstEdit.previous, null);

  const appended = await applyAgentFileEdit({ fileName: 'CTO.md', content: '\nAdded note.', mode: 'append' });
  const content = await readFile(path.join(directory, 'CTO.md'), 'utf8');
  assert.equal(appended.mode, 'append');
  assert.equal(content, 'Initial brief.\nAdded note.');
});

test('rejects edits that escape the agents directory', async (t) => {
  const directory = await createIsolatedAgentsDir();
  const originalAgentsDir = process.env.AGENTS_DIR;
  process.env.AGENTS_DIR = directory;

  t.after(async () => {
    process.env.AGENTS_DIR = originalAgentsDir;
    await rm(directory, { recursive: true, force: true });
  });

  await assert.rejects(() => applyAgentFileEdit({ fileName: '../outside.txt', content: 'bad' }));
});
