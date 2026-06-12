import getDataFromDB from './database/db.js';
import { createServer } from 'node:http';

const PORT = 8000;

const server = createServer(async (req, res) => {
  if (req.url === '/api' && req.method === 'GET') {
    try {
      const data = await getDataFromDB();
      const stringifiedJSON = JSON.stringify(data);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(stringifiedJSON);
    } catch (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 404;
    res.end(JSON.stringify({
      error: "Not Found",
      message: "Requested route doesn't exist"
    }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on PORT = ${PORT}`);
});
