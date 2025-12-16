import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import * as todoService from '../../../interface/services/todoService.js';

async function createIsolatedStore() {
  const directory = await mkdtemp(path.join(tmpdir(), 'todo-service-'));
  process.env.TODO_STORAGE_DIR = directory;
  todoService.resetTodoStore();
  return directory;
}

test('creates and loads todos from file storage', async (t) => {
  const directory = await createIsolatedStore();
  t.after(async () => {
    todoService.resetTodoStore();
    await rm(directory, { recursive: true, force: true });
  });

  const created = await todoService.createTodo('Write docs', 'Document the todo flow.');
  assert.ok(created.id > 0);

  const todos = todoService.listTodos();
  assert.equal(todos.length, 1);
  assert.equal(todos[0].title, 'Write docs');

  const loaded = await todoService.loadTodo(created.id);
  assert.equal(loaded?.body, 'Document the todo flow.');

  const persisted = await readFile(todos[0].filePath, 'utf8');
  assert.equal(persisted, 'Document the todo flow.');
});

test('returns null when todo is missing or corrupted', async (t) => {
  const directory = await createIsolatedStore();
  t.after(async () => {
    todoService.resetTodoStore();
    await rm(directory, { recursive: true, force: true });
  });

  const missing = await todoService.loadTodo(42);
  assert.equal(missing, null);

  const created = await todoService.createTodo('Broken file', 'This will be deleted.');
  await rm(todoService.listTodos()[0].filePath, { force: true });
  const corrupted = await todoService.loadTodo(created.id);
  assert.equal(corrupted, null);
});
