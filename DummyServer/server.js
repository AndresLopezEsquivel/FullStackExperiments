import getDataFromDB from './database/db.js';
import { createServer } from 'node:http';

const PORT = 8000;

function sendError(res, status, error, message) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = status;
  res.end(JSON.stringify({ error, message }));
}

const server = createServer(async (req, res) => {
  if (req.url === '/api' && req.method === 'GET') {
    try {
      const data = await getDataFromDB();
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (err) {
      sendError(res, 500, 'Internal Server Error', 'An Internal Server Error occurred');
    }
  } else if (req.url.startsWith('/api/continent/') && req.method === 'GET') {
    const continent = req.url.split('/').at(-1);
    try {
      const data = await getDataFromDB();
      const continentData = data.filter(item => item.continent.toLowerCase() === continent.toLowerCase());
      if (continentData.length) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify(continentData));
      } else {
        sendError(res, 404, 'Not Found', "Requested continent wasn't found");
      }
    } catch (err) {
      sendError(res, 500, 'Internal Server Error', 'An Internal Server Error occurred');
    }
  } else {
    sendError(res, 404, 'Not Found', "Requested route doesn't exist");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on PORT = ${PORT}`);
});
