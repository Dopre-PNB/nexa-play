const { Sequelize } = require('sequelize');

const dialect = process.env.DB_DIALECT || 'mysql';
const connectionOptions = {
    dialect,
    logging: false,
    timezone: '+00:00',
    dialectOptions: dialect === 'mysql'
      ? { charset: 'utf8mb4', ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}) }
      : (process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
    ...(dialect === 'mysql' ? { define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' } } : {}),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, connectionOptions)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        ...connectionOptions,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || (dialect === 'postgres' ? 5432 : 3306)),
      },
    );

module.exports = sequelize;

