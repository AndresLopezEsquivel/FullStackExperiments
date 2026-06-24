import express from 'express';
import { apiRouter } from './routes/posts.route.js';

const app = express();

app.use('/api', apiRouter);

// Unmatched routes -> JSON 404 (keeps API responses consistent).
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Centralized JSON error handler. Express 5 forwards rejected async
// handlers here automatically. The 4-arg signature is what marks this
// as error-handling middleware, so `next` must stay.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
