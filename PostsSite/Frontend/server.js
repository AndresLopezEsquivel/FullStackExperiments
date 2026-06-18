import { createServer } from 'node:http';
import { getPost, createPost } from './routes/proxy.js';

const PORT = 8000;

function logRequest(req) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
}

const server = createServer((req, res) => {
  logRequest(req);
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
