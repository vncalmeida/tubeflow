const express = require('express');
const router = express.Router();
const axios = require('axios');
const mysql = require('mysql2/promise');
const { Pool: PgPool } = require('pg');
const config = require('../config');
const { getLogger } = require('../utils/logger');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = config;
const { VIDEO_STATUSES } = require('../constants/videoStatus');

const dbType = config.dbConfig.dbType;
const mysqlPool = mysql.createPool(config.dbConfig.mysql);
const pgPool = new PgPool(config.dbConfig.postgres);

const whatsappLogger = getLogger('whatsapp');
const videoLogger = getLogger('videos');

const getConnection = async () => {
  if (dbType === 'postgres') {
    return await pgPool.connect();
  }
  return await mysqlPool.getConnection();
};

// Middleware de autenticação alternativa baseada em companyId e parâmetros de usuário
router.use((req, res, next) => {
  // Simular usuário baseado em parâmetros de query para manter compatibilidade
  const { userId, userRole, userRoles, isAdmin, isFreelancer } = req.query;
  
  if (userId) {
    // Se parâmetros de usuário foram fornecidos, criar objeto user simulado
    req.user = {
      id: userId,
      role: userRole || 'user',
      roles: userRoles ? userRoles.split(',') : []
    };
  } else {
    // Se não houver parâmetros de usuário, assumir acesso básico
    req.user = { id: null, role: 'user', roles: [] };
  }
  
  next();
});

const normalizePhoneNumber = (phone) => {
  const cleaned = (phone || '').replace(/\D/g, '');
  return cleaned.length >= 12 ? cleaned : `55${cleaned}`;
};

const formatQuery = (query) => dbType === 'postgres' ? query : query.replace(/\$\d+/g, '?');

const prepareQuery = (query, params = []) => {
  if (dbType === 'postgres') {
    return { query, params };
  }
  const newParams = [];
  const newQuery = query.replace(/\$([0-9]+)/g, (_, num) => {
    newParams.push(params[parseInt(num, 10) - 1]);
    return '?';
  });
  return { query: newQuery, params: newParams };
};

const executeQuery = async (client, query, params) => {
  const { query: formatted, params: boundParams } = prepareQuery(query, params);
  const result = await client.query(formatted, boundParams);
  if (dbType === 'postgres') {
    return { rows: result.rows, rowCount: result.rowCount };
  }
  const [rows] = result;
  const rowCount = Array.isArray(rows) ? rows.length : rows.affectedRows;
  return { rows, rowCount };
};

const validateFreelancerExists = async (client, freelancerId, companyId) => {
  const { rowCount } = await executeQuery(
    client,
    'SELECT id FROM freelancers WHERE id = $1 AND company_id = $2',
    [freelancerId, companyId]
  );
  return rowCount > 0;
};

const getRoleFlags = (user, queryParams = {}) => {
  const base = user?.role ? [user.role] : [];
  const extra = Array.isArray(user?.roles) ? user.roles : [];
  const all = new Set([...base, ...extra].map(r => String(r).toLowerCase()));
  
  // Verificar parâmetros de query para isAdmin e isFreelancer
  const queryIsAdmin = queryParams.isAdmin === 'true' || queryParams.isAdmin === '1';
  const queryIsFreelancer = queryParams.isFreelancer === 'true' || queryParams.isFreelancer === '1';
  
  return {
    isAdmin:
      queryIsAdmin ||
      all.has('admin') ||
      all.has('administrator') ||
      all.has('owner') ||
      all.has('super_admin') ||
      all.has('superadmin') ||
      all.has('root'),
    isFreelancer: queryIsFreelancer || all.has('freelancer')
  };
};

