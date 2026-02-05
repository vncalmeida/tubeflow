const nodemailer = require('nodemailer');

const user = 'contato@tubeflow10x.com';
const pass = 'V1d4l0k4@@';

function createTransport() {
  const host = 'smtp.zoho.com';
  const port = 465;
  const secure = true;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: false,
    auth: {
      user,
      pass
    },
    tls: { servername: host }
  });
}

createTransport.FROM_EMAIL = user;

module.exports = createTransport;
