import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import * as todoService from '../../../../interface/services/todoService.js';

function createResponseRecorder() {
  const state = { statusCode: 200, body: null };
  return {
    status(code) {
      state.statusCode = code;
      return this;
    },
    json(payload) {
      state.body = payload;
      return this;
    },
    get statusCode() {
      return state.statusCode;
    },
    get body() {
      return state.body;
    }
  };
}

test('todo route handlers persist and load todo content', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'todo-route-'));
  process.env.TODO_STORAGE_DIR = directory;
  todoService.resetTodoStore();
  t.after(async () => {
    todoService.resetTodoStore();
    await rm(directory, { recursive: true, force: true });
  });

  const module = await import('../../../../interface/server/routes/todos.js');
  const createRes = createResponseRecorder();
  await module.handleCreateTodo({ body: { title: 'Route todo', body: 'Stored through route handler' } }, createRes);
  assert.equal(createRes.statusCode, 201);

  const listRes = createResponseRecorder();
  await module.handleListTodos({}, listRes);
  const todoId = listRes.body?.[0]?.id;
  assert.ok(todoId);

  const getRes = createResponseRecorder();
  await module.handleGetTodo({ params: { todoId } }, getRes);
  assert.equal(getRes.statusCode, 200);
  assert.equal(getRes.body.body, 'Stored through route handler');
});
