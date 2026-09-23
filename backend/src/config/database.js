const sql = require('mssql');
const logger = require('./logger');
require('dotenv').config();

function buildDatabaseConfig(env = process.env) {
  for (const key of ['DB_USER', 'DB_PASSWORD']) {
    if (!env[key] || !env[key].trim() || /^(YOUR_|CHANGE_ME|REPLACE_ME)/i.test(env[key])) {
      throw new Error(key + ' must be supplied in the local environment');
    }
  }
  function bool(key, fallback) {
    if (env[key] == null || env[key] === '') return fallback;
    if (!['true', 'false'].includes(env[key])) throw new Error(key + ' must be true or false');
    return env[key] === 'true';
  }
  const encrypt = bool('DB_ENCRYPT', true);
  const trustServerCertificate = bool('DB_TRUST_SERVER_CERTIFICATE', false);
  if (env.NODE_ENV === 'production' && (!encrypt || trustServerCertificate)) {
    throw new Error('Production SQL connections require verified TLS');
  }
  const port = Number(env.DB_PORT || 1433);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid DB_PORT');
  return {
    server: env.DB_SERVER || 'localhost',
    database: env.DB_NAME || 'f1_garage_tec',
    port,
    authentication: { type: 'default', options: { userName: env.DB_USER, password: env.DB_PASSWORD } },
    options: { encrypt, trustServerCertificate }
  };
}

let pool;
async function connectDB() {
  const connection = new sql.ConnectionPool(buildDatabaseConfig());
  try {
    await connection.connect();
    pool = connection;
    logger.info('Connected to SQL Server');
    return pool;
  } catch (error) {
    await connection.close().catch(() => {});
    throw error;
  }
}

function getPool() {
  if (!pool?.connected) throw new Error('Database is not connected');
  return pool;
}

async function closeDB() {
  if (pool) {
    await pool.close();
    pool = undefined;
    logger.info('Database connection closed');
  }
}

module.exports = { buildDatabaseConfig, connectDB, getPool, closeDB };
