import { pool } from '../db/pool.js';

export async function readPosts() {
  const { rows } = await pool.query(
    'SELECT id, title, author, content FROM posts ORDER BY id'
  );
  return rows;
}

export async function addPost(newPost) {
  const { title, author, content } = newPost;
  const { rows } = await pool.query(
    `INSERT INTO posts (title, author, content)
     VALUES ($1, $2, $3)
     RETURNING id, title, author, content`,
    [title, author, content]
  );
  return rows[0];
}
