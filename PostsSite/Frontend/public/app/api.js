// Base URL of the Frontend proxy (server.js, port 8000), which forwards
// /api/posts to the backend. While the UI is served separately (e.g. npx
// serve on another port) this must be absolute. Once static-file serving is
// added to the proxy, this can become a relative '' (same origin).
const API_BASE = 'http://localhost:8000';

export async function getPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }
  return res.json();
}