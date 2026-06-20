import { getPosts } from './api.js';
import { initCardResize, renderPosts } from './dom.js';

initCardResize();

try {
  const posts = await getPosts();
  renderPosts(posts);
} catch (err) {
  console.error('Failed to load posts:', err);
}