import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

// posts.json lives in ../data relative to this file; it is now only used to
// seed an empty table on first boot (it is no longer the runtime store).
function getSeedPath() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return join(__dirname, '..', 'data', 'posts.json');
}

async function seedFromJson() {
  const raw = await readFile(getSeedPath(), 'utf-8');
  const posts = JSON.parse(raw);
  if (posts.length === 0) return;

  // Insert without ids so the SERIAL column assigns them in array order
  // (1..N); this keeps the sequence in sync for later inserts automatically.
  for (const { title, author, content } of posts) {
    await pool.query(
      'INSERT INTO posts (title, author, content) VALUES ($1, $2, $3)',
      [title, author, content]
    );
  }
}

// Creates the posts table if it does not exist and seeds it once when empty.
// Idempotent: safe to run on every startup.
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id      SERIAL PRIMARY KEY,
      title   TEXT NOT NULL,
      author  TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM posts');
  if (rows[0].count === 0) {
    await seedFromJson();
  }
}