router.get('/videos', async (req, res) => {
  let client;
  try {
    const { companyId, freelancerId, channelId, status, searchTerm } = req.query;
    const rawUserId = req.user?.id || req.query.userId || null;
    const userId = rawUserId !== undefined && rawUserId !== null && rawUserId !== ''
      ? String(rawUserId)
      : null;
    const { isAdmin, isFreelancer } = getRoleFlags(req.user, req.query);

    videoLogger.debug({
      requestId: req.requestId,
      companyId,
      freelancerId,
      channelId,
      status,
      searchTerm,
      userId,
      isAdmin,
      isFreelancer
    }, 'Parâmetros recebidos para listagem de vídeos');
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }

    if (isFreelancer && !userId) {
      return res.status(400).json({ message: 'Freelancer ID é obrigatório para visualizar vídeos.' });
    }

    client = await getConnection();
    let queryParams = [companyId];
    let query = `
      SELECT
        v.*,
        c.name AS channel_name
      FROM videos v
      LEFT JOIN channels c ON v.channel_id = c.id AND c.company_id = $1
      WHERE v.company_id = $1
    `;
    if (isFreelancer && userId) {
      query += ` AND EXISTS (SELECT 1 FROM video_freelancer_roles vfr2 WHERE vfr2.video_id = v.id AND vfr2.freelancer_id = $${queryParams.length + 1})`;
      queryParams.push(userId);
    }
    if (freelancerId) {
      query += ` AND EXISTS (SELECT 1 FROM video_freelancer_roles vfr3 WHERE vfr3.video_id = v.id AND vfr3.freelancer_id = $${queryParams.length + 1})`;
      queryParams.push(freelancerId);
    }
    if (channelId) {
      query += ' AND v.channel_id = $' + (queryParams.length + 1);
      queryParams.push(channelId);
    }
    if (status) {
      query += ' AND v.status = $' + (queryParams.length + 1);
      queryParams.push(status);
    }
    if (searchTerm) {
      const op = dbType === 'postgres' ? 'ILIKE' : 'LIKE';
      query += ` AND (v.title ${op} $${queryParams.length + 1} OR c.name ${op} $${queryParams.length + 2})`;
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    if (!isAdmin) {
      if (isFreelancer) {
        // Regras específicas de visualização para freelancers baseadas em status e role
        query += ` AND (
          (
            -- Roteirista: pode ver vídeos com status Roteiro_Solicitado, Roteiro_Em_Andamento ou Roteiro_Concluído
            EXISTS (
              SELECT 1 FROM video_freelancer_roles vfrR 
              WHERE vfrR.video_id = v.id 
                AND vfrR.freelancer_id = $${queryParams.length + 1}
                AND vfrR.role = 'roteirista'
                AND v.status IN ('Roteiro_Solicitado', 'Roteiro_Em_Andamento', 'Roteiro_Concluído')
            )
          ) OR (
            -- Narrador: pode ver vídeos com status Narração_Solicitada ou Narração_Em_Andamento
            EXISTS (
              SELECT 1 FROM video_freelancer_roles vfrN 
              WHERE vfrN.video_id = v.id 
                AND vfrN.freelancer_id = $${queryParams.length + 1}
                AND vfrN.role = 'narrador'
                AND v.status IN ('Narração_Solicitada', 'Narração_Em_Andamento')
            )
          ) OR (
            -- Editor: pode ver vídeos com status Edição_Solicitada ou Edição_Em_Andamento
            EXISTS (
              SELECT 1 FROM video_freelancer_roles vfrE 
              WHERE vfrE.video_id = v.id 
                AND vfrE.freelancer_id = $${queryParams.length + 1}
                AND vfrE.role = 'editor'
                AND v.status IN ('Edição_Solicitada', 'Edição_Em_Andamento')
            )
          ) OR (
            -- Thumb maker: pode ver vídeos com status Thumbnail_Solicitada ou Thumbnail_Em_Andamento
            EXISTS (
              SELECT 1 FROM video_freelancer_roles vfrT 
              WHERE vfrT.video_id = v.id 
                AND vfrT.freelancer_id = $${queryParams.length + 1}
                AND vfrT.role = 'thumb_maker'
                AND v.status IN ('Thumbnail_Solicitada', 'Thumbnail_Em_Andamento')
            )
          ) OR (
            -- Admin pode ver todos os vídeos (já tratado acima)
            false
          )
        )`;
        queryParams.push(userId);
      } else {
        query += " AND v.status NOT IN ('Roteiro_Concluído', 'Narração_Concluída', 'Edição_Concluída', 'Thumbnail_Concluída', 'Publicado')";
      }
    }
    const { rows } = await executeQuery(client, query, queryParams);
    const videos = rows;
    if (videos.length) {
      const videoIds = videos.map(v => v.id);
      const placeholders = videoIds.map((_, idx) => `$${idx + 2}`).join(', ');
      const roleQuery = `
        SELECT vfr.video_id, vfr.freelancer_id, vfr.role, f.name AS freelancer_name
        FROM video_freelancer_roles vfr
        JOIN freelancers f ON vfr.freelancer_id = f.id
        WHERE f.company_id = $1 AND vfr.video_id IN (${placeholders})
      `;
      const roleParams = [companyId, ...videoIds];
      const { rows: roleRows } = await executeQuery(client, roleQuery, roleParams);
      const roleMap = {};
      roleRows.forEach(r => {
        if (!roleMap[r.video_id]) roleMap[r.video_id] = [];
        roleMap[r.video_id].push({
          freelancer_id: r.freelancer_id,
          role: r.role,
          freelancer_name: r.freelancer_name
        });
      });
      videos.forEach(v => {
        v.roles = roleMap[v.id] || [];
      });
    }
    res.json(videos);
  } catch (error) {
    videoLogger.error({
      requestId: req.requestId,
      companyId,
      error: error.message
    }, 'Erro ao buscar vídeos');
    res.status(500).json({
      message: 'Erro ao buscar videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.post('/videos', async (req, res) => {
  let client;
  try {
    const { companyId, title, channelId, status, observations, youtubeUrl,
      freelancerRoles = [], userId } = req.body;
    if (!companyId || !title || !channelId || !status || !Array.isArray(freelancerRoles) || freelancerRoles.length === 0 || !userId) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }
    client = await getConnection();
    const validations = await Promise.all(
      freelancerRoles.map(fr => validateFreelancerExists(client, fr.freelancerId, companyId))
    );
    if (validations.some(valid => !valid)) {
      return res.status(400).json({ message: 'Um ou mais IDs de freelancers são inválidos.' });
    }
    let videoId;
    if (dbType === 'postgres') {
      const insertResult = await executeQuery(
        client,
        `INSERT INTO videos (
            title, channel_id, status, observations, youtube_url,
            company_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`,
        [title, channelId, status, observations, youtubeUrl, companyId]
      );
      videoId = insertResult.rows[0].id;
    } else {
      const [result] = await client.execute(
        `INSERT INTO videos (
            title, channel_id, status, observations, youtube_url,
            company_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [title, channelId, status, observations, youtubeUrl, companyId]
      );
      videoId = result.insertId;
    }
    for (const fr of freelancerRoles) {
      await executeQuery(
        client,
        'INSERT INTO video_freelancer_roles (video_id, freelancer_id, role) VALUES ($1, $2, $3)',
        [videoId, fr.freelancerId, fr.role]
      );
    }
    
    // Verificar se deve enviar notificações WhatsApp para status "solicitado" na criação
    const notificationConfig = {
      'Roteiro_Solicitado': { role: 'roteirista', task: 'roteiro' },
      'Narração_Solicitada': { role: 'narrador', task: 'narração' },
      'Edição_Solicitada': { role: 'editor', task: 'edição' },
      'Thumbnail_Solicitada': { role: 'thumb_maker', task: 'thumbnail' }
    }[status];
    
    if (notificationConfig) {
      // Consultar configurações da empresa para notificações automáticas
      const settingsResult = await executeQuery(
        client,
        'SELECT auto_notify FROM settings WHERE company_id = $1',
        [companyId]
      );
      
      const autoNotify = settingsResult.rowCount > 0 ? settingsResult.rows[0].auto_notify : false;
      const shouldSendMessage = autoNotify || req.body.sendMessage === true;
      
      if (shouldSendMessage) {
        const freelancerData = await executeQuery(
          client,
          `SELECT f.name, f.phone
             FROM freelancers f
             JOIN video_freelancer_roles vfr ON f.id = vfr.freelancer_id
            WHERE vfr.video_id = $1
              AND vfr.role = $2
              AND f.company_id = $3`,
          [videoId, notificationConfig.role, companyId]
        );
        
        const recipient = freelancerData.rows[0];
        if (recipient?.phone) {
          await sendWhatsAppMessage(
            client,
            companyId,
            recipient.phone,
            title,
            recipient.name
          );
        }
      }
    }
    
    res.status(201).json({
      id: videoId,
      message: 'Vídeo criado com sucesso.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    videoLogger.error({
      requestId: req.requestId,
      companyId,
      title,
      error: error.message
    }, 'Erro ao criar vídeo');
    res.status(500).json({
      message: 'Erro ao criar vídeo.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.delete('/videos/:id', async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();
    await executeQuery(
      client,
      'DELETE FROM video_logs WHERE video_id = $1 AND company_id = $2',
      [id, companyId]
    );
    const deleteQuery = dbType === 'postgres'
      ? 'DELETE FROM videos WHERE id = $1 AND company_id = $2 RETURNING *'
      : 'DELETE FROM videos WHERE id = $1 AND company_id = $2';
    const { query: delSql, params: delParams } = prepareQuery(deleteQuery, [id, companyId]);
    const result = await client.query(delSql, delParams);
    const rowCount = dbType === 'postgres' ? result.rowCount : result[0].affectedRows;
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }
    const deletedVideo = dbType === 'postgres' ? result.rows[0] : null;
    res.json({
      message: 'Vídeo excluído com sucesso',
      deletedVideo
    });
  } catch (error) {
    videoLogger.error({
      requestId: req.requestId,
      companyId,
      videoId: id,
      error: error.message
    }, 'Erro ao excluir vídeo');
    res.status(500).json({
      message: 'Erro ao excluir vídeo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.put('/videos/:id', async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    const { companyId, title, channelId, status, observations, youtubeUrl,
      freelancerRoles = [], userId } = req.body;
    if (!companyId || !title || !channelId || !status || !Array.isArray(freelancerRoles) || freelancerRoles.length === 0 || !userId) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }
    client = await getConnection();
    const videoResult = await executeQuery(
      client,
      'SELECT * FROM videos WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    if (videoResult.rowCount === 0) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }
    const validations = await Promise.all(
      freelancerRoles.map(fr => validateFreelancerExists(client, fr.freelancerId, companyId))
    );
    if (validations.some(valid => !valid)) {
      return res.status(400).json({ message: 'IDs de freelancers inválidos' });
    }
    const { query: updateSql, params: updateParams } = prepareQuery(
      `UPDATE videos SET
         title = $1, channel_id = $2, status = $3, observations = $4,
         youtube_url = $5, updated_at = NOW()
       WHERE id = $6 AND company_id = $7`,
      [title, channelId, status, observations, youtubeUrl, id, companyId]
    );
    await client.query(updateSql, updateParams);
    await executeQuery(client, 'DELETE FROM video_freelancer_roles WHERE video_id = $1', [id]);
    for (const fr of freelancerRoles) {
      await executeQuery(
        client,
        'INSERT INTO video_freelancer_roles (video_id, freelancer_id, role) VALUES ($1, $2, $3)',
        [id, fr.freelancerId, fr.role]
      );
    }
    
    // Verificar se deve enviar notificações WhatsApp para status "solicitado"
    const notificationConfig = {
      'Roteiro_Solicitado': { role: 'roteirista', task: 'roteiro' },
      'Narração_Solicitada': { role: 'narrador', task: 'narração' },
      'Edição_Solicitada': { role: 'editor', task: 'edição' },
      'Thumbnail_Solicitada': { role: 'thumb_maker', task: 'thumbnail' }
    }[status];
    
    if (notificationConfig) {
      // Consultar configurações da empresa para notificações automáticas
      const settingsResult = await executeQuery(
        client,
        'SELECT auto_notify FROM settings WHERE company_id = $1',
        [companyId]
      );
      
      const autoNotify = settingsResult.rowCount > 0 ? settingsResult.rows[0].auto_notify : false;
      const shouldSendMessage = autoNotify || req.body.sendMessage === true;
      
      if (shouldSendMessage) {
        const freelancerData = await executeQuery(
          client,
          `SELECT f.name, f.phone
             FROM freelancers f
             JOIN video_freelancer_roles vfr ON f.id = vfr.freelancer_id
            WHERE vfr.video_id = $1
              AND vfr.role = $2
              AND f.company_id = $3`,
          [id, notificationConfig.role, companyId]
        );
        
        const recipient = freelancerData.rows[0];
        if (recipient?.phone) {
          await sendWhatsAppMessage(
            client,
            companyId,
            recipient.phone,
            title,
            recipient.name
          );
        }
      }
    }
    
    res.json({ message: 'Vídeo atualizado com sucesso' });
  } catch (error) {
    videoLogger.error({
      requestId: req.requestId,
      companyId,
      videoId: id,
      error: error.message
    }, 'Erro ao atualizar vídeo');
    res.status(500).json({
      message: 'Erro ao atualizar vídeo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.put('/videos/:id/status', async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    const { companyId, status, userId, isUser } = req.body;
    const nextStatusMap = {
      'Roteiro_Concluído': 'Narração_Solicitada',
      'Narração_Concluída': 'Edição_Solicitada',
      'Edição_Concluída': 'Thumbnail_Solicitada',
      'Thumbnail_Concluída': null
    };
    if (!companyId || !status || !userId) {
      return res.status(400).json({
        message: 'Parâmetros obrigatórios: companyId, status, userId'
      });
    }
    client = await getConnection();
    const adminCheck = await executeQuery(
      client,
      `SELECT id FROM users
       WHERE company_id = $1
         AND role = 'admin'
       LIMIT 1`,
      [companyId]
    );
    if (!adminCheck.rows[0]) {
      return res.status(400).json({
        code: 'MISSING_ADMIN',
        message: 'Nenhum administrador cadastrado para esta empresa',
        solution: 'Crie um usuário com role=admin antes de continuar'
      });
    }
    const adminUserId = adminCheck.rows[0].id;
    let validUserId;
    let freelancerId = null;
    if (isUser) {
      const userResult = await executeQuery(
        client,
        `SELECT id FROM users
         WHERE id = $1
           AND company_id = $2`,
        [userId, companyId]
      );
      if (!userResult.rows[0]) {
        return res.status(404).json({
          code: 'USER_NOT_FOUND',
          message: 'Usuário interno não encontrado'
        });
      }
      validUserId = userId;
    } else {
      const freelancerResult = await executeQuery(
        client,
        `SELECT id FROM freelancers
         WHERE id = $1
           AND company_id = $2`,
        [userId, companyId]
      );
      if (!freelancerResult.rows[0]) {
        return res.status(404).json({
          code: 'FREELANCER_NOT_FOUND',
          message: 'Freelancer não encontrado'
        });
      }
      validUserId = adminUserId;
      freelancerId = userId;
    }
    const videoResult = await executeQuery(
      client,
      `SELECT id, title, status, updated_at
       FROM videos
       WHERE id = $1
         AND company_id = $2`,
      [id, companyId]
    );
    if (videoResult.rowCount === 0) {
      return res.status(404).json({
        code: 'VIDEO_NOT_FOUND',
        message: 'Vídeo não encontrado'
      });
    }
    const video = videoResult.rows[0];
    const currentStatus = video.status;

    // Consultar configurações da empresa para notificações automáticas
    const settingsResult = await executeQuery(
      client,
      'SELECT auto_notify FROM settings WHERE company_id = $1',
      [companyId]
    );
    
    const autoNotify = settingsResult.rowCount > 0 ? settingsResult.rows[0].auto_notify : false;
    
    // Determinar se deve enviar mensagem: automático OU solicitação explícita
    const shouldSendMessage = autoNotify || req.body.sendMessage === true;
    const updateQuery = dbType === 'postgres'
      ? `UPDATE videos
           SET status = $1, updated_at = NOW()
         WHERE id = $2
           AND company_id = $3
         RETURNING id, updated_at`
      : `UPDATE videos
           SET status = ?, updated_at = NOW()
         WHERE id = ?
           AND company_id = ?`;
    const updateParams = [status, id, companyId];
    let updatedVideo;
    if (dbType === 'postgres') {
      const pgResult = await client.query(updateQuery, updateParams);
      updatedVideo = pgResult.rows[0];
    } else {
      await client.execute(updateQuery, updateParams);
      const [rows] = await client.execute(
        `SELECT id, updated_at
           FROM videos
          WHERE id = ?
            AND company_id = ?`,
        [id, companyId]
      );
      updatedVideo = rows[0];
    }
    let duration = 0;
    if (currentStatus.endsWith('_Em_Andamento') && status.endsWith('_Concluída')) {
      const startTime = new Date(video.updated_at);
      const endTime = new Date(updatedVideo.updated_at);
      duration = Math.floor((endTime - startTime) / 1000);
    }
    const logParams = [
      id,
      validUserId,
      freelancerId,
      'Alteração de Status',
      currentStatus,
      status,
      duration,
      isUser,
      companyId
    ];
    const { query: logSql, params: logBound } = prepareQuery(
      `INSERT INTO video_logs (
        video_id, user_id, freelancer_id,
        action, from_status, to_status,
        created_at, duration, is_user, company_id
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9)`,
      logParams
    );
    await client.query(logSql, logBound);
    const nextStatus = nextStatusMap[status];
    if (nextStatus) {
      const { query: nextSql, params: nextBound } = prepareQuery(
        `UPDATE videos
         SET status = $1, updated_at = NOW()
         WHERE id = $2
           AND company_id = $3`,
        [nextStatus, id, companyId]
      );
      await client.query(nextSql, nextBound);
    }
    const effectiveStatus = nextStatus || status;
    // Sistema de notificações
    if (shouldSendMessage) {
      const notificationConfig = {
        'Roteiro_Solicitado': { role: 'roteirista', task: 'roteiro' },
        'Narração_Solicitada': { role: 'narrador', task: 'narração' },
        'Edição_Solicitada': { role: 'editor', task: 'edição' },
        'Thumbnail_Solicitada': { role: 'thumb_maker', task: 'thumbnail' }
      }[effectiveStatus];
      if (notificationConfig) {
        const freelancerData = await executeQuery(
          client,
          `SELECT f.name, f.phone
             FROM video_freelancer_roles vfr
             JOIN freelancers f ON vfr.freelancer_id = f.id
            WHERE vfr.video_id = $1
              AND vfr.role = $2
              AND f.company_id = $3`,
          [id, notificationConfig.role, companyId]
        );
        const recipient = freelancerData.rows[0];
        if (recipient?.phone) {
          await sendWhatsAppMessage(
            client,
            companyId,
            recipient.phone,
            video.title,
            recipient.name
          );
        }
      }
    }

    // Notificar envolvidos apenas para status nao solicitados
    if (!effectiveStatus.endsWith('_Solicitado')) {
      try {
        // Buscar nome de quem fez a alteração
        let changerName = 'Sistema';
        if (isUser) {
          const userResult = await executeQuery(
            client,
            `SELECT name FROM users WHERE id = $1 AND company_id = $2`,
            [validUserId, companyId]
          );
          if (userResult.rows[0]) {
            changerName = userResult.rows[0].name;
          }
        } else if (freelancerId) {
          const freelancerResult = await executeQuery(
            client,
            `SELECT name FROM freelancers WHERE id = $1 AND company_id = $2`,
            [freelancerId, companyId]
          );
          if (freelancerResult.rows[0]) {
            changerName = freelancerResult.rows[0].name;
          }
        }

        // Chamar função para notificar todos os envolvidos
        await notifyAllInvolvedParties(
          client,
          companyId,
          id,
          video.title,
          currentStatus,
          effectiveStatus,
          changerName,
          freelancerId || validUserId,
          !isUser // isChangerFreelancer
        );
      } catch (notifyError) {
        // Log do erro mas não falha a requisição
        videoLogger.error({
          requestId: req.requestId,
          videoId: id,
          error: notifyError.message
        }, 'Erro ao notificar envolvidos sobre mudança de status');
      }
    }
    res.json({
      success: true,
      data: {
        video: {
          id: updatedVideo.id,
          previousStatus: currentStatus,
          newStatus: effectiveStatus,
          nextStatus: nextStatus || 'Processo Finalizado',
          duration: `${duration} segundos`
        },
        logDetails: {
          recordedBy: isUser ? 'Usuário Interno' : 'Administrador',
          userIdUsed: validUserId,
          freelancerId: freelancerId
        }
      }
    });
  } catch (error) {
    videoLogger.error({
      requestId: req.requestId,
      params: req.params,
      body: req.body,
      error: error.message
    }, 'Erro na atualização de status de vídeo');
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro no processamento da solicitação',
      details:
        process.env.NODE_ENV === 'development'
          ? { error: error.message, stack: error.stack }
          : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.post('/videos/:id/comments', async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    const { companyId, text, userId, userType } = req.body;
    if (!companyId || !text || !userId || !userType) {
      return res.status(400).json({ message: 'Parâmetros obrigatórios faltando' });
    }
    client = await getConnection();
    const userTable = userType === 'freelancer' ? 'freelancers' : 'users';
    const userResult = await executeQuery(
      client,
      `SELECT id, name, role FROM ${userTable} WHERE id = $1 AND company_id = $2`,
      [userId, companyId]
    );
    if (userResult.rowCount === 0) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }
    const user = userResult.rows[0];
    const commentQuery = `INSERT INTO comments (
      video_id, text, user_type, user_id, freelancer_id,
      company_id, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`;
    const commentParams = [
      id,
      text,
      userType,
      userType === 'user' ? userId : null,
      userType === 'freelancer' ? userId : null,
      companyId
    ];
    const { query: commentSql, params: commentBound } = prepareQuery(commentQuery, commentParams);
    await client.query(commentSql, commentBound);
    res.status(201).json({
      message: 'Comentário adicionado',
      comment: {
        text,
        userName: user.name,
        userRole: user.role
      }
    });
  } catch (error) {
    videoLogger.error({
      requestId: req.requestId,
      videoId: id,
      companyId,
      error: error.message
    }, 'Erro ao adicionar comentário');
    res.status(500).json({
      message: 'Erro ao adicionar comentário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/videos/:id/comments', async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();
    const commentsQuery = `SELECT
      c.text,
      c.created_at,
      c.user_type,
      COALESCE(f.name, u.name) AS user_name,
      COALESCE(f.role, 'admin') AS user_role
    FROM comments c
    LEFT JOIN freelancers f ON c.freelancer_id = f.id AND c.user_type = 'freelancer'
    LEFT JOIN users u ON c.user_id = u.id AND c.user_type = 'user'
    WHERE c.video_id = $1 AND c.company_id = $2
    ORDER BY c.created_at DESC`;
    const commentsResult = await executeQuery(client, commentsQuery, [id, companyId]);
    res.json({
      comments: commentsResult.rows.map(comment => ({
        text: comment.text,
        createdAt: comment.created_at,
        userName: comment.user_name,
        userRole: comment.user_role
      }))
    });
  } catch (error) {
    videoLogger.error({
      requestId: req.requestId,
      videoId: id,
      companyId,
      error: error.message
    }, 'Erro ao buscar comentários');
    res.status(500).json({
      message: 'Erro ao buscar comentários',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/channels4', async (req, res) => {
  let client;
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();
    const channelsResult = await executeQuery(
      client,
      'SELECT id, name FROM channels WHERE company_id = $1',
      [companyId]
    );
    res.json({ channels: channelsResult.rows });
  } catch (error) {
    videoLogger.error({
      requestId: req.requestId,
      companyId,
      error: error.message
    }, 'Erro ao buscar canais');
    res.status(500).json({
      message: 'Erro ao buscar canais',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/freelancers4', async (req, res) => {
  let client;
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();
    const freelancersResult = await executeQuery(
      client,
      `SELECT f.id, f.name,
              ${dbType === 'postgres'
        ? "COALESCE(ARRAY_REMOVE(ARRAY_AGG(fr.role), NULL), '{}')"
        : "IFNULL(CONCAT('[', GROUP_CONCAT(JSON_QUOTE(fr.role)), ']'), '[]')"} AS roles
       FROM freelancers f
       LEFT JOIN freelancer_roles fr ON f.id = fr.freelancer_id
       WHERE f.company_id = $1
       GROUP BY f.id, f.name`,
      [companyId]
    );
    const freelancers = freelancersResult.rows.map(f => ({
      id: f.id,
      name: f.name,
      roles: dbType === 'postgres' ? f.roles : JSON.parse(f.roles).filter(Boolean)
    }));
    res.json({ freelancers });
  } catch (error) {
    videoLogger.error({
      requestId: req.requestId,
      companyId,
      error: error.message
    }, 'Erro ao buscar freelancers');
    res.status(500).json({
      message: 'Erro ao buscar freelancers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/video-status', (req, res) => {
  res.json(VIDEO_STATUSES);
});

async function sendWhatsAppMessage(client, companyId, phone, videoTitle, freelancerName) {
  const logContext = {
    companyId,
    phone,
    videoTitle,
    freelancerName
  };

  try {
    whatsappLogger.info('Iniciando envio de mensagem WhatsApp', logContext);

    // Buscar configurações da empresa
    whatsappLogger.info('Buscando configurações da empresa', { companyId });
    const settingsResult = await executeQuery(
      client,
      `SELECT api_key, sender_phone, message_template, whatsapp_api_url FROM settings WHERE company_id = $1`,
      [companyId]
    );

    if (settingsResult.rowCount === 0) {
      whatsappLogger.warn('Configurações não encontradas para a empresa', { companyId });
      return;
    }

    const settings = settingsResult.rows[0];

    if (!settings.api_key) {
      whatsappLogger.warn('API key não configurada para a empresa', { companyId });
      return;
    }

    if (!settings.sender_phone) {
      whatsappLogger.warn('Número do remetente não configurado para a empresa', { companyId });
      return;
    }

    whatsappLogger.info('Configurações validadas com sucesso', {
      companyId,
      hasApiKey: !!settings.api_key,
      hasSenderPhone: !!settings.sender_phone,
      hasTemplate: !!settings.message_template
    });

    // Formatar número de telefone
    const formattedPhone = normalizePhoneNumber(phone);
    whatsappLogger.debug('Número de telefone formatado', {
      original: phone,
      formatted: formattedPhone
    });

    // Preparar corpo da mensagem
    const messageBody = (settings.message_template || 'Olá, {name}! Um novo vídeo foi atribuído a você: {titulo}')
      .replace(/{name}/g, freelancerName)
      .replace(/{titulo}/g, videoTitle);

    whatsappLogger.info('Mensagem preparada', {
      template: settings.message_template,
      finalMessage: messageBody,
      freelancerName,
      videoTitle
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

    whatsappLogger.info('Enviando mensagem via API WhatsApp', {
      apiUrl: whatsappApiUrl,
      senderPhone: formattedSenderPhone,
      recipientPhone: formattedPhone,
      messageLength: messageBody.length
    });

    const response = await axios.post(whatsappApiUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    whatsappLogger.info('Mensagem enviada com sucesso', {
      status: response.status,
      statusText: response.statusText,
      responseData: response.data
    });
  } catch (error) {
    if (error.response) {
      whatsappLogger.error('Erro na API WhatsApp', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        companyId,
        phone,
        videoTitle
      });
    } else if (error.request) {
      whatsappLogger.error('Erro de conexão com a API WhatsApp', {
        message: error.message,
        code: error.code,
        companyId,
        phone,
        videoTitle
      });
    } else {
      whatsappLogger.error('Erro inesperado ao enviar mensagem WhatsApp', {
        message: error.message,
        stack: error.stack,
        companyId,
        phone,
        videoTitle
      });
    }
    throw error;
  }
}

/**
 * Envia notificações WhatsApp para todos os envolvidos em um vídeo quando o status muda
 * @param {object} client - Cliente de banco de dados
 * @param {string} companyId - ID da empresa
 * @param {string} videoId - ID do vídeo
 * @param {string} videoTitle - Título do vídeo
 * @param {string} oldStatus - Status anterior
 * @param {string} newStatus - Novo status
 * @param {string} changerName - Nome de quem fez a alteração
 * @param {string} changerId - ID de quem fez a alteração (para não enviar notificação para si mesmo)
 * @param {boolean} isChangerFreelancer - Se quem fez a mudança é freelancer
 */
async function notifyAllInvolvedParties(client, companyId, videoId, videoTitle, oldStatus, newStatus, changerName, changerId, isChangerFreelancer) {
  const logContext = {
    companyId,
    videoId,
    videoTitle,
    oldStatus,
    newStatus,
    changerName,
    changerId,
    isChangerFreelancer
  };

  try {
    const normalizedStatus = String(newStatus || '').replace(/_/g, ' ');
    if (normalizedStatus.includes('Solicitado')) {
      whatsappLogger.info('Notificação geral ignorada para status solicitado', {
        companyId,
        videoId,
        newStatus
      });
      return;
    }

    whatsappLogger.info('Iniciando notificação para todos os envolvidos', logContext);

    // 1. Buscar todos os freelancers atribuídos ao vídeo
    const freelancersResult = await executeQuery(
      client,
      `SELECT DISTINCT f.id, f.name, f.phone, vfr.role
       FROM video_freelancer_roles vfr
       JOIN freelancers f ON vfr.freelancer_id = f.id
       WHERE vfr.video_id = $1
         AND f.company_id = $2
         AND f.phone IS NOT NULL
         AND f.phone != ''`,
      [videoId, companyId]
    );

    // 2. Buscar usuários admin/gestores da empresa (se existir tabela de usuários)
    let adminUsers = [];
    try {
      const adminsResult = await executeQuery(
        client,
        `SELECT DISTINCT u.id, u.name, u.phone
         FROM users u
         WHERE u.company_id = $1
           AND u.phone IS NOT NULL
           AND u.phone != ''
           AND (u.role = 'admin' OR u.role = 'gestor')`,
        [companyId]
      );
      adminUsers = adminsResult.rows || [];
    } catch (error) {
      whatsappLogger.warn('Não foi possível buscar admins (tabela users pode não existir)', { companyId, error: error.message });
    }

    // 3. Preparar lista de destinatários (removendo quem fez a mudança)
    const recipients = [];

    // Adicionar freelancers
    freelancersResult.rows.forEach(freelancer => {
      const isChanger = isChangerFreelancer && String(freelancer.id) === String(changerId);
      if (!isChanger) {
        recipients.push({
          id: freelancer.id,
          name: freelancer.name,
          phone: freelancer.phone,
          role: freelancer.role,
          type: 'freelancer'
        });
      }
    });

    // Adicionar admins
    adminUsers.forEach(admin => {
      const isChanger = !isChangerFreelancer && String(admin.id) === String(changerId);
      if (!isChanger) {
        recipients.push({
          id: admin.id,
          name: admin.name,
          phone: admin.phone,
          role: 'admin',
          type: 'admin'
        });
      }
    });

    whatsappLogger.info(`Encontrados ${recipients.length} destinatários para notificação`, {
      companyId,
      videoId,
      totalRecipients: recipients.length,
      freelancersCount: recipients.filter(r => r.type === 'freelancer').length,
      adminsCount: recipients.filter(r => r.type === 'admin').length
    });

    // 4. Buscar configurações da empresa
    let settingsResult;
    try {
      settingsResult = await executeQuery(
        client,
        `SELECT api_key, sender_phone, message_template, status_change_template, whatsapp_api_url FROM settings WHERE company_id = $1`,
        [companyId]
      );
    } catch (error) {
      const isMissingColumn = error?.code === 'ER_BAD_FIELD_ERROR' ||
        /Unknown column/i.test(error?.message || '');
      if (!isMissingColumn) {
        throw error;
      }
      whatsappLogger.warn('Coluna status_change_template ausente; usando template padrao', {
        companyId,
        error: error?.message
      });
      settingsResult = await executeQuery(
        client,
        `SELECT api_key, sender_phone, message_template, whatsapp_api_url FROM settings WHERE company_id = $1`,
        [companyId]
      );
    }

    if (settingsResult.rowCount === 0 || !settingsResult.rows[0].api_key || !settingsResult.rows[0].sender_phone) {
      whatsappLogger.warn('Configurações de WhatsApp não encontradas ou incompletas', { companyId });
      return;
    }

    const settings = settingsResult.rows[0];

    // Template para mudança de status (com fallback)
    const statusChangeTemplate = settings.status_change_template ||
      'Olá, {name}. O vídeo "{titulo}" foi atualizado para "{status_novo}". ' +
      'Acompanhe o andamento no sistema. Alterado por {quem_alterou}.';

    const statusRoleMap = {
      Roteiro_Solicitado: 'roteirista',
      Narração_Solicitada: 'narrador',
      Edição_Solicitada: 'editor',
      Thumbnail_Solicitada: 'thumb_maker'
    };
    const targetRole = statusRoleMap[newStatus];
    const scopedRecipients = recipients.filter((recipient) => {
      if (recipient.type === 'admin') return true;
      if (!targetRole) return false;
      return recipient.role === targetRole;
    });

    whatsappLogger.info('Destinatários filtrados por status', {
      companyId,
      videoId,
      newStatus,
      targetRole: targetRole || null,
      totalRecipients: scopedRecipients.length
    });

    if (targetRole && scopedRecipients.filter(r => r.type === 'freelancer').length === 0) {
      whatsappLogger.warn('Nenhum freelancer elegível para o status solicitado', {
        companyId,
        videoId,
        newStatus,
        targetRole
      });
    }

    // 5. Enviar notificação para cada destinatário
    const sendPromises = scopedRecipients.map(async (recipient) => {
      try {
        const baseTemplate = settings.status_change_template ||
          statusChangeTemplate;
        const messageBody = baseTemplate
          .replace(/{name}/g, recipient.name)
          .replace(/{titulo}/g, videoTitle)
          .replace(/{status_antigo}/g, oldStatus.replace(/_/g, ' '))
          .replace(/{status_novo}/g, newStatus.replace(/_/g, ' '))
          .replace(/{quem_alterou}/g, changerName);

        const formattedPhone = normalizePhoneNumber(recipient.phone);

        whatsappLogger.info('Enviando notificação de mudança de status', {
          companyId,
          videoId,
          recipientName: recipient.name,
          recipientType: recipient.type,
          recipientRole: recipient.role,
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

        whatsappLogger.info('Notificação enviada com sucesso', {
          companyId,
          videoId,
          recipientName: recipient.name,
          recipientType: recipient.type
        });

        return { success: true, recipient: recipient.name };
      } catch (error) {
        whatsappLogger.error('Erro ao enviar notificação para destinatário', {
          companyId,
          videoId,
          recipientName: recipient.name,
          recipientType: recipient.type,
          error: error.message
        });
        return { success: false, recipient: recipient.name, error: error.message };
      }
    });

    // Aguardar todas as notificações serem enviadas
    const results = await Promise.allSettled(sendPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failureCount = results.length - successCount;

    whatsappLogger.info('Notificações de mudança de status finalizadas', {
      companyId,
      videoId,
      total: results.length,
      success: successCount,
      failures: failureCount
    });

  } catch (error) {
    whatsappLogger.error('Erro ao notificar envolvidos sobre mudança de status', {
      ...logContext,
      error: error.message,
      stack: error.stack
    });
  }
}

module.exports = router;
