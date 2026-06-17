import { createServer } from "node:http";
import { getPosts, sendResponse } from "./routes/posts.js";

const PORT = 3000;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/' && req.method === 'GET') {
    await getPosts(res);
  } else {
    sendResponse(res, { error: 'Not Found' }, 404, 'application/json');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on PORT = ${PORT}`);
});
