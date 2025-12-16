import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_MODE = 'replace';

/**
 * Resolves the absolute path to the agents folder, honoring override when provided.
 * @returns {string} Absolute path to the agents directory.
 */
function resolveAgentsDirectory() {
  const configured = process.env.AGENTS_DIR;
  if (configured) {
    return path.resolve(configured);
  }

  return path.resolve(process.cwd(), 'agents');
}

/**
 * Builds a safe path to an agent file while preventing directory traversal.
 * @param {string} fileName Relative file name inside the agents directory.
 * @returns {string} Absolute path to the requested agent file.
 */
function resolveAgentFilePath(fileName) {
  const agentsDirectory = resolveAgentsDirectory();
  const normalizedFileName = path.normalize(fileName);
  const candidatePath = path.resolve(agentsDirectory, normalizedFileName);
  const safePrefix = `${agentsDirectory}${path.sep}`;
  if (!candidatePath.startsWith(safePrefix)) {
    throw new Error('File edits must stay within the agents directory.');
  }

  return candidatePath;
}

/**
 * Writes requested content to an agent file, appending or replacing content.
 * @param {{fileName: string, content: string, mode?: 'replace'|'append'}} params Agent file edit request.
 * @returns {Promise<{path: string, previous?: string|null, mode: string}>} Metadata about the applied update.
 */
export async function applyAgentFileEdit({ fileName, content, mode = DEFAULT_MODE }) {
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('fileName must be a non-empty string.');
  }

  if (typeof content !== 'string') {
    throw new Error('content must be a string.');
  }

  const trimmedName = fileName.trim();
  if (trimmedName.length === 0) {
    throw new Error('fileName cannot be empty.');
  }

  const updateMode = mode ?? DEFAULT_MODE;
  if (updateMode !== 'replace' && updateMode !== 'append') {
    throw new Error('mode must be "replace" or "append".');
  }

  const targetPath = resolveAgentFilePath(trimmedName);
  await mkdir(path.dirname(targetPath), { recursive: true });

  const previousContent = await readFile(targetPath, 'utf8').catch(() => null);
  if (updateMode === 'append') {
    await appendFile(targetPath, content, 'utf8');
    return { path: targetPath, previous: previousContent, mode: 'append' };
  }

  await writeFile(targetPath, content, 'utf8');
  return { path: targetPath, previous: previousContent, mode: 'replace' };
}

export default {
  applyAgentFileEdit
};
