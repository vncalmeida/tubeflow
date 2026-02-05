const mysql = require('mysql2');
const { dbConfig } = require('../config');

let promisePool = null;

function buildPool() {
  const basePool = mysql.createPool(dbConfig.mysql);

  // evento dispara no pool base
  basePool.on('connection', (connection) => {
    connection.query('SET time_zone = "-03:00"');
  });

  // retorna o wrapper promise
  return basePool.promise();
}

async function connect() {
  if (!promisePool) {
    promisePool = buildPool();
  }
  return promisePool;
}

// util para expor info segura do pool
function getPoolInfo() {
  if (!promisePool) return null;
  // no wrapper promise, a config está em .pool.config.connectionConfig
  const cc = promisePool.pool.config.connectionConfig;
  return {
    host: cc.host,
    port: cc.port,
    user: cc.user,
    database: cc.database,
    ssl: Boolean(cc.ssl),
  };
}

module.exports = { connect, getPoolInfo };
