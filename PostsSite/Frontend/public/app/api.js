// The UI is served by the Frontend proxy (port 8000), so the API is same-origin
// and a relative base works.
const API_BASE = '';

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
