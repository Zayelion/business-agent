import { Router } from 'express';
import { getAgentRun, startAgentRun } from '../../../services/agentService.js';

const router = Router();

/**
 * Handles POST requests to queue an agent run without holding the connection open.
 * @param {import('express').Request} req Incoming request containing agentId and optional input.
 * @param {import('express').Response} res Express response used to return the queued run metadata.
 * @returns {void} Returns nothing.
 */
function handleTrigger(req, res) {
  const { agentId, input } = req.body ?? {};
  if (!agentId) {
    res.status(400).json({ error: 'agentId is required' });
    return;
  }

  const run = startAgentRun(agentId, input);
  res.status(202).json(run);
}

/**
 * Handles GET requests to retrieve an agent run snapshot with logs.
 * @param {import('express').Request} req Incoming request containing a run identifier.
 * @param {import('express').Response} res Express response used to deliver run state.
 * @returns {void} Returns nothing.
 */
function handleGetRun(req, res) {
  const { runId } = req.params;
  const run = getAgentRun(runId);
  if (!run) {
    res.status(404).json({ error: 'Run not found' });
    return;
  }

  res.json(run);
}

router.post('/agents/trigger', handleTrigger);
router.get('/agents/:runId', handleGetRun);

export default router;
