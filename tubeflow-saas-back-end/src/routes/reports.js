const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const mysqlPool = mysql.createPool(config.dbConfig.mysql);
const getConnection = async () => {
  return await mysqlPool.getConnection();
};

router.get('/channels3', async (req, res) => {
  let client;
  try {
    const companyId = req.query.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();
    const [rows] = await client.execute(
      'SELECT id, name FROM channels WHERE company_id = ?',
      [companyId]
    );
    res.json({ channels: rows });
  } catch (error) {
    console.error('Erro ao buscar canais:', error);
    res.status(500).json({
      message: 'Erro ao buscar canais.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/freelancers2', async (req, res) => {
  let client;
  try {
    const companyId = req.query.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();
    const [rows] = await client.execute(
      'SELECT id, name FROM freelancers WHERE company_id = ?',
      [companyId]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error('Erro ao buscar freelancers:', error);
    res.status(500).json({
      message: 'Erro ao buscar freelancers.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/reports/data', async (req, res) => {
  let client;
  try {
    const { companyId, startDate, endDate, channelId, freelancerId, status } = req.query;
    if (!companyId) {
      return res.status(400).json({
        code: 'MISSING_COMPANY_ID',
        message: 'Company ID é obrigatório'
      });
    }
    client = await getConnection();

    let query = `
      SELECT 
        l.id AS logId,
        v.id AS videoId,
        c.name AS channelName,
        v.title AS videoTitle,
        l.from_status AS fromStatus,
        l.to_status AS toStatus,
        l.created_at AS logDate,
        l.duration AS durationSeconds,
        l.freelancer_id AS freelancerId
      FROM video_logs l
      INNER JOIN videos v ON l.video_id = v.id
      LEFT JOIN channels c ON v.channel_id = c.id
      WHERE v.company_id = ?
        AND l.action = 'Alteração de Status'
    `;
    const params = [companyId];

    const addCondition = (value, column, operator = '>=') => {
      if (value) {
        params.push(value);
        query += ` AND ${column} ${operator} ?`;
      }
    };

    addCondition(startDate, 'l.created_at');
    addCondition(endDate, 'l.created_at', '<=');

    if (channelId) {
      params.push(channelId);
      query += ` AND v.channel_id = ?`;
    }

    if (freelancerId) {
      params.push(freelancerId);
      query += ` AND l.freelancer_id = ?`;
    }

    if (status) {
      const statusList = status.split(',');
      const placeholders = statusList.map(() => '?').join(',');
      query += ` AND l.to_status IN (${placeholders})`;
      params.push(...statusList);
    }

    query += ` ORDER BY l.created_at DESC`;

    const [rows] = await client.execute(query, params);

    const reportData = rows.map(item => {
      const totalSeconds = Number(item.durationSeconds) || 0;
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return {
        id: item.logId,
        videoId: item.videoId,
        channelName: item.channelName,
        videoTitle: item.videoTitle,
        logDate: item.logDate,
        statusTransition: {
          from: item.fromStatus ? item.fromStatus.replace(/_/g, ' ') : 'Não Definido',
          to: item.toStatus ? item.toStatus.replace(/_/g, ' ') : 'Não Definido'
        },
        duration: {
          formatted: `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`,
          seconds: totalSeconds
        },
        freelancerId: item.freelancerId
      };
    });

    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      code: 'REPORT_ERROR',
      message: 'Erro na geração do relatório'
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/reports/stats', async (req, res) => {
  let client;
  try {
    const { companyId, startDate, endDate, channelId, freelancerId, status } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();

    const statusList = status ? status.split(',') : [];
    const params = [companyId, companyId, companyId, companyId];
    let query = `
      SELECT 
        COUNT(*) AS totaltasks,
        COALESCE(AVG(logs.totalduration), 0) AS averagetime,
        (
          SELECT f.name
          FROM (
            SELECT script_writer_id AS freelancer_id, created_at, channel_id, status FROM videos WHERE company_id = ?
            UNION ALL
            SELECT editor_id, created_at, channel_id, status FROM videos WHERE company_id = ?
            UNION ALL
            SELECT narrator_id, created_at, channel_id, status FROM videos WHERE company_id = ?
            UNION ALL
            SELECT thumb_maker_id, created_at, channel_id, status FROM videos WHERE company_id = ?
          ) v2
          JOIN freelancers f ON v2.freelancer_id = f.id
          WHERE 1=1
    `;

    if (startDate) {
      params.push(startDate);
      query += ` AND v2.created_at >= ?`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND v2.created_at <= ?`;
    }
    if (channelId) {
      params.push(channelId);
      query += ` AND v2.channel_id = ?`;
    }
    if (statusList.length) {
      const ph = statusList.map(() => '?').join(',');
      query += ` AND v2.status IN (${ph})`;
      params.push(...statusList);
    }

    query += `
          GROUP BY f.id
          ORDER BY COUNT(*) DESC
          LIMIT 1
        ) AS topfreelancer,
        (
          SELECT c.name
          FROM channels c
          JOIN videos v2 ON v2.channel_id = c.id
          WHERE v2.company_id = ?
    `;
    params.push(companyId);

    if (startDate) {
      params.push(startDate);
      query += ` AND v2.created_at >= ?`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND v2.created_at <= ?`;
    }
    if (freelancerId) {
      query += `
        AND (
          v2.script_writer_id = ? OR v2.editor_id = ? OR v2.narrator_id = ? OR v2.thumb_maker_id = ?
        )
      `;
      params.push(freelancerId, freelancerId, freelancerId, freelancerId);
    }
    if (statusList.length) {
      const ph = statusList.map(() => '?').join(',');
      query += ` AND v2.status IN (${ph})`;
      params.push(...statusList);
    }

    query += `
          GROUP BY c.id
          ORDER BY COUNT(*) DESC
          LIMIT 1
        ) AS topchannel
      FROM videos v
      LEFT JOIN (
        SELECT video_id, SUM(duration) AS totalduration
        FROM video_logs
        GROUP BY video_id
      ) logs ON v.id = logs.video_id
      WHERE v.company_id = ?
    `;
    params.push(companyId);

    if (startDate) {
      params.push(startDate);
      query += ` AND v.created_at >= ?`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND v.created_at <= ?`;
    }
    if (channelId) {
      params.push(channelId);
      query += ` AND v.channel_id = ?`;
    }
    if (freelancerId) {
      query += `
        AND (
          v.script_writer_id = ? OR v.editor_id = ? OR v.narrator_id = ? OR v.thumb_maker_id = ?
        )
      `;
      params.push(freelancerId, freelancerId, freelancerId, freelancerId);
    }
    if (statusList.length) {
      const ph = statusList.map(() => '?').join(',');
      query += ` AND v.status IN (${ph})`;
      params.push(...statusList);
    }

    const [rows] = await client.execute(query, params);
    const stats = rows[0] || {};

    if (stats.averagetime) {
      const totalSeconds = Math.round(stats.averagetime);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      stats.averagetimeformatted = `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
    } else {
      stats.averagetimeformatted = '0m 0s';
    }

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      message: 'Erro ao buscar estatísticas.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/reports/status', async (req, res) => {
  let client;
  try {
    const { companyId, startDate, endDate, channelId, freelancerId, status } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();

    let query = `SELECT v.status, COUNT(*) AS count FROM videos v WHERE v.company_id = ?`;
    const params = [companyId];

    if (startDate) {
      params.push(startDate);
      query += ` AND v.created_at >= ?`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND v.created_at <= ?`;
    }
    if (channelId) {
      params.push(channelId);
      query += ` AND v.channel_id = ?`;
    }
    if (freelancerId) {
      query += `
        AND (
          v.script_writer_id = ? OR v.editor_id = ? OR v.narrator_id = ?
        )
      `;
      params.push(freelancerId, freelancerId, freelancerId);
    }
    if (status) {
      const statusList = status.split(',');
      const placeholders = statusList.map(() => '?').join(',');
      query += ` AND v.status IN (${placeholders})`;
      params.push(...statusList);
    }

    query += ` GROUP BY v.status`;

    const [rows] = await client.execute(query, params);
    res.json(rows.map(row => ({
      status: row.status,
      count: row.count
    })));
  } catch (error) {
    console.error('Erro ao buscar contagem de status:', error);
    res.status(500).json({
      message: 'Erro ao buscar contagem de status.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/reports/export', async (req, res) => {
  let client;
  try {
    const { companyId, format, startDate, endDate, channelId, freelancerId, status } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório' });
    }
    client = await getConnection();

    let query = `
      SELECT 
        v.id AS id,
        c.name AS channelname,
        v.title AS videotitle,
        v.status AS status,
        COALESCE(AVG(l.duration), 0) AS averagetimeinseconds,
        v.created_at AS createdat
      FROM videos v
      LEFT JOIN channels c ON v.channel_id = c.id
      LEFT JOIN video_logs l ON v.id = l.video_id
      WHERE v.company_id = ?
    `;
    const params = [companyId];

    if (startDate) {
      params.push(startDate);
      query += ` AND v.created_at >= ?`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND v.created_at <= ?`;
    }
    if (channelId) {
      params.push(channelId);
      query += ` AND v.channel_id = ?`;
    }
    if (freelancerId) {
      query += `
        AND (
          v.script_writer_id = ? OR v.editor_id = ? OR v.narrator_id = ? OR v.thumb_maker_id = ?
        )
      `;
      params.push(freelancerId, freelancerId, freelancerId, freelancerId);
    }
    if (status) {
      const statusList = status.split(',');
      const placeholders = statusList.map(() => '?').join(',');
      query += ` AND v.status IN (${placeholders})`;
      params.push(...statusList);
    }

    query += ` GROUP BY v.id, c.name, v.title, v.status, v.created_at`;

    const [rows] = await client.execute(query, params);
    const reportData = rows.map(item => {
      const totalSeconds = Number(item.averagetimeinseconds);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return {
        ...item,
        averageTime: `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`
      };
    });

    client.release();

    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30 });
      const filePath = path.join(exportsDir, 'report.pdf');
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(18).text('Relatório de Vídeos', { align: 'center' });
      doc.moveDown();

      reportData.forEach(data => {
        doc.fontSize(12)
           .text(`Canal: ${data.channelname || 'N/A'}`)
           .text(`Vídeo: ${data.videotitle}`)
           .text(`Status: ${data.status}`)
           .text(`Tempo Médio: ${data.averageTime}`)
           .text(`Data: ${new Date(data.createdat).toLocaleDateString()}`)
           .moveDown();
      });

      doc.end();

      stream.on('finish', () => {
        res.download(filePath, 'report.pdf', err => {
          if (err) throw err;
          fs.unlinkSync(filePath);
        });
      });
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Relatório');

      worksheet.columns = [
        { header: 'Canal', key: 'channelname', width: 25 },
        { header: 'Vídeo', key: 'videotitle', width: 35 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Tempo Médio', key: 'averageTime', width: 20 },
        { header: 'Data', key: 'createdat', width: 20 }
      ];

      reportData.forEach(item => {
        worksheet.addRow({
          channelname: item.channelname,
          videotitle: item.videotitle,
          status: item.status,
          averageTime: item.averageTime,
          createdat: new Date(item.createdat).toLocaleDateString()
        });
      });

      const filePath = path.join(exportsDir, 'report.xlsx');
      await workbook.xlsx.writeFile(filePath);
      res.download(filePath, 'report.xlsx', err => {
        if (err) throw err;
        fs.unlinkSync(filePath);
      });
    } else {
      res.status(400).json({ message: 'Formato inválido. Use "pdf" ou "excel".' });
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    res.status(500).json({
      message: 'Erro ao exportar relatório.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
