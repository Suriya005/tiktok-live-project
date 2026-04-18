const { connectDatabase, closeDatabase } = require('./config/database');
const { server } = require('./app');
const tiktokAdapter = require('./adapters/tiktok.adapter');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const start = async () => {
  await connectDatabase();

  server.listen(PORT, HOST, () => {
    logger.info('[Server] Started', { host: HOST, port: PORT });
  });
};

const shutdown = async () => {
  logger.info('[Server] Shutting down...');
  tiktokAdapter.disconnect();
  await closeDatabase();
  server.close(() => {
    logger.info('[Server] Closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  logger.error('[Server] Startup failed', { err: err.message });
  process.exit(1);
});
