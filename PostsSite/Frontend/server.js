import { createServer } from 'node:http';
import { getPost, createPost } from './routes/proxy.js';

const PORT = 8000;

function logRequest(req) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
}

const server = createServer((req, res) => {
  logRequest(req);

  // Allow the static UI (served from a different origin/port, e.g. `npx serve`)
  // to call this proxy. Temporary until the UI is served from this same server.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/posts' && req.method === 'GET') {
    getPost(res);
  } else if (req.url === '/api/posts' && req.method === 'POST') {
    createPost(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(PORT, () => {
  console.log(`Proxy server listening on PORT = ${PORT}`);
});
