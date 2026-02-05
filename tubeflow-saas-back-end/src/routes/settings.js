const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');

const mysqlPool = mysql.createPool(config.dbConfig.mysql);
const getConnection = async () => {
  return await mysqlPool.getConnection();
};

router.get('/settings', async (req, res) => {
  let client;
  try {
    const companyId = req.query.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();
    const [rows] = await client.execute(
      'SELECT api_key, sender_phone, message_template, auto_notify, whatsapp_api_url FROM settings WHERE company_id = ? LIMIT 1',
      [companyId]
    );
    if (rows.length === 0) {
      return res.json({
        api_key: '',
        sender_phone: '',
        message_template: 'Olá, {name}! Um novo vídeo foi atribuído a você: {titulo}',
        auto_notify: false,
        whatsapp_api_url: ''
      });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      message: 'Erro ao buscar configurações.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

router.post('/settings', async (req, res) => {
  let client;
  try {
    const { companyId, apiKey, senderPhone, messageTemplate, autoNotify, whatsappApiUrl } = req.body;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();
    const [checkRows] = await client.execute(
      'SELECT company_id FROM settings WHERE company_id = ? LIMIT 1',
      [companyId]
    );
    const safeMessageTemplate = (messageTemplate || '')
      .replace(/\r\n|\r|\n/g, '\\n')
      .substring(0, 500);
    const safeWhatsappApiUrl = (whatsappApiUrl || '').substring(0, 255);
    if (checkRows.length === 0) {
      await client.execute(
        'INSERT INTO settings (company_id, api_key, sender_phone, message_template, auto_notify, whatsapp_api_url) VALUES (?, ?, ?, ?, ?, ?)',
        [companyId, apiKey || '', senderPhone || '', safeMessageTemplate, autoNotify, safeWhatsappApiUrl]
      );
    } else {
      await client.execute(
        'UPDATE settings SET api_key = ?, sender_phone = ?, message_template = ?, auto_notify = ?, whatsapp_api_url = ?, updated_at = NOW() WHERE company_id = ?',
        [apiKey || '', senderPhone || '', safeMessageTemplate, autoNotify, safeWhatsappApiUrl, companyId]
      );
    }
    res.json({
      message: 'Configurações atualizadas com sucesso.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      message: 'Erro ao atualizar configurações.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
