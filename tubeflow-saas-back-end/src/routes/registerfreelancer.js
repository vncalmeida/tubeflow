const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const axios = require('axios');
const createTransport = require('../utils/mail');
const emailTemplates = require('../utils/emailTemplates');
const { getLogger } = require('../utils/logger');

const router = express.Router();

const transporter = createTransport();
const freelancerLogger = getLogger('freelancers');

const ALLOWED_ROLES = ['roteirista', 'editor', 'narrador', 'thumb_maker'];

const normalizeRoles = (roles = []) =>
  roles
    .map((role) => String(role).toLowerCase().trim().replace(/\s+/g, '_'))
    .filter(Boolean);

const formatRoleList = (raw) =>
  raw
    ? raw.split(',').map((role) => (role === 'thumb maker' ? 'thumb_maker' : role))
    : [];

const releaseConnection = async (connection) => {
  if (!connection) return;
  try {
    await connection.release();
  } catch (error) {
    freelancerLogger.error({ error: error.message }, 'Erro ao liberar conexão de freelancer');
  }
};

/**
 * Envia mensagem de boas-vindas via WhatsApp para novo freelancer
 * @param {object} connection - Conexão do banco de dados
 * @param {string} companyId - ID da empresa
 * @param {string} freelancerName - Nome do freelancer
 * @param {string} freelancerPhone - Telefone do freelancer
 * @param {string} email - Email do freelancer
 * @param {string} password - Senha gerada para o freelancer
 * @returns {Promise<boolean>} - true se enviado com sucesso, false caso contrário
 */
