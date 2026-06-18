import { createServer } from 'node:http';
import { getPost, createPost } from './routes/proxy.js';

const PORT = 8000;

function logRequest(req) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
}

const server =  createServer((req, res) => {
  if (req.url === '/api/posts' && req.method === 'GET') {
    getPost(res);
  } else if (req.url === '/api/posts' && req.method === 'POST') {
    createPost(req, res)
  }
});

server.listen(PORT, () => {
  console.log(`Static Server listening on PORT = ${PORT}`);
});
