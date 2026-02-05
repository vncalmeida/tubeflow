require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { randomUUID } = require('crypto');
const { port } = require('./config');
const { getLogger } = require('./utils/logger');
const { connect, getPoolInfo } = require('./config/database');
const { runStartupMigrations } = require('./utils/dbMigrations');

const Login = require('./routes/login');
const Cadastro = require('./routes/cadastro');
const RegisterFreelancer = require('./routes/registerfreelancer');
const Dashboard = require('./routes/dashboard');
const Canais = require('./routes/canais');
const Videos = require('./routes/videos');
const Reports = require('./routes/reports');
const Logs = require('./routes/logs');
const Settings = require('./routes/settings');
const Admin = require('./routes/admin');
const Payment = require('./routes/payment');
const Plans = require('./routes/plans');
const adminRoutes = require('./routes/adminRoutes');
const WelcomeSettings = require('./routes/welcomeSettings');
const FooterSettings = require('./routes/footerSettings');

const requestLogger = getLogger('http');
const appLogger = getLogger('app');

async function main() {
  const pool = await connect();
  await runStartupMigrations(pool, appLogger);

  app.use(
    cors({
      origin: '*',
      optionsSuccessStatus: 200,
    })
  );

  app.use(express.json());

  app.use((req, res, next) => {
    const requestId = randomUUID();
    const startTime = process.hrtime.bigint();

    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    requestLogger.info({
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection?.remoteAddress
    }, 'Incoming request');

    res.on('finish', () => {
      const durationNs = process.hrtime.bigint() - startTime;
      const durationMsRaw = Number(durationNs) / 1e6;
      const durationMs = Number(durationMsRaw.toFixed(2));
      const logPayload = {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        contentLength: res.get('Content-Length')
      };

      if (res.statusCode >= 500) {
        requestLogger.error(logPayload, 'Request completed with server error');
      } else if (res.statusCode >= 400) {
        requestLogger.warn(logPayload, 'Request completed with client error');
      } else {
        requestLogger.info(logPayload, 'Request completed successfully');
      }
    });

    next();
  });

  // injeta o pool
  app.use('/api', (req, res, next) => {
    req.db = pool;
    next();
  });

  // healthcheck de DB + infos do servidor
  app.get('/api', async (req, res) => {
    try {
      const [rows] = await req.db.query('SELECT 1 AS ping');
      if (!rows.length || rows[0].ping !== 1) {
        throw new Error('Resposta inesperada do banco');
      }

      return res.status(200).json({
        success: true,
        ping: 'pong',
        db: {
          status: 'connected',
          server: getPoolInfo(), // <--- seguro e compatível
        },
      });
    } catch (error) {
      requestLogger.error({
        requestId: req.requestId,
        error: error.message
      }, 'DB connection error');
      return res.status(500).json({
        success: false,
        ping: 'pong',
        db: {
          status: 'error',
          code: error.code || 'UNKNOWN',
          message: error.message,
          server: getPoolInfo(), // pode ser null se o pool não nasceu
        },
      });
    }
  });

  app.use('/api', Login);
  app.use('/api', Cadastro);
  app.use('/api', RegisterFreelancer);
  app.use('/api', Dashboard);
  app.use('/api', Canais);
  app.use('/api', Videos);
  app.use('/api', Settings);
  app.use('/api', Logs);
  app.use('/api', Admin);
  app.use('/api', Reports);
  app.use('/api', Payment);
  app.use('/api', Plans);
  app.use('/api/admin', adminRoutes);
  app.use('/api/admin', WelcomeSettings.admin);
  app.use('/api', WelcomeSettings.public);
  app.use('/api/admin', FooterSettings.admin);
  app.use('/api', FooterSettings.public);

  app.listen(port, () => {
    appLogger.info({ port }, 'Servidor iniciado');
  });

}

main().catch((error) => {
  appLogger.error({ error: error.message, stack: error.stack }, 'Erro ao iniciar servidor');
});
