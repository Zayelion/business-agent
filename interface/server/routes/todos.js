import { Router } from 'express';
import { createTodo, listTodos, loadTodo } from '../../services/todoService.js';

const router = Router();

/**
 * Handles todo creation requests by writing content to disk and recording metadata in SQLite.
 * @param {import('express').Request} req Incoming request containing a title and body.
 * @param {import('express').Response} res Express response used to acknowledge creation.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export async function handleCreateTodo(req, res) {
  const { title, body } = req.body ?? {};
  if (!title || !body) {
    res.status(400).json({ error: 'title and body are required' });
    return;
  }

  try {
    const todo = await createTodo(title, body);
    res.status(201).json(todo);
    return;
  } catch (error) {
    res.status(500).json({ error: `Failed to save todo: ${error.message}` });
  }
}

/**
 * Returns todo metadata without loading individual files.
 * @param {import('express').Request} _req Incoming request object.
 * @param {import('express').Response} res Express response used to deliver todos.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export async function handleListTodos(_req, res) {
  const todos = listTodos();
  res.json(
    todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      createdAt: todo.createdAt
    }))
  );
}

/**
 * Loads todo content from disk using the SQLite index.
 * @param {import('express').Request} req Incoming request containing a todo identifier.
 * @param {import('express').Response} res Express response used to return the todo content.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export async function handleGetTodo(req, res) {
  const todo = await loadTodo(req.params.todoId);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }

  res.json(todo);
}

router.post('/', handleCreateTodo);
router.get('/', handleListTodos);
router.get('/:todoId', handleGetTodo);

export default router;
