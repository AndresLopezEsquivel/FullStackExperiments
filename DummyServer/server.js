import getDataFromDB from './database/db.js';
import { createServer } from 'node:http';
import { sendSuccess, sendError } from './utils/response.js';

const PORT = 8000;

const server = createServer(async (req, res) => {
  let data;

  try {
    data = await getDataFromDB();
  } catch (err) {
    sendError(res, 500, 'Internal Server Error', 'An Internal Server Error occurred');
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api' && req.method === 'GET') {
    const filteredData = data.filter(item =>
      [...url.searchParams].every(([param, value]) =>
        item[param]?.toLowerCase() === value.toLowerCase()
      )
    );
    sendSuccess(res, filteredData);
  } else if (url.pathname.startsWith('/api/continent/') && req.method === 'GET') {
    const continent = url.pathname.split('/').at(-1);
    const continentData = data.filter(item => item.continent.toLowerCase() === continent.toLowerCase());
    if (continentData.length) {
      sendSuccess(res, continentData);
    } else {
      sendError(res, 404, 'Not Found', "Requested continent wasn't found");
    }
  } else if (url.pathname.startsWith("/api/country/") && req.method === 'GET') {
    const country = decodeURIComponent(url.pathname.split('/').at(-1));
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
