import { getPosts, createPost } from './api.js';
import { initCardResize, renderPosts, prependPost, initPostForm } from './dom.js';

initCardResize();

initPostForm(async data => {
  const saved = await createPost(data);
  prependPost(saved);
});

try {
  const posts = await getPosts();
  renderPosts(posts);
} catch (err) {
  console.error('Failed to load posts:', err);
}