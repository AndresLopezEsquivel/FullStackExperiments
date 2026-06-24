import app from './src/app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is up and running on PORT = ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`PORT ${PORT} is already in use.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
