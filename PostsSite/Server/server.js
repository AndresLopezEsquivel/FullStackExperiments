import { createServer } from "node:http";
import { getPosts, createPost, sendResponse } from "./routes/posts.js";

const PORT = 3000;

function logRequest(req) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
}

const server = createServer(async (req, res) => {
  logRequest(req);
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/' && req.method === 'GET') {
      await getPosts(res);
    } else if (url.pathname === '/' && req.method === 'POST') {
      createPost(req, res);
    } else {
      sendResponse(res, { error: 'Not Found' }, 404, 'application/json');
    }
  } catch (error) {
    console.error('Unhandled request error:', error);
    sendResponse(res, { error: 'Internal Server Error' }, 500, 'application/json');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on PORT = ${PORT}`);
});
