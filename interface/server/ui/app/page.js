'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
 * Display block for status messages across the dashboard.
 * @param {{ status: { state: 'pending'|'success'|'error', message: string }|null }} props Component props.
 * @returns {JSX.Element|null} Rendered status element when provided.
 */
function StatusBlock({ status }) {
  if (!status) {
    return null;
  }

  return (
    <pre className={`status ${status.state === 'success' ? 'success' : ''} ${status.state === 'error' ? 'error' : ''}`}>
      {status.state === 'pending' ? 'Working...' : status.message}
    </pre>
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
 * Form for creating todo entries persisted via SQLite.
 * @param {{ title: string, body: string, onTitleChange: (value: string) => void, onBodyChange: (value: string) => void, onSubmit: () => void, status: { state: string, message: string }|null }} props Component props.
 * @returns {JSX.Element} React form element.
 */
function TodoForm({ title, body, onTitleChange, onBodyChange, onSubmit, status }) {
  return (
    <div className="todo-form">
      <label htmlFor="todo-title">Todo title</label>
      <input
        id="todo-title"
        type="text"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Draft a short heading for the todo"
      />
      <label htmlFor="todo-body">Todo body</label>
      <textarea
        id="todo-body"
        placeholder="Outline the task details to persist to disk"
        value={body}
        onChange={(event) => onBodyChange(event.target.value)}
      />
      <button type="button" className="trigger" onClick={onSubmit}>
        Save Todo
      </button>
      <StatusBlock status={status} />
    </div>
  );
}

/**
 * List of todo entries.
 * @param {{ todos: {id: number, title: string, createdAt: string}[], activeId: number|null, onSelect: (id: number) => void }} props Component props.
 * @returns {JSX.Element} React element rendering a todo list.
 */
function TodoList({ todos, activeId, onSelect }) {
  return (
    <div className="todo-list">
      <div className="todo-list-header">
        <h4>Saved todos</h4>
        <p className="muted">Entries are indexed in SQLite and stored as files.</p>
      </div>
      {todos.length === 0 ? <p className="muted">No todos saved yet.</p> : null}
      {todos.map((todo) => (
        <button
          key={todo.id}
          type="button"
          className={`todo-entry ${activeId === todo.id ? 'active' : ''}`}
          onClick={() => onSelect(todo.id)}
        >
          <div className="todo-title">{todo.title}</div>
          <div className="todo-meta">{new Date(todo.createdAt).toLocaleString()}</div>
        </button>
      ))}
    </div>
  );
}

/**
 * Displays contents of a selected todo entry.
 * @param {{ todo: { title: string, body: string }|null, isLoading: boolean }} props Component props.
 * @returns {JSX.Element} React element for the todo preview.
 */
function TodoPreview({ todo, isLoading }) {
  if (isLoading) {
    return <p className="muted">Loading todo content...</p>;
  }

  if (!todo) {
    return <p className="muted">Select a todo to view its stored text.</p>;
  }

  return (
    <div className="todo-preview">
      <h4>{todo.title}</h4>
      <pre className="status">{todo.body}</pre>
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
  const [todoTitle, setTodoTitle] = useState('');
  const [todoBody, setTodoBody] = useState('');
  const [todoStatus, setTodoStatus] = useState(null);
  const [todos, setTodos] = useState([]);
  const [activeTodo, setActiveTodo] = useState(null);
  const [isLoadingTodo, setIsLoadingTodo] = useState(false);

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
   * Loads todos from the API to render the saved list.
   * @returns {Promise<void>} Resolves when todos are loaded.
   */
  const refreshTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        setTodoStatus({ state: 'error', message: 'Failed to load todos' });
        return;
      }

      const payload = await response.json();
      setTodos(payload);
      return;
    } catch (error) {
      setTodoStatus({ state: 'error', message: error.message });
    }
  };

  useEffect(() => {
    refreshTodos();
  }, []);

  /**
   * Persists a todo entry to the SQLite-backed store.
   * @returns {Promise<void>} Resolves when the todo is created.
   */
  const handleCreateTodo = async () => {
    setTodoStatus({ state: 'pending', message: 'Saving todo...' });
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: todoTitle, body: todoBody })
      });

      if (!response.ok) {
        const errorBody = await response.json();
        setTodoStatus({ state: 'error', message: errorBody.error ?? 'Unable to save todo' });
        return;
      }

      setTodoTitle('');
      setTodoBody('');
      setTodoStatus({ state: 'success', message: 'Todo saved to disk' });
      refreshTodos();
      return;
    } catch (error) {
      setTodoStatus({ state: 'error', message: error.message });
    }
  };

  /**
   * Loads a todo entry from disk via the API.
   * @param {number} todoId Identifier of the todo to load.
   * @returns {Promise<void>} Resolves when the todo is loaded.
   */
  const handleSelectTodo = async (todoId) => {
    setIsLoadingTodo(true);
    setActiveTodo(null);
    try {
      const response = await fetch(`/api/todos/${todoId}`);
      if (!response.ok) {
        setTodoStatus({ state: 'error', message: 'Unable to load todo content' });
        setIsLoadingTodo(false);
        return;
      }

      const payload = await response.json();
      setActiveTodo(payload);
      setIsLoadingTodo(false);
      return;
    } catch (error) {
      setTodoStatus({ state: 'error', message: error.message });
      setIsLoadingTodo(false);
    }
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
            <StatusBlock status={status} />
          </div>
        </div>
        <div className="panel">
          <h2>Internal Todo App</h2>
          <p className="muted">Persist todo entries to file while indexing them in SQLite.</p>
          <div className="todo-grid">
            <TodoForm
              title={todoTitle}
              body={todoBody}
              onTitleChange={setTodoTitle}
              onBodyChange={setTodoBody}
              onSubmit={handleCreateTodo}
              status={todoStatus}
            />
            <TodoList todos={todos} activeId={activeTodo?.id ?? null} onSelect={handleSelectTodo} />
          </div>
          <TodoPreview todo={activeTodo} isLoading={isLoadingTodo} />
        </div>
      </section>
    </main>
  );
}
