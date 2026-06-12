import { createServer } from 'node:http';

const PORT = 8000;

const server = createServer((req, res) => {
  res.end('Hello from server!');
});

server.listen(PORT, () => {
  console.log(`Server running on PORT = ${PORT}`);
});
