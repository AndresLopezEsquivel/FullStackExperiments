import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Example: /Users/.../PostsSite/Server/data/posts.json
function getDataPath() {
  // Returns folder's absolute path where store.js lives
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return join(__dirname, 'posts.json');
}

export async function readPosts() {
  const data = await readFile(getDataPath(), 'utf-8');
  return JSON.parse(data);
}

export async function addPost(newPost) {
  const filePath = getDataPath();
  const data = await readFile(filePath, 'utf-8');
  const posts = JSON.parse(data);
  const latestId = posts.at(-1)?.id ?? 0;
  newPost.id = latestId + 1;
  posts.push(newPost);
  await writeFile(filePath, JSON.stringify(posts, null, 2), 'utf-8');
  return newPost;
}
