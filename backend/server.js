require('dotenv').config();
const { connectDB, closeDB } = require('./src/config/database');
const logger = require('./src/config/logger');
const { sessionTimeoutMs } = require('./src/security/authPolicy');

async function start() {
  sessionTimeoutMs(); // Validate session settings before accepting requests.
  const app = require('./src/app');
  await connectDB(); // Missing/invalid credentials fail closed.
  const server = app.listen(process.env.PORT || 3001, () => logger.info('HTTP server started'));
  server.on('error', async () => {
    logger.error('HTTP server failed to start');
    await closeDB();
    process.exitCode = 1;
  });
  process.on('SIGINT', () => server.close(async () => {
    await closeDB();
    process.exitCode = 0;
  }));
  return server;
}

if (require.main === module) {
  start().catch(() => {
    logger.error('Startup failed; check local environment, database access and TLS configuration');
    process.exitCode = 1;
  });
}

module.exports = { start };