async function sendWelcomeWhatsAppMessage(connection, companyId, freelancerName, freelancerPhone, email, password) {
  try {
    freelancerLogger.info('Iniciando envio de boas-vindas via WhatsApp', {
      companyId,
      freelancerName,
      phone: freelancerPhone
    });

    // Buscar configurações da empresa
    let settingsRows;
    try {
      const [rows] = await connection.query(
        'SELECT api_key, sender_phone, welcome_template, whatsapp_api_url FROM settings WHERE company_id = ?',
        [companyId]
      );
      settingsRows = rows;
    } catch (error) {
      const isMissingColumn = error?.code === 'ER_BAD_FIELD_ERROR' ||
        /Unknown column/i.test(error?.message || '');
      if (!isMissingColumn) {
        throw error;
      }
      freelancerLogger.warn('Coluna welcome_template ausente; usando template padrao', {
        companyId,
        error: error?.message
      });
      const [rows] = await connection.query(
        'SELECT api_key, sender_phone, whatsapp_api_url FROM settings WHERE company_id = ?',
        [companyId]
      );
      settingsRows = rows;
    }

    if (settingsRows.length === 0 || !settingsRows[0].api_key || !settingsRows[0].sender_phone) {
      freelancerLogger.warn('Configurações de WhatsApp não encontradas ou incompletas', { companyId });
      return false;
    }

    const settings = settingsRows[0];

    // Template de boas-vindas (com fallback)
    const welcomeTemplate = settings.welcome_template ||
      'Olá, {name}! Seja bem-vindo(a) ao TubeFlow! Suas credenciais de acesso são:\n\nEmail: {email}\nSenha: {password}\n\nFaça login em https://tubeflow10x.com para começar!';

    const messageBody = welcomeTemplate
      .replace(/{name}/g, freelancerName)
      .replace(/{email}/g, email)
      .replace(/{password}/g, password);

    // Normalizar número de telefone
    const normalizePhoneNumber = (phone) => {
      const cleaned = (phone || '').replace(/\D/g, '');
      return cleaned.length >= 12 ? cleaned : `55${cleaned}`;
    };

    const formattedPhone = normalizePhoneNumber(freelancerPhone);

    freelancerLogger.info('Enviando mensagem de boas-vindas via WhatsApp', {
      companyId,
      freelancerName,
      phone: formattedPhone
    });

    const formattedSenderPhone = normalizePhoneNumber(settings.sender_phone);
    const payload = {
      apikey: settings.api_key,
      phone_number: formattedSenderPhone,
      contact_phone_number: formattedPhone,
      message_type: 'text',
      message_body: messageBody.trim(),
      check_status: 0
    };

    const whatsappApiUrl = settings.whatsapp_api_url ||
      process.env.WHATSAPP_API_URL ||
      'https://app.whatsgw.com.br/api/WhatsGw/Send';

    const response = await axios.post(
      whatsappApiUrl,
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    if (response.data && response.data.status === 'error') {
      throw new Error(response.data.message || 'Erro na API WhatsGW');
    }

    freelancerLogger.info('Mensagem de boas-vindas enviada com sucesso via WhatsApp', {
      companyId,
      freelancerName
    });

    return true;
  } catch (error) {
    if (error.response) {
      freelancerLogger.error('Erro na API WhatsApp (boas-vindas)', {
        companyId,
        freelancerName,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else {
      freelancerLogger.error('Erro ao enviar mensagem de boas-vindas via WhatsApp', {
        companyId,
        freelancerName,
        error: error.message,
        stack: error.stack
      });
    }
    return false;
  }
}

router.post('/register-freelancer', async (req, res) => {
  const { name, email, roles, phone } = req.body;
  const companyId = req.headers['company-id'];
  const requestId = req.requestId;
  let connection;

  if (!companyId) {
    freelancerLogger.warn({ requestId }, 'Cadastro de freelancer sem companyId');
    return res.status(400).json({
      message: 'Company ID é obrigatório.',
      errorCode: 'MISSING_COMPANY_ID'
    });
  }

  if (!name || !email || !Array.isArray(roles) || roles.length === 0 || !phone) {
    freelancerLogger.warn({ requestId, companyId, email }, 'Cadastro de freelancer com campos ausentes');
    return res.status(400).json({
      message: 'Nome, e-mail, funções e telefone são obrigatórios.',
      requiredFields: ['name', 'email', 'roles', 'phone'],
      errorCode: 'MISSING_REQUIRED_FIELDS'
    });
  }

  const normalizedRoles = normalizeRoles(roles);
  const invalidRoles = normalizedRoles.filter((role) => !ALLOWED_ROLES.includes(role));

  if (invalidRoles.length) {
    freelancerLogger.warn({ requestId, companyId, email, invalidRoles }, 'Cadastro de freelancer com roles inválidas');
    return res.status(400).json({
      message: 'Funções inválidas.',
      allowedRoles: ALLOWED_ROLES.map((role) => role.replace(/_/g, ' ')),
      receivedRoles: roles,
      invalidRoles,
      errorCode: 'INVALID_ROLE'
    });
  }

  const primaryRole = normalizedRoles[0];

  try {
    freelancerLogger.info({ requestId, companyId, email, roles: normalizedRoles }, 'Iniciando cadastro de freelancer');
    connection = await req.db.getConnection();

    const [emailRows] = await connection.query(
      'SELECT id FROM freelancers WHERE email = ? AND company_id = ?',
      [email, companyId]
    );

    if (emailRows.length > 0) {
      freelancerLogger.warn({ requestId, companyId, email }, 'Cadastro de freelancer bloqueado por e-mail duplicado');
      return res.status(409).json({
        message: 'E-mail já cadastrado para esta empresa.',
        errorCode: 'DUPLICATE_EMAIL'
      });
    }

    const generatedPassword = crypto.randomBytes(10).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    const insertQuery = `
      INSERT INTO freelancers (
        name,
        email,
        role,
        phone,
        password,
        company_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [insertResult] = await connection.query(insertQuery, [
      name,
      email,
      primaryRole,
      phone,
      hashedPassword,
      companyId
    ]);

    const freelancerId = insertResult.insertId;

    for (const role of normalizedRoles) {
      await connection.query(
        'INSERT INTO freelancer_roles (freelancer_id, role) VALUES (?, ?)',
        [freelancerId, role]
      );
    }

    let emailSent = false;
    let whatsappSent = false;

    // Tentar enviar via WhatsApp primeiro (nova funcionalidade)
    try {
      whatsappSent = await sendWelcomeWhatsAppMessage(
        connection,
        companyId,
        name,
        phone,
        email,
        generatedPassword
      );
    } catch (whatsappError) {
      freelancerLogger.error(
        { requestId, companyId, email, error: whatsappError.message },
        'Erro ao enviar WhatsApp de boas-vindas para freelancer'
      );
    }

    // Enviar email como fallback ou complemento (dependendo da configuração)
    try {
      await transporter.sendMail({
        from: createTransport.FROM_EMAIL,
        to: email,
        subject: 'Cadastro Realizado - TubeFlow',
        html: emailTemplates.freelancerRegistration({ email, generatedPassword })
      });
      emailSent = true;
    } catch (emailError) {
      freelancerLogger.error(
        { requestId, companyId, email, error: emailError.message },
        'Erro ao enviar e-mail para freelancer'
      );
    }

    freelancerLogger.info(
      { requestId, companyId, email, freelancerId, roles: normalizedRoles, emailSent, whatsappSent },
      'Freelancer cadastrado com sucesso'
    );

    // Definir mensagem de resposta baseada no sucesso do envio
    let responseMessage = 'Freelancer cadastrado com sucesso.';
    if (!whatsappSent && !emailSent) {
      responseMessage = 'Freelancer cadastrado, porém não foi possível enviar as credenciais via WhatsApp ou e-mail.';
    } else if (!whatsappSent && emailSent) {
      responseMessage = 'Freelancer cadastrado. Credenciais enviadas por e-mail (WhatsApp indisponível).';
    } else if (whatsappSent && !emailSent) {
      responseMessage = 'Freelancer cadastrado. Credenciais enviadas via WhatsApp (e-mail indisponível).';
    } else {
      responseMessage = 'Freelancer cadastrado. Credenciais enviadas via WhatsApp e e-mail.';
    }

    return res.status(201).json({
      message: responseMessage,
      data: {
        id: freelancerId,
        roles: normalizedRoles,
        createdAt: new Date().toISOString()
      },
      emailStatus: emailSent ? 'sent' : 'failed',
      whatsappStatus: whatsappSent ? 'sent' : 'failed'
    });
  } catch (error) {
    freelancerLogger.error(
      {
        requestId,
        companyId,
        email,
        error: error.message,
        stack: error.stack,
        roles: normalizedRoles
      },
      'Erro completo no registro de freelancer'
    );

    return res.status(500).json({
      message: 'Erro no processo de cadastro.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      errorCode: 'REGISTRATION_FAILURE'
    });
  } finally {
    await releaseConnection(connection);
  }
});

router.get('/freelancers', async (req, res) => {
  const requestId = req.requestId;
  const companyId = req.headers['company-id'];
  let connection;

  if (!companyId) {
    freelancerLogger.warn({ requestId }, 'Listagem de freelancers sem companyId');
    return res.status(400).json({ message: 'Company ID é obrigatório.' });
  }

  try {
    connection = await req.db.getConnection();

    await connection.query(
      'UPDATE freelancers SET role = "thumb_maker" WHERE role = "thumb maker" AND company_id = ?',
      [companyId]
    );
    await connection.query(
      `UPDATE freelancer_roles fr
         JOIN freelancers f ON fr.freelancer_id = f.id
         SET fr.role = "thumb_maker"
       WHERE fr.role = "thumb maker" AND f.company_id = ?`,
      [companyId]
    );

    const [rows] = await connection.query(
      `SELECT
          f.id,
          f.name,
          f.email,
          f.phone,
          f.created_at AS createdAt,
          f.updated_at AS updatedAt,
          GROUP_CONCAT(fr.role) AS roles
       FROM freelancers f
       LEFT JOIN freelancer_roles fr ON fr.freelancer_id = f.id
       WHERE f.company_id = ?
       GROUP BY f.id`,
      [companyId]
    );

    const data = rows.map((freelancer) => ({
      ...freelancer,
      roles: formatRoleList(freelancer.roles)
    }));

    freelancerLogger.info({ requestId, companyId, total: data.length }, 'Lista de freelancers retornada');

    return res.json({
      message: 'Lista de freelancers obtida com sucesso.',
      data
    });
  } catch (error) {
    freelancerLogger.error({ requestId, companyId, error: error.message }, 'Erro ao buscar freelancers');
    return res.status(500).json({
      message: 'Erro ao buscar a lista de freelancers.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await releaseConnection(connection);
  }
});

router.put('/freelancers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, roles } = req.body;
  const companyId = req.headers['company-id'];
  const requestId = req.requestId;
  let connection;

  if (!companyId) {
    freelancerLogger.warn({ requestId, id }, 'Atualização de freelancer sem companyId');
    return res.status(400).json({ message: 'Company ID é obrigatório.' });
  }

  if (!name || !email || !Array.isArray(roles) || roles.length === 0) {
    freelancerLogger.warn({ requestId, companyId, id }, 'Atualização de freelancer com campos ausentes');
    return res.status(400).json({ message: 'Nome, e-mail e funções são obrigatórios.' });
  }

  const normalizedRoles = normalizeRoles(roles);
  const invalidRoles = normalizedRoles.filter((role) => !ALLOWED_ROLES.includes(role));

  if (invalidRoles.length) {
    freelancerLogger.warn({ requestId, companyId, id, invalidRoles }, 'Atualização de freelancer com roles inválidas');
    return res.status(400).json({ message: 'Funções inválidas.' });
  }

  try {
    connection = await req.db.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `UPDATE freelancers
         SET name = ?, email = ?, phone = ?, role = ?
       WHERE id = ? AND company_id = ?`,
      [name, email, phone, normalizedRoles[0], id, companyId]
    );

    await connection.query('DELETE FROM freelancer_roles WHERE freelancer_id = ?', [id]);

    for (const role of normalizedRoles) {
      await connection.query(
        'INSERT INTO freelancer_roles (freelancer_id, role) VALUES (?, ?)',
        [id, role]
      );
    }

    await connection.commit();

    freelancerLogger.info({ requestId, companyId, id, roles: normalizedRoles }, 'Freelancer atualizado com sucesso');

    return res.json({
      message: 'Freelancer atualizado com sucesso.',
      data: { id, roles: normalizedRoles }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    freelancerLogger.error({ requestId, companyId, id, error: error.message }, 'Erro ao atualizar freelancer');
    return res.status(500).json({
      message: 'Erro ao atualizar freelancer.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await releaseConnection(connection);
  }
});

router.delete('/freelancers/:id', async (req, res) => {
  const { id } = req.params;
  const companyId = req.headers['company-id'];
  const requestId = req.requestId;
  let connection;

  if (!companyId) {
    freelancerLogger.warn({ requestId, id }, 'Exclusão de freelancer sem companyId');
    return res.status(400).json({ message: 'Company ID é obrigatório.' });
  }

  try {
    connection = await req.db.getConnection();
    await connection.beginTransaction();

    await connection.query('DELETE FROM freelancer_roles WHERE freelancer_id = ?', [id]);
    const [result] = await connection.query(
      'DELETE FROM freelancers WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      freelancerLogger.warn({ requestId, companyId, id }, 'Exclusão de freelancer não encontrado');
      return res.status(404).json({ message: 'Freelancer não encontrado.' });
    }

    freelancerLogger.info({ requestId, companyId, id }, 'Freelancer excluído com sucesso');

    return res.json({ message: 'Freelancer excluído com sucesso.' });
  } catch (error) {
    if (connection) await connection.rollback();
    freelancerLogger.error({ requestId, companyId, id, error: error.message }, 'Erro ao excluir freelancer');
    return res.status(500).json({
      message: 'Erro ao excluir freelancer.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await releaseConnection(connection);
  }
});

module.exports = router;
