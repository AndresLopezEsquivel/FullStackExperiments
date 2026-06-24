import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_PATH = join(__dirname, 'posts.json');

export async function readPosts() {
  return JSON.parse(await readFile(POSTS_PATH, 'utf-8'));
}
