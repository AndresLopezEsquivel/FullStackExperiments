import http, { request } from 'node:http';

export function getPost(res) {
  const backendReq = http.request(
    { host: 'localhost', port: 3000, path: '/', method: 'GET' },
    backendRes => {
      res.writeHead(backendRes.statusCode, backendRes.headers);
      backendRes.pipe(res); // relay JSON array back
    }
  );
  backendReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend unavailable' }));
  });
  backendReq.end(); // GET has no body to send
}

export function createPost(req, res) {
  const backendReq = http.request(
    { host: 'localhost', port: 3000, path: '/', method: 'POST', headers: req.headers },
    backendRes => {
      res.writeHead(backendRes.statusCode, backendRes.headers);
      backendRes.pipe(res); // relay created post (with id) back
    }
  );
  backendReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend unavailable' }));
  });
  req.pipe(backendReq); // forward the request body to backend
}
