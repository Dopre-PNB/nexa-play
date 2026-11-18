require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'mysql';
const common = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nexa_play',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  dialect,
  ...(process.env.DATABASE_URL ? { use_env_variable: 'DATABASE_URL' } : {}),
  dialectOptions: dialect === 'mysql'
    ? { charset: 'utf8mb4', ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}) }
    : (process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
  ...(dialect === 'mysql' ? { define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' } } : {}),
  logging: false,
};

module.exports = {
  development: common,
  test: { ...common, database: process.env.DB_TEST_NAME || 'nexa_play_test' },
  production: {
    ...common,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
      charset: 'utf8mb4',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    },
  },
};

