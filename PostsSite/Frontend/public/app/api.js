const API_BASE = 'http://localhost:8000';

export async function getPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function createPost(post) {
  const res = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    throw new Error(`Failed to create post: ${res.status} ${res.statusText}`);
  }
  // Backend responds 201 with the saved post (server-assigned id included).
  return res.json();
}
