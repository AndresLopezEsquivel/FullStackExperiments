import getDataFromDB from './database/db.js';
import { createServer } from 'node:http';
import { sendSuccess, sendError } from './utils/response.js';

const PORT = 8000;

const server = createServer(async (req, res) => {
  if (req.url === '/api' && req.method === 'GET') {
    try {
      const data = await getDataFromDB();
      sendSuccess(res, data);
    } catch (err) {
      sendError(res, 500, 'Internal Server Error', 'An Internal Server Error occurred');
    }
  } else if (req.url.startsWith('/api/continent/') && req.method === 'GET') {
    const continent = req.url.split('/').at(-1);
    try {
      const data = await getDataFromDB();
      const continentData = data.filter(item => item.continent.toLowerCase() === continent.toLowerCase());
      if (continentData.length) {
        sendSuccess(res, continentData);
      } else {
        sendError(res, 404, 'Not Found', "Requested continent wasn't found");
      }
    } catch (err) {
      sendError(res, 500, 'Internal Server Error', 'An Internal Server Error occurred');
    }
  } else if (req.url.startsWith("/api/country/") && req.method === 'GET') {
    const country = decodeURIComponent(req.url.split('/').at(-1));
    console.log(`country = ${country}`);
    const data = await getDataFromDB();
    const countryData = data.filter(item => item.country.toLowerCase() === country.toLowerCase());
    if (countryData.length) {
      sendSuccess(res, countryData);
    } else {
      sendError(res, 404, 'Not Found', "Requested country wasn't found");
    }
  } else {
    sendError(res, 404, 'Not Found', "Requested route doesn't exist");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on PORT = ${PORT}`);
});
