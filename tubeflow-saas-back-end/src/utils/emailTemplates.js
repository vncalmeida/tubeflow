const BRAND = {
  name: 'TubeFlow',
  appUrl: 'https://tubeflow.app',
  supportUrl: 'https://tubeflow.app/suporte',
  privacyUrl: 'https://tubeflow.app/privacidade'
};

function shell({ title, preheader = '', bodyHtml = '', cta }) {
  const year = new Date().getFullYear();
  const btn = cta
    ? `
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:24px 0 0 0;width:100%;">
        <tr>
          <td align="center">
            <a href="${cta.href}" style="background:#ffffff;color:#000000;display:inline-block;font-weight:700;font-size:14px;line-height:20px;text-decoration:none;padding:12px 20px;border-radius:12px;">
              ${cta.label}
            </a>
          </td>
        </tr>
      </table>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <style>
    @media (max-width: 620px) {
      .container { width: 100% !important; }
      .card { padding: 22px !important; border-radius: 14px !important; }
      .h1 { font-size: 20px !important; line-height: 26px !important; }
      .p { font-size: 14px !important; line-height: 22px !important; }
    }
    a { color: #ffffff; }
  </style>
</head>
<body style="margin:0;padding:0;background:#0b0b0b;color:#f5f5f5;-webkit-font-smoothing:antialiased;word-break:break-word;">
  <div style="display:none;opacity:0;visibility:hidden;height:0;width:0;overflow:hidden;mso-hide:all;">${preheader}</div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#0b0b0b;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="max-width:600px;">
          <tr>
            <td align="center" style="padding:0 0 16px 0;">
              <a href="${BRAND.appUrl}" style="text-decoration:none;display:inline-block;">
                <span style="display:inline-block;font-family:Inter,Segoe UI,Arial,sans-serif;color:#ffffff;">
                  <span style="font-size:22px;line-height:28px;font-weight:800;letter-spacing:0.2px;">Tube</span><span style="font-size:22px;line-height:28px;font-weight:600;margin-left:2px;">Flow</span>
                </span>
              </a>
            </td>
          </tr>

          <tr>
            <td class="card" style="background:#121212;border:1px solid #232323;border-radius:16px;padding:28px;">
              <h1 class="h1" style="margin:0 0 8px 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:22px;line-height:28px;font-weight:800;color:#ffffff;">
                ${title}
              </h1>
              ${preheader ? `<p class="p" style="margin:0 0 18px 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:15px;line-height:22px;color:#d9d9d9;">${preheader}</p>` : ''}

              ${bodyHtml}
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:18px 8px 0 8px;">
              <div style="font-family:Inter,Segoe UI,Arial,sans-serif;font-size:12px;line-height:18px;color:#bdbdbd;">
                Este é um e-mail automático. Em caso de dúvidas, acesse o <a href="${BRAND.supportUrl}" style="color:#ffffff;text-decoration:underline;">Suporte</a>.
              </div>
              <div style="font-family:Inter,Segoe UI,Arial,sans-serif;font-size:12px;line-height:18px;color:#bdbdbd;margin-top:6px;">
                <a href="${BRAND.privacyUrl}" style="color:#ffffff;text-decoration:underline;">Política de Privacidade</a>
              </div>
              <div style="font-family:Inter,Segoe UI,Arial,sans-serif;font-size:12px;line-height:18px;color:#8a8a8a;margin-top:8px;">
                © ${year} ${BRAND.name}. Todos os direitos reservados.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function credsBlock(items) {
  const rows = items
    .map(
      ({ label, value, mono }) => `
      <tr>
        <td style="padding:8px 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:14px;line-height:20px;color:#cfcfcf;width:140px;">${label}</td>
        <td style="padding:8px 0;font-family:${mono ? 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace' : 'Inter,Segoe UI,Arial,sans-serif'};font-size:14px;line-height:20px;color:#ffffff;font-weight:600;">${value}</td>
      </tr>`
    )
    .join('');
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#161616;border:1px solid #232323;border-radius:12px;padding:14px 16px;">
      ${rows}
    </table>
  `;
}

function tipsBlock() {
  return `
    <ul style="margin:14px 0 0 18px;padding:0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:13px;line-height:20px;color:#cfcfcf;">
      <li>Altere sua senha no primeiro acesso.</li>
      <li>Mantenha suas credenciais em local seguro.</li>
      <li>Ative a autenticação de dois fatores quando disponível.</li>
    </ul>
  `;
}

