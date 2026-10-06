require('dotenv').config();

const app = require('./src/app');
const { connectToDatabase } = require('./src/config/database');

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Backend startup failed:', error.message);
  process.exitCode = 1;
});
