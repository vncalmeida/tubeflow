const bunyan = require('bunyan');
const { sendErrorNotification } = require('./errorReporter');

const baseLogger = bunyan.createLogger({
  name: 'tubeflow-saas',
  level: process.env.LOG_LEVEL || 'info',
  streams: [
    {
      stream: process.stdout
    },
    {
      level: 'error',
      type: 'raw',
      stream: {
        write: (record) => {
          sendErrorNotification(record).catch((error) => {
            // avoid recursive logging; fall back to console
            console.error('Falha ao enviar notificação de erro:', error);
          });
        }
      }
    }
  ]
});

const childLoggers = new Map();

function getLogger(name = 'app') {
  if (!childLoggers.has(name)) {
    childLoggers.set(name, baseLogger.child({ module: name }));
  }
  return childLoggers.get(name);
}

module.exports = {
  baseLogger,
  getLogger
};
