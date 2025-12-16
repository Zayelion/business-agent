import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

let database = null;
let cachedPaths = null;

/**
 * Resolves storage paths for the todo database and task files.
 * @returns {{ baseDirectory: string, tasksDirectory: string, databasePath: string }} Directory paths for storage.
 */
function resolveStoragePaths() {
  if (cachedPaths) {
    return cachedPaths;
  }

  const baseDirectory = process.env.TODO_STORAGE_DIR ?? path.join(process.cwd(), 'interface', 'server', 'storage');
  const tasksDirectory = path.join(baseDirectory, 'tasks');
  const databasePath = path.join(baseDirectory, 'todos.sqlite');

  cachedPaths = { baseDirectory, tasksDirectory, databasePath };
  return cachedPaths;
}

/**
 * Ensures directories backing the todo storage exist.
 * @returns {Promise<{ baseDirectory: string, tasksDirectory: string, databasePath: string }>} Resolved storage paths.
 */
async function ensureDirectories() {
  const paths = resolveStoragePaths();
  await mkdir(paths.baseDirectory, { recursive: true });
  await mkdir(paths.tasksDirectory, { recursive: true });
  return paths;
}

/**
 * Initializes and returns a SQLite database connection.
 * @returns {DatabaseSync} SQLite database instance.
 */
function getDatabase() {
  if (database) {
    return database;
  }

  const paths = resolveStoragePaths();
  database = new DatabaseSync(paths.databasePath);
  database.exec('PRAGMA journal_mode = WAL;');
  database.exec(
    'CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, file_path TEXT NOT NULL, created_at TEXT NOT NULL);'
  );
  return database;
}

/**
 * Persists a new todo by writing it to disk and recording metadata in SQLite.
 * @param {string} title Short title for the todo entry.
 * @param {string} body Detailed body to store in an accompanying file.
 * @returns {Promise<{ id: number, title: string, createdAt: string }>} Newly created todo metadata.
 */
export async function createTodo(title, body) {
  const normalizedTitle = title?.trim();
  const normalizedBody = body?.trim();
  if (!normalizedTitle || !normalizedBody) {
    throw new Error('Both title and body are required to create a todo');
  }

  const paths = await ensureDirectories();
  const db = getDatabase();
  const createdAt = new Date().toISOString();
  const fileName = `${createdAt.replace(/[:.]/g, '-')}-${randomUUID()}.txt`;
  const filePath = path.join(paths.tasksDirectory, fileName);

  await writeFile(filePath, normalizedBody, 'utf8');
  const statement = db.prepare('INSERT INTO todos (title, file_path, created_at) VALUES (?1, ?2, ?3);');
  const result = statement.run(normalizedTitle, filePath, createdAt);
  return { id: Number(result.lastInsertRowid), title: normalizedTitle, createdAt };
}

/**
 * Retrieves todo metadata from the SQLite store.
 * @returns {{ id: number, title: string, filePath: string, createdAt: string }[]} Todos ordered by creation time.
 */
export function listTodos() {
  const db = getDatabase();
  const statement = db.prepare('SELECT id, title, file_path AS filePath, created_at AS createdAt FROM todos ORDER BY created_at DESC;');
  return statement.all();
}

/**
 * Loads a todo and its saved file contents.
 * @param {number|string} todoId Identifier of the todo to retrieve.
 * @returns {Promise<{ id: number, title: string, body: string, createdAt: string }|null>} Todo payload or null when not found.
 */
export async function loadTodo(todoId) {
  const id = Number.parseInt(todoId, 10);
  if (Number.isNaN(id)) {
    return null;
  }

  const db = getDatabase();
  const statement = db.prepare('SELECT id, title, file_path AS filePath, created_at AS createdAt FROM todos WHERE id = ?1 LIMIT 1;');
  const row = statement.get(id);
  if (!row) {
    return null;
  }

  if (!fs.existsSync(row.filePath)) {
    return null;
  }

  const body = await readFile(row.filePath, 'utf8');
  return { id: row.id, title: row.title, body, createdAt: row.createdAt };
}

/**
 * Clears cached connections so tests can reconfigure the storage location.
 * @returns {void} Returns nothing.
 */
export function resetTodoStore() {
  if (database) {
    database.close();
  }

  database = null;
  cachedPaths = null;
}

/**
 * Exposes the computed storage paths for inspection or tooling.
 * @returns {{ baseDirectory: string, tasksDirectory: string, databasePath: string }} Storage path definitions.
 */
export function getStoragePaths() {
  return resolveStoragePaths();
}
