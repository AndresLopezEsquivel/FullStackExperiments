import { getPosts, createPost } from './api.js';
import { initCardResize } from './dom.js';

initCardResize();

/* Test purposes: Testing API */

const posts = await getPosts();
const post = await createPost({
  "id": 1,
  "title": "A Gospel That Dares to Ask Why",
  "author": "Saramago Reader",
  "content": "Saramago retells the life of Jesus as a human story shadowed by a God who knowingly sends his son to die. With his trademark winding sentences and sparse punctuation, he turns scripture into a meditation on guilt, free will, and divine responsibility. The result is tender and provocative: a Jesus who suffers not just on the cross but under the weight of a plan he never chose. It's less blasphemy than a deeply moral interrogation of faith."
});

console.log('post = ', post);
console.log('posts = ', posts);
