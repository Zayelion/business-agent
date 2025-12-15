import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const agentsDir = join(currentDir, '../../../agents');

/**
 * Builds an absolute path to the agent markdown definition.
 * @param {string} agentId Identifier of the agent to locate.
 * @returns {string} Absolute path to the agent definition file.
 */
function agentFilePath(agentId) {
  return join(agentsDir, `${agentId}.md`);
}

/**
 * Attempts to extract the default task from an agent definition.
 * @param {string} content Full markdown contents for the agent.
 * @returns {string|null} Default task text when present.
 */
export function extractDefaultTask(content) {
  const match = content.match(/default task:\s*"([^"]+)"/i);
  if (match) {
    return match[1];
  }

  return null;
}

/**
 * Loads the content for a given agent file.
 * @param {string} agentId Identifier of the agent to load.
 * @returns {Promise<{agentId: string, path: string, content: string}|null>} File metadata or null when not found.
 */
export async function loadAgentFile(agentId) {
  const targetPath = agentFilePath(agentId);
  try {
    const content = await readFile(targetPath, 'utf8');
    return { agentId, path: targetPath, content };
  } catch (error) {
    return null;
  }
}

/**
 * Loads an agent profile with parsed metadata from its markdown definition.
 * @param {string} agentId Identifier of the agent profile to load.
 * @returns {Promise<{agentId: string, path: string, content: string, defaultTask: string|null}|null>} Parsed profile or null when missing.
 */
export async function loadAgentProfile(agentId) {
  const file = await loadAgentFile(agentId);
  if (!file) {
    return null;
  }

  const defaultTask = extractDefaultTask(file.content);
  return { ...file, defaultTask };
}