function freelancerRegistration({ email, generatedPassword }) {
  const bodyHtml = `
    <p class="p" style="margin:0 0 14px 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:15px;line-height:22px;color:#d9d9d9;">
      Bem-vindo(a) ao <strong>TubeFlow</strong>! Seu cadastro como freelancer foi concluído.
    </p>

    ${credsBlock([
      { label: 'E-mail', value: email },
      { label: 'Senha temporária', value: generatedPassword, mono: true }
    ])}

    <p class="p" style="margin:16px 0 0 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:14px;line-height:22px;color:#cfcfcf;">
      Por segurança, recomendamos atualizar sua senha após o primeiro login:
    </p>
    ${tipsBlock()}
  `;

  return shell({
    title: 'Bem-vindo(a) ao TubeFlow',
    preheader: 'Seu acesso como freelancer foi ativado. Veja suas credenciais.',
    bodyHtml,
    cta: { href: `${BRAND.appUrl}/login`, label: 'Acessar o TubeFlow' }
  });
}

function adminRegistration({ name, email, randomPassword }) {
  const bodyHtml = `
    <p class="p" style="margin:0 0 14px 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:15px;line-height:22px;color:#d9d9d9;">
      Olá <strong>${name}</strong>, seu acesso administrativo foi criado.
    </p>

    ${credsBlock([
      { label: 'E-mail', value: email },
      { label: 'Senha temporária', value: randomPassword, mono: true }
    ])}

    <p class="p" style="margin:16px 0 0 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:14px;line-height:22px;color:#cfcfcf;">
      Recomendamos alterar a senha no primeiro acesso e manter a conta protegida:
    </p>
    ${tipsBlock()}
  `;

  return shell({
    title: 'Acesso Administrativo Criado',
    preheader: 'Seu login de administrador do TubeFlow está pronto para uso.',
    bodyHtml,
    cta: { href: `${BRAND.appUrl}/login`, label: 'Ir para o Login' }
  });
}

function companyAdminCredentials({ name, email, userPassword }) {
  const bodyHtml = `
    <p class="p" style="margin:0 0 14px 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:15px;line-height:22px;color:#d9d9d9;">
      Olá <strong>${name}</strong>, suas credenciais de administrador da empresa foram geradas.
    </p>

    ${credsBlock([
      { label: 'E-mail', value: email },
      { label: 'Senha', value: userPassword, mono: true }
    ])}

    <p class="p" style="margin:16px 0 0 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:14px;line-height:22px;color:#cfcfcf;">
      Para sua segurança, altere a senha após o primeiro login:
    </p>
    ${tipsBlock()}
  `;

  return shell({
    title: 'Credenciais de Administrador da Empresa',
    preheader: 'Acesse o TubeFlow com as credenciais abaixo.',
    bodyHtml,
    cta: { href: `${BRAND.appUrl}/login`, label: 'Acessar o TubeFlow' }
  });
}

function newAdminCredentials({ email, generatedPassword }) {
  const bodyHtml = `
    <p class="p" style="margin:0 0 14px 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:15px;line-height:22px;color:#d9d9d9;">
      Seu novo acesso administrativo ao <strong>TubeFlow</strong> foi configurado.
    </p>

    ${credsBlock([
      { label: 'E-mail', value: email },
      { label: 'Senha temporária', value: generatedPassword, mono: true }
    ])}

    <p class="p" style="margin:16px 0 0 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:14px;line-height:22px;color:#cfcfcf;">
      Recomendamos atualizar a senha assim que fizer login:
    </p>
    ${tipsBlock()}
  `;

  return shell({
    title: 'Novo Acesso Administrativo',
    preheader: 'Suas credenciais temporárias estão abaixo.',
    bodyHtml,
    cta: { href: `${BRAND.appUrl}/login`, label: 'Entrar no TubeFlow' }
  });
}

function passwordRecoveryCode({ code }) {
  const bodyHtml = `
    <p class="p" style="margin:0 0 14px 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:15px;line-height:22px;color:#d9d9d9;">
      Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para continuar:
    </p>

    <div style="margin:16px 0 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;font-size:24px;line-height:32px;letter-spacing:4px;color:#ffffff;font-weight:700;background:#1e1e1e;padding:12px 20px;border-radius:8px;text-align:center;">
      ${code}
    </div>

    <p class="p" style="margin:16px 0 0 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:14px;line-height:22px;color:#cfcfcf;">
      Se você não solicitou esta recuperação, ignore este e-mail.
    </p>
  `;

  return shell({
    title: 'Recuperação de Senha',
    preheader: 'Use o código abaixo para redefinir sua senha.',
    bodyHtml
  });
}

module.exports = {
  freelancerRegistration,
  adminRegistration,
  companyAdminCredentials,
  newAdminCredentials,
  passwordRecoveryCode
};
