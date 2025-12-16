/**
 * Creates a stubbed agent runner that returns structured responses.
 * @returns {{ run: (params: {agentId: string, input: unknown}) => Promise<object> }} Agent runner with a run method.
 */
export function createAgentRunner() {
  /**
   * Simulates executing an agent request with deterministic output.
   * @param {{agentId: string, input: unknown}} params Agent execution parameters.
   * @returns {Promise<object>} Structured result from the simulated agent.
   */
  const run = async ({ agentId, input }) => ({
    status: 'completed',
    agentId,
    input,
    summary: `Stub run completed for ${agentId}.`,
    analysis: 'This is a placeholder response from the local stub agent runner.',
    recommendations: [],
    artifacts: {},
    risk_flags: [],
    handoff_to: null
  });

  return { run };
}

export default {
  createAgentRunner
};
