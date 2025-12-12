'use client';

import React, { useMemo, useState } from 'react';
import { agents } from '../lib/agents';

/**
 * Sidebar for selecting agents to trigger.
 * @param {{ selectedId: string, onSelect: (agentId: string) => void }} props Component props.
 * @returns {JSX.Element} React sidebar element.
 */
function AgentSidebar({ selectedId, onSelect }) {
  /**
   * Handles click events for selecting an agent from the sidebar.
   * @param {string} id Identifier of the selected agent.
   * @returns {void} Returns nothing.
   */
  const handleClick = (id) => {
    onSelect(id);
  };

  return (
    <aside className="sidebar">
      <h1>Agent Console</h1>
      <div className="agent-list">
        {agents.map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() => handleClick(agent.id)}
            className={agent.id === selectedId ? 'active' : undefined}
          >
            <div style={{ fontWeight: 700 }}>{agent.title}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{agent.role}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}

/**
 * Detail panel describing the selected agent.
 * @param {{ agent: {id: string, title: string, role: string, description: string} }} props Component props.
 * @returns {JSX.Element} React detail card element.
 */
function AgentDetails({ agent }) {
  return (
    <div className="panel">
      <h2>{agent.title}</h2>
      <p style={{ opacity: 0.8 }}>{agent.role}</p>
      <p>{agent.description}</p>
    </div>
  );
}

/**
 * Dashboard page for triggering agents via the backend API.
 * @returns {JSX.Element} React component for the landing page.
 */
export default function AgentDashboard() {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id ?? '');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(null);

  const selectedAgent = useMemo(() => agents.find((agent) => agent.id === selectedAgentId) ?? agents[0], [selectedAgentId]);

  /**
   * Updates the selected agent from sidebar interactions.
   * @param {string} agentId Identifier of the selected agent.
   * @returns {void} Returns nothing.
   */
  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);
    setStatus(null);
  };

  /**
   * Sends a request to the backend to trigger the chosen agent.
   * @returns {Promise<void>} Promise that resolves after the request completes.
   */
  const handleTriggerAgent = async () => {
    if (!selectedAgent) {
      return;
    }

    setStatus({ state: 'pending', message: 'Triggering agent...' });

    try {
      const response = await fetch('/api/agents/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgent.id, input })
      });

      if (!response.ok) {
        const errorBody = await response.json();
        setStatus({ state: 'error', message: errorBody.error ?? 'Unable to trigger agent' });
        return;
      }

      const payload = await response.json();
      setStatus({ state: 'success', message: JSON.stringify(payload, null, 2) });
    } catch (error) {
      setStatus({ state: 'error', message: error.message });
    }
  };

  return (
    <main>
      <AgentSidebar selectedId={selectedAgentId} onSelect={handleSelectAgent} />
      <section className="content">
        {selectedAgent ? <AgentDetails agent={selectedAgent} /> : null}
        <div className="panel">
          <div className="actions">
            <label htmlFor="agent-input">What should {selectedAgent?.title ?? 'the agent'} do?</label>
            <textarea
              id="agent-input"
              placeholder="Outline the task you want this agent to handle."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button type="button" className="trigger" onClick={handleTriggerAgent}>
              Trigger Agent
            </button>
            {status ? (
              <pre className={`status ${status.state === 'success' ? 'success' : ''} ${status.state === 'error' ? 'error' : ''}`}>
                {status.state === 'pending' ? 'Working...' : status.message}
              </pre>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
