const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../config');

const adminRouter = express.Router();
const publicRouter = express.Router();

const pool = mysql.createPool(config.dbConfig.mysql);
const getConnection = async () => pool.getConnection();

const fetchConfig = async () => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.query(
      'SELECT config FROM welcome_settings WHERE id = 1'
    );
    if (rows.length === 0) {
      const defaultConfig = {};
      await connection.query(
        'INSERT INTO welcome_settings (id, config, created_at, updated_at) VALUES (1, ?, NOW(), NOW())',
        [JSON.stringify(defaultConfig)]
      );
      return defaultConfig;
    }
    return JSON.parse(rows[0].config || '{}');
  } finally {
    if (connection) connection.release();
  }
};

const sendConfig = async (req, res) => {
  try {
    const configData = await fetchConfig();
    res.json(configData);
  } catch (error) {
    console.error('Erro ao buscar configurações de boas-vindas:', error);
    res
      .status(500)
      .json({ message: 'Erro ao buscar configurações de boas-vindas.' });
  }
};

adminRouter.get('/welcome-settings', sendConfig);
publicRouter.get('/welcome-settings', sendConfig);

adminRouter.put('/welcome-settings', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  if (!decoded.roles?.includes('admin')) {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  const rawConfig = req.body || {};
  const newConfig = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
  let connection;
  try {
    connection = await getConnection();
    await connection.query(
      'INSERT INTO welcome_settings (id, config, created_at, updated_at) VALUES (1, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE config = ?, updated_at = NOW()',
      [JSON.stringify(newConfig), JSON.stringify(newConfig)]
    );
    res.json({ message: 'Configuração atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar configurações de boas-vindas:', error);
    res
      .status(500)
      .json({ message: 'Erro ao atualizar configurações de boas-vindas.' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = { admin: adminRouter, public: publicRouter };

