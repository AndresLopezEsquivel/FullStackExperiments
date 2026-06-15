import { createServer } from "node:http";

const PORT = 8000;

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  res.end('<h1>Server is up and running</h1>');
});

server.listen(PORT, () => {
  console.log(`Sever is running on PORT = ${PORT}`);
});
