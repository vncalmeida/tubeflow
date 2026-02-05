require('dotenv').config();

module.exports = {
  dbConfig: {
    dbType: process.env.DB_TYPE || 'mysql',
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      user: 'tubeflowsaas_user',
      password: '0Gg12m',
      database: 'tubeflowsaas',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.MYSQL_SSL ? { rejectUnauthorized: false } : undefined,
    },
    postgres: {
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://tubeflow:tubeflow@145.223.29.205:5432/tubeflow',
      ssl:
        process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: false, ca: process.env.PG_SSL_CA }
          : false,
      max: parseInt(process.env.PG_POOL_SIZE) || 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  },
  orderQuantityDefault: 2,
  fetchInterval: 30 * 60 * 1000,
  queueProcessInterval: 5000,
  port: 1106,
  baseUrl: 'https://cms.vroxmidias.com',
  JWT_SECRET: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicmFuZG9tX3VzZXIiLCJleHAiOjE3NDA1MTc1MzV9.1SOKh5LCjaCywd27mzMzbitFW10T-62sydCEbrUH4Oo',
  allowedOrigins: [
    'http://localhost:5173',
    'http://localhost:3001',
    'http://77.37.43.248:3333',
    'https://tubeflow10x.com',
    'https://www.tubeflow10x.com',
    process.env.CORS_ORIGIN,
  ].filter(Boolean),

  postgresSettings: {
    schema: process.env.PG_SCHEMA || 'public',
    statementTimeout: 5000,
    query_timeout: 10000,
  },
};
