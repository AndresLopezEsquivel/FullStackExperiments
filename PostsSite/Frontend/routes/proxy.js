import http from 'node:http';

export function getPost(res) {
  // POST forwards headers: req.headers mainly to pass Content-Type
  // and Content-Length, so the backend can parse the body correctly.
  // GET has no body, so those headers aren't needed—the example just omits
  // them for simplicity. You could forward headers on GET too; it's just less necessary here.
  const backendReq = http.request(
    { host: 'localhost', port: 3000, path: '/', method: 'GET' },
    backendRes => {
      res.writeHead(backendRes.statusCode, backendRes.headers);
      // Streams backend's response body straight to the client, ending res automatically
      backendRes.pipe(res);
    }
  );
  backendReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend unavailable' }));
  });
  backendReq.end();
}

export function createPost(req, res) {
  const backendReq = http.request(
    {
      host: 'localhost',
      port: 3000,
      path: '/',
      method: 'POST',
      // It copies all incoming headers (...req.headers) but overrides host to localhost.
      // The client's original Host header (e.g. localhost:8000) would otherwise be
      // forwarded to the backend, which is wrong. Overriding it ensures the
      // Host matches the backend you're actually calling (e.g. localhost:3000)
      headers: { ...req.headers, host: 'localhost' },
    },
    backendRes => {
      res.writeHead(backendRes.statusCode, backendRes.headers);
      // Streams backend's response body straight to the client, ending res automatically
      backendRes.pipe(res);
    }
  );
  backendReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend unavailable' }));
  });
  req.on('error', () => {
    backendReq.destroy();
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad request' }));
  });
  // Forwards client body to backend and ends the request, dispatching it
  req.pipe(backendReq);
}
