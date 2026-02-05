const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const createTransport = require('../utils/mail');
const emailTemplates = require('../utils/emailTemplates');
const mysql = require('mysql2/promise');
const { Pool: PgPool } = require('pg');
const config = require('../config');
const router = express.Router();

const dbType = config.dbConfig.dbType;
const mysqlPool = mysql.createPool(config.dbConfig.mysql);
const pgPool = new PgPool(config.dbConfig.postgres);

const getConnection = async () => {
  if (dbType === 'postgres') {
    return await pgPool.connect();
  }
  return await mysqlPool.getConnection();
};

const transporter = createTransport();

function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  return Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map(x => chars[x % chars.length])
    .join('');
}

router.get('/administrators', async (req, res) => {
  const companyId = req.headers['company-id'];
  let client;
  if (!companyId) {
    return res.status(400).json({
      message: 'Company ID é obrigatório.',
      errorCode: 'MISSING_COMPANY_ID'
    });
  }
  try {
    client = await getConnection();
    const query = dbType === 'postgres'
      ? `SELECT id, name, email, created_at AS "createdAt", updated_at AS "updatedAt" FROM users WHERE role = 'admin' AND company_id = $1`
      : `SELECT id, name, email, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE role = 'admin' AND company_id = ?`;
    const params = [companyId];
    const result = await client.query(query, params);
    const rows = dbType === 'postgres' ? result.rows : result[0];
    res.json({
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Erro ao buscar administradores:', {
      error: error.message,
      companyId: companyId.slice(0, 8)
    });
    res.status(500).json({
      message: 'Erro ao buscar administradores.',
      errorCode: 'ADMIN_FETCH_ERROR'
    });
  } finally {
    if (client) client.release();
  }
});

router.post('/register-administrator', async (req, res) => {
  const { name, email } = req.body;
  const companyId = req.headers['company-id'];
  let client;
  if (!companyId) {
    return res.status(400).json({
      message: 'Company ID é obrigatório.',
      errorCode: 'MISSING_COMPANY_ID'
    });
  }
  if (!name || !email) {
    return res.status(400).json({
      message: 'Nome e e-mail são obrigatórios.',
      errorCode: 'MISSING_REQUIRED_FIELDS'
    });
  }
  try {
    client = await getConnection();
    if (dbType === 'postgres') {
      await client.query('BEGIN');
    } else {
      await client.beginTransaction();
    }
    const emailCheckQuery = dbType === 'postgres'
      ? `SELECT id FROM users WHERE email = $1 AND company_id = $2`
      : `SELECT id FROM users WHERE email = ? AND company_id = ?`;
    const emailCheckParams = [email, companyId];
    const emailCheckResult = await client.query(emailCheckQuery, emailCheckParams);
    const emailExists = dbType === 'postgres'
      ? emailCheckResult.rowCount > 0
      : emailCheckResult[0].length > 0;
    if (emailExists) {
      if (dbType === 'postgres') {
        await client.query('ROLLBACK');
      } else {
        await client.rollback();
      }
      return res.status(409).json({
        message: 'E-mail já cadastrado para esta empresa.',
        errorCode: 'DUPLICATE_EMAIL'
      });
    }
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 12);
    const insertQuery = dbType === 'postgres'
      ? `INSERT INTO users (name, email, password, role, company_id, created_at, updated_at) VALUES ($1, $2, $3, 'admin', $4, NOW(), NOW()) RETURNING id`
      : `INSERT INTO users (name, email, password, role, company_id, created_at, updated_at) VALUES (?, ?, ?, 'admin', ?, NOW(), NOW())`;
    const insertParams = [name, email, hashedPassword, companyId];
    const insertResult = await client.query(insertQuery, insertParams);
    const insertedId = dbType === 'postgres'
      ? insertResult.rows[0].id
      : insertResult[0].insertId;
    const mailOptions = {
      from: `"Equipe TubeFlow" <${createTransport.FROM_EMAIL}>`,
      to: email,
      subject: 'Cadastro de Administrador - TubeFlow',
      html: emailTemplates.adminRegistration({ name, email, randomPassword })
    };
    await transporter.sendMail(mailOptions);
    if (dbType === 'postgres') {
      await client.query('COMMIT');
    } else {
      await client.commit();
    }
    res.status(201).json({
      message: 'Administrador cadastrado com sucesso.',
      data: {
        id: insertedId,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    if (client) {
      if (dbType === 'postgres') {
        await client.query('ROLLBACK');
      } else {
        await client.rollback();
      }
    }
    console.error('Erro ao cadastrar administrador:', {
      error: error.message,
      params: { name, email: email.slice(0, 15) },
      companyId: companyId.slice(0, 8)
    });
    res.status(500).json({
      message: 'Erro ao cadastrar administrador.',
      errorCode: 'ADMIN_CREATION_ERROR'
    });
  } finally {
    if (client) client.release();
  }
});

router.put('/administrators/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const companyId = req.headers['company-id'];
  let client;
  if (!companyId) {
    return res.status(400).json({
      message: 'Company ID é obrigatório.',
      errorCode: 'MISSING_COMPANY_ID'
    });
  }
  try {
    client = await getConnection();
    const updateQuery = dbType === 'postgres'
      ? `UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 AND role = 'admin' AND company_id = $4`
      : `UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ? AND role = 'admin' AND company_id = ?`;
    const updateParams = [name, email, id, companyId];
    const updateResult = await client.query(updateQuery, updateParams);
    const affectedRows = dbType === 'postgres'
      ? updateResult.rowCount
      : updateResult[0].affectedRows;
    if (affectedRows === 0) {
      return res.status(404).json({
        message: 'Administrador não encontrado.',
        errorCode: 'ADMIN_NOT_FOUND'
      });
    }
    res.json({
      message: 'Administrador atualizado com sucesso.',
      data: { id, name, email }
    });
  } catch (error) {
    console.error('Erro ao atualizar administrador:', {
      error: error.message,
      adminId: id,
      companyId: companyId.slice(0, 8)
    });
    res.status(500).json({
      message: 'Erro ao atualizar administrador.',
      errorCode: 'ADMIN_UPDATE_ERROR'
    });
  } finally {
    if (client) client.release();
  }
});

router.delete('/administrators/:id', async (req, res) => {
  const { id } = req.params;
  const companyId = req.headers['company-id'];
  let client;
  if (!companyId) {
    return res.status(400).json({
      message: 'Company ID é obrigatório.',
      errorCode: 'MISSING_COMPANY_ID'
    });
  }
  try {
    client = await getConnection();
    const deleteQuery = dbType === 'postgres'
      ? `DELETE FROM users WHERE id = $1 AND role = 'admin' AND company_id = $2`
      : `DELETE FROM users WHERE id = ? AND role = 'admin' AND company_id = ?`;
    const deleteParams = [id, companyId];
    const deleteResult = await client.query(deleteQuery, deleteParams);
    const deletedCount = dbType === 'postgres'
      ? deleteResult.rowCount
      : deleteResult[0].affectedRows;
    if (deletedCount === 0) {
      return res.status(404).json({
        message: 'Administrador não encontrado.',
        errorCode: 'ADMIN_NOT_FOUND'
      });
    }
    res.json({
      message: 'Administrador excluído com sucesso.',
      deletedId: id
    });
  } catch (error) {
    console.error('Erro ao excluir administrador:', {
      error: error.message,
      adminId: id,
      companyId: companyId.slice(0, 8)
    });
    res.status(500).json({
      message: 'Erro ao excluir administrador.',
      errorCode: 'ADMIN_DELETION_ERROR'
    });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;