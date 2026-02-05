const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { Pool: PgPool } = require('pg');
const createTransport = require('../utils/mail');
const emailTemplates = require('../utils/emailTemplates');
const config = require('../config');
const { getLogger } = require('../utils/logger');

const router = express.Router();

const secretKey = config.JWT_SECRET;
const dbType = config.dbConfig.dbType;
const authLogger = getLogger('auth');

const mysqlPool = mysql.createPool(config.dbConfig.mysql);
const pgPool = new PgPool(config.dbConfig.postgres);
const transporter = createTransport();

const resetCodes = new Map();

const getConnection = async () => {
  if (dbType === 'postgres') {
    return pgPool.connect();
  }
  return mysqlPool.getConnection();
};

const runQuery = async (connection, query, params = []) => {
  if (dbType === 'postgres') {
    const result = await connection.query(query, params);
    return result.rows;
  }
  const [rows] = await connection.query(query, params);
  return rows;
};

const releaseConnection = async (connection) => {
  if (!connection) return;
  try {
    await connection.release();
  } catch (error) {
    authLogger.error({ error: error.message }, 'Erro ao liberar conexão');
  }
};

const normalizeRoles = (value) => {
  if (!Array.isArray(value)) {
    return value ? [value] : [];
  }
  return value;
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const requestId = req.requestId;

  if (!email || !password) {
    authLogger.warn({ requestId, email }, 'Login attempt missing credentials');
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  let connection;
  try {
    authLogger.info({ requestId, email }, 'Login attempt received');
    connection = await getConnection();

    let rows = [];
    let isFreelancer = false;
    let userType = 'user';

    if (dbType === 'postgres') {
      rows = (await connection.query('SELECT * FROM users WHERE email = $1', [email])).rows;
    } else {
      [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    }

    if (!rows.length) {
      const freelancerQuery = dbType === 'postgres'
        ? 'SELECT * FROM freelancers WHERE email = $1'
        : 'SELECT * FROM freelancers WHERE email = ?';
      const freelancerRows = await runQuery(connection, freelancerQuery, [email]);
      if (!freelancerRows.length) {
        authLogger.warn({ requestId, email }, 'Login failed: user not found');
        return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
      }
      rows = freelancerRows;
      isFreelancer = true;
      userType = 'freelancer';
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      authLogger.warn({ requestId, email, userId: user.id }, 'Login failed: invalid password');
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    let roles = normalizeRoles(user.role);
    if (isFreelancer) {
      const roleQuery = dbType === 'postgres'
        ? 'SELECT role FROM freelancer_roles WHERE freelancer_id = $1'
        : 'SELECT role FROM freelancer_roles WHERE freelancer_id = ?';
      const freelancerRoles = await runQuery(connection, roleQuery, [user.id]);
      roles = freelancerRoles.map((r) => r.role);
    }

    let company = null;
    let subscriptionValid = true;

    if (userType === 'user') {
      const companyQuery = dbType === 'postgres'
        ? 'SELECT id, active, subscription_start, subscription_end FROM companies WHERE id = $1'
        : 'SELECT id, active, subscription_start, subscription_end FROM companies WHERE id = ?';
      const companyRows = await runQuery(connection, companyQuery, [user.company_id]);

      if (!companyRows.length) {
        authLogger.warn({ requestId, email, userId: user.id }, 'Login failed: user without valid company');
        return res.status(403).json({ message: 'Usuário não vinculado a uma empresa válida.' });
      }

      company = companyRows[0];
      const hasValidSubscription = () => {
        if (!company.active) return false;
        if (!company.subscription_start || !company.subscription_end) return false;
        return new Date(company.subscription_end) >= new Date();
      };
      subscriptionValid = hasValidSubscription();

      if (!subscriptionValid) {
        const message = !company.active ||
          !company.subscription_start ||
          !company.subscription_end
          ? 'Empresa não possui um plano ativo'
          : 'Assinatura da empresa expirada';

        authLogger.warn({
          requestId,
          email,
          userId: user.id,
          companyId: user.company_id
        }, 'Login failed: inactive subscription');

        return res.status(403).json({ message });
      }
    }

    const tokenPayload = {
      id: user.id,
      role: user.role,
      roles,
      isFreelancer,
      companyId: user.company_id || null
    };

    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

    authLogger.info({
      requestId,
      email,
      userId: user.id,
      companyId: user.company_id || null,
      isFreelancer
    }, 'Login succeeded');

    return res.json({
      message: 'Login bem-sucedido.',
      token,
      role: user.role,
      roles,
      isFreelancer,
      id: user.id,
      companyId: user.company_id || null,
      companyStatus: {
        active: company?.active || false,
        subscriptionValid
      }
    });
  } catch (error) {
    authLogger.error({ requestId, email, error: error.message }, 'Erro no login');
    return res.status(500).json({ message: 'Erro ao processar o login.' });
  } finally {
    await releaseConnection(connection);
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const requestId = req.requestId;

  if (!email) {
    authLogger.warn({ requestId }, 'Forgot password without email');
    return res.status(400).json({ message: 'E-mail é obrigatório.' });
  }

  let connection;
  try {
    authLogger.info({ requestId, email }, 'Forgot password requested');
    connection = await getConnection();

    const lookupQuery = dbType === 'postgres'
      ? `
        SELECT id, email FROM users WHERE email = $1
        UNION
        SELECT id, email FROM freelancers WHERE email = $1
      `
      : `
        SELECT id, email FROM users WHERE email = ?
        UNION
        SELECT id, email FROM freelancers WHERE email = ?
      `;

    const lookupParams = dbType === 'postgres' ? [email] : [email, email];
    const rows = await runQuery(connection, lookupQuery, lookupParams);

    if (!rows.length) {
      authLogger.warn({ requestId, email }, 'Forgot password for unknown email');
      return res.status(404).json({ message: 'E-mail não encontrado.' });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    resetCodes.set(email, {
      code,
      expiresAt: Date.now() + 30 * 60 * 1000
    });

    await transporter.sendMail({
      from: createTransport.FROM_EMAIL,
      to: email,
      subject: 'Código de Recuperação de Senha',
      text: `Seu código de recuperação é: ${code}`,
      html: emailTemplates.passwordRecoveryCode({ code })
    });

    authLogger.info({ requestId, email }, 'Password recovery email sent');
    return res.json({ message: 'Código de recuperação enviado para o e-mail.' });
  } catch (error) {
    authLogger.error({ requestId, email, error: error.message }, 'Erro ao enviar código de recuperação');
    return res.status(500).json({ message: 'Erro ao enviar código de recuperação.' });
  } finally {
    await releaseConnection(connection);
  }
});

router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const requestId = req.requestId;

  if (!email || !code) {
    authLogger.warn({ requestId, email }, 'Verify code missing fields');
    return res.status(400).json({ message: 'E-mail e código são obrigatórios.' });
  }

  const stored = resetCodes.get(email);
  if (stored && stored.code === code && stored.expiresAt > Date.now()) {
    authLogger.info({ requestId, email }, 'Reset code verified');
    return res.json({ message: 'Código verificado com sucesso.' });
  }

  authLogger.warn({ requestId, email }, 'Reset code invalid or expired');
  return res.status(400).json({ message: 'Código inválido ou expirado.' });
});

router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  const requestId = req.requestId;

  if (!email || !code || !newPassword) {
    authLogger.warn({ requestId, email }, 'Reset password missing fields');
    return res.status(400).json({ message: 'E-mail, código e nova senha são obrigatórios.' });
  }

  const stored = resetCodes.get(email);
  if (!stored || stored.code !== code || stored.expiresAt <= Date.now()) {
    authLogger.warn({ requestId, email }, 'Reset password invalid or expired code');
    return res.status(400).json({ message: 'Código inválido ou expirado.' });
  }

  let connection;
  try {
    authLogger.info({ requestId, email }, 'Reset password confirmed');
    connection = await getConnection();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (dbType === 'postgres') {
      await connection.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
      await connection.query('UPDATE freelancers SET password = $1 WHERE email = $2', [hashedPassword, email]);
    } else {
      await connection.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
      await connection.query('UPDATE freelancers SET password = ? WHERE email = ?', [hashedPassword, email]);
    }

    resetCodes.delete(email);
    authLogger.info({ requestId, email }, 'Password reset completed');
    return res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    authLogger.error({ requestId, email, error: error.message }, 'Erro ao resetar senha');
    return res.status(500).json({ message: 'Erro ao resetar a senha.' });
  } finally {
    await releaseConnection(connection);
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const requestId = req.requestId;

  if (!name || !email || !password) {
    authLogger.warn({ requestId, email }, 'Register user missing fields');
    return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
  }

  let connection;
  try {
    authLogger.info({ requestId, email }, 'Register user started');
    connection = await getConnection();

    const existingUsers = await runQuery(
      connection,
      dbType === 'postgres'
        ? 'SELECT id FROM users WHERE email = $1'
        : 'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length) {
      authLogger.warn({ requestId, email }, 'Register user failed: duplicate email');
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalRole = role || 'user';

    if (dbType === 'postgres') {
      await connection.query(
        'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
        [name, email, hashedPassword, finalRole]
      );
    } else {
      await connection.query(
        'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [name, email, hashedPassword, finalRole]
      );
    }

    authLogger.info({ requestId, email }, 'Register user succeeded');
    return res.json({ message: 'Usuário registrado com sucesso.' });
  } catch (error) {
    authLogger.error({ requestId, email, error: error.message }, 'Erro ao registrar usuário');
    return res.status(500).json({ message: 'Erro ao registrar o usuário.' });
  } finally {
    await releaseConnection(connection);
  }
});

module.exports = router;
