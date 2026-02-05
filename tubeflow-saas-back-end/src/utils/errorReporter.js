const os = require('os');
const createTransport = require('./mail');

const ALERT_EMAIL = 'contato@conexaocode.com.br';
const APP_TZ = process.env.APP_TZ || 'America/Sao_Paulo';

const transporter = createTransport();

const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    background-color: #0f172a;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  .wrapper {
    width: 100%;
    padding: 32px 0;
  }
  .container {
    max-width: 720px;
    margin: 0 auto;
    background: #0b1120;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.45);
  }
  .header {
    background: linear-gradient(135deg, #ec4899, #ef4444);
    padding: 28px 32px;
    color: #fff;
  }
  .header h1 {
    margin: 0;
    font-size: 24px;
    letter-spacing: 0.04em;
  }
  .content {
    padding: 32px;
    color: #e2e8f0;
  }
  .content p {
    color: #cbd5f5;
    line-height: 1.6;
    margin: 0 0 18px;
  }
  .badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: rgba(236, 72, 153, 0.15);
    color: #f472b6;
    border: 1px solid rgba(244, 114, 182, 0.2);
    margin-bottom: 18px;
  }
  .section {
    margin-top: 28px;
    padding: 24px;
    background: rgba(30, 41, 59, 0.65);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 16px;
  }
  .section h2 {
    margin: 0 0 16px;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #94a3b8;
  }
  .meta-table {
    width: 100%;
    border-collapse: collapse;
  }
  .meta-table tr {
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  }
  .meta-table tr:last-child {
    border-bottom: none;
  }
  .meta-table td {
    padding: 10px 0;
    font-size: 14px;
    vertical-align: top;
  }
  .meta-key {
    width: 32%;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }
  .meta-value {
    color: #e2e8f0;
    word-break: break-word;
  }
  .code-block {
    background: #020617;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    padding: 18px;
    color: #e0f2fe;
    font-family: 'Fira Code', 'Source Code Pro', Consolas, 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .footer {
    padding: 24px 32px 32px;
    text-align: center;
    font-size: 12px;
    color: #64748b;
  }
`;

const sanitizedInfo = (record = {}) => {
  const excludeKeys = new Set([
    'v',
    'level',
    'name',
    'hostname',
    'pid',
    'time',
    'msg',
    'module',
    'err',
    'stack',
    'code',
    'stream',
    'hostname',
    'src'
  ]);

  return Object.entries(record)
    .filter(([key, value]) => {
      if (excludeKeys.has(key)) return false;
      if (value === undefined || value === null) return false;
      if (typeof value === 'object' && Object.keys(value).length === 0) return false;
      return true;
    })
    .map(([key, value]) => ({
      key,
      value:
        typeof value === 'object'
          ? `<pre class="code-block" style="margin: 8px 0 0">${escapeHtml(
              JSON.stringify(value, null, 2)
            )}</pre>`
          : escapeHtml(String(value))
    }));
};

const escapeHtml = (unsafe = '') =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatTimestamp = (value) => {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: APP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  return {
    iso: date.toISOString(),
    formatted: formatter.format(date)
  };
};

const levelName = (level) => {
  if (level >= 60) return 'Fatal';
  if (level >= 50) return 'Error';
  if (level >= 40) return 'Warn';
  if (level >= 30) return 'Info';
  if (level >= 20) return 'Debug';
  return 'Trace';
};

const buildHtmlEmail = (record) => {
  const { formatted: formattedTime, iso } = formatTimestamp(record.time || new Date());
  const metadata = sanitizedInfo(record);
  const errorMessage =
    record.err?.message || record.error || record.msg || 'Erro não especificado';
  const stackTrace = record.err?.stack || record.stack || record.errorStack;
  const contextSummary = [
    { label: 'Módulo', value: record.module || 'N/D' },
    { label: 'Mensagem', value: escapeHtml(record.msg || '—') },
    { label: 'Nível', value: levelName(record.level) },
    { label: 'Request ID', value: record.requestId || 'N/D' },
    { label: 'Servidor', value: `${os.hostname()} • PID ${process.pid}` },
    { label: 'Momento', value: `${formattedTime}<br/><code>${iso}</code>` }
  ];

  const metadataRows = contextSummary
    .map(
      ({ label, value }) => `
      <tr>
        <td class="meta-key">${escapeHtml(label)}</td>
        <td class="meta-value">${value}</td>
      </tr>
    `
    )
    .join('');

  const extraRows = metadata
    .map(
      ({ key, value }) => `
      <tr>
        <td class="meta-key">${escapeHtml(key)}</td>
        <td class="meta-value">${value}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Alerta de Erro - TubeFlow SaaS</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>🚨 Alerta de Erro Crítico</h1>
              <p style="margin-top: 8px; opacity: 0.82;">
                O sistema detectou uma ocorrência inesperada e gerou um relatório completo abaixo.
              </p>
            </div>
            <div class="content">
              <span class="badge">TubeFlow SaaS Monitor</span>
              <p>
                Uma exceção foi registrada em ambiente <strong>${escapeHtml(
                  process.env.NODE_ENV || 'production'
                )}</strong>. Analise os detalhes para agir rapidamente e garantir estabilidade.
              </p>
              <div class="section">
                <h2>Resumo do evento</h2>
                <table class="meta-table">
                  ${metadataRows}
                  ${extraRows}
                </table>
              </div>
              ${
                stackTrace
                  ? `
                <div class="section">
                  <h2>Stack trace</h2>
                  <pre class="code-block">${escapeHtml(stackTrace)}</pre>
                </div>
              `
                  : ''
              }
              <div class="section">
                <h2>Mensagem principal</h2>
                <div class="code-block" style="background: #111a2f; color: #f8fafc;">
                  ${escapeHtml(errorMessage)}
                </div>
              </div>
            </div>
            <div class="footer">
              Esse relatório foi gerado automaticamente. Em caso de dúvida, contate a equipe técnica TubeFlow.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

const sendErrorNotification = async (record) => {
  if (!record) return;

  const subject = `[TubeFlow][Erro] ${record.msg || record.err?.message || 'Evento não identificado'}`;
  const html = buildHtmlEmail(record);

  await transporter.sendMail({
    from: `"Monitor TubeFlow" <${createTransport.FROM_EMAIL}>`,
    to: ALERT_EMAIL,
    subject,
    html
  });
};

module.exports = { sendErrorNotification };
