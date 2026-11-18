require('dotenv').config();
const { loadEnv } = require('./config/env');
const { sequelize } = require('./models');
const { createApp } = require('./app');

const env = loadEnv();
const app = createApp(env);
let server;

async function shutdown(signal) {
  console.info({ event: 'server_shutdown', signal });
  if (server) await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
  process.exit(0);
}

async function start() {
  try {
    await sequelize.authenticate();
    server = app.listen(env.PORT, '0.0.0.0', () => {
      console.info({ event: 'server_started', port: env.PORT, environment: env.NODE_ENV });
    });
  } catch (error) {
    console.error({ event: 'server_start_failed', message: error.message, code: error.code });
    await sequelize.close();
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
start();
