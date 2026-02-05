const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { Parser } = require('json2csv');
const mysql = require('mysql2/promise');
const config = require('../config');
const ExcelJS = require('exceljs');

const mysqlPool = mysql.createPool(config.dbConfig.mysql);

async function getConnection() {
  return await mysqlPool.getConnection();
}

router.get('/channels2', async (req, res) => {
  let client;
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório.' });
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
    if (client) await client.release();
  }
});

router.get('/freelancers3', async (req, res) => {
  let client;
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório.' });
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
    if (client) await client.release();
  }
});

router.get('/logs2', async (req, res) => {
  let client;
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      channelId,
      freelancerId,
      companyId
    } = req.query;

    if (!companyId) {
      return res.status(400).json({
        message: "Company ID é obrigatório",
        details: "Parâmetro 'companyId' não fornecido na query string"
      });
    }

    client = await getConnection();

    let query = `
      SELECT 
        l.id,
        l.video_id AS videoId,
        v.title AS videoTitle,
        c.name AS channelName,
        f.name AS freelancerName,
        l.from_status AS previousStatus,
        l.to_status AS newStatus,
        l.created_at AS timestamp
      FROM video_logs l
      LEFT JOIN videos v ON l.video_id = v.id
      LEFT JOIN channels c ON v.channel_id = c.id
      LEFT JOIN freelancers f ON l.freelancer_id = f.id
      WHERE v.company_id = ?
        AND l.is_user = false
    `;
    const params = [companyId];

    if (startDate) {
      params.push(startDate);
      query += ' AND l.created_at >= ?';
    }
    if (endDate) {
      params.push(endDate);
      query += ' AND l.created_at <= ?';
    }
    if (channelId) {
      params.push(channelId);
      query += ' AND v.channel_id = ?';
    }
    if (freelancerId) {
      params.push(freelancerId);
      query += ' AND l.freelancer_id = ?';
    }

    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const [logsRows] = await client.execute(query, params);

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM video_logs l
      LEFT JOIN videos v ON l.video_id = v.id
      WHERE v.company_id = ?
        AND l.is_user = false
    `;
    const countParams = [companyId];

    if (startDate) {
      countParams.push(startDate);
      countQuery += ' AND l.created_at >= ?';
    }
    if (endDate) {
      countParams.push(endDate);
      countQuery += ' AND l.created_at <= ?';
    }
    if (channelId) {
      countParams.push(channelId);
      countQuery += ' AND v.channel_id = ?';
    }
    if (freelancerId) {
      countParams.push(freelancerId);
      countQuery += ' AND l.freelancer_id = ?';
    }

    const [countRows] = await client.execute(countQuery, countParams);
    const total = countRows[0].total || 0;

    res.json({
      logs: logsRows,
      total: Number(total)
    });
  } catch (error) {
    console.error('Erro detalhado:', {
      message: error.message
    });
    res.status(500).json({
      message: 'Erro ao buscar logs',
      error: {
        code: error.code || 'DB_ERROR',
        detail: error.message,
        hint: 'Verifique os parâmetros de filtragem e datas',
        timestamp: new Date().toISOString()
      }
    });
  } finally {
    if (client) await client.release();
  }
});

router.get('/stats', async (req, res) => {
  let client;
  try {
    const { startDate, endDate, channelId, freelancerId, companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({
        message: "Parametro 'companyId' é obrigatório"
      });
    }

    client = await getConnection();
    let baseQuery = `
      SELECT
        f.id,
        f.name,
        COUNT(vl.id) AS tasksCompleted,
        COALESCE(AVG(vl.duration), 0) AS averageTime,
        SUM(CASE WHEN vl.duration > 86400 THEN 1 ELSE 0 END) AS delays
      FROM freelancers f
      LEFT JOIN video_logs vl
        ON f.id = vl.freelancer_id
        AND vl.from_status LIKE '%_Em_Andamento'
        AND vl.to_status LIKE '%_Concluído'
        AND vl.is_user = false
      LEFT JOIN videos v ON vl.video_id = v.id
      WHERE f.company_id = ?
    `;
    const params = [companyId];
    const addCond = (value, clause) => {
      if (value) {
        params.push(value);
        return ` AND ${clause}`;
      }
      return '';
    };

    let conditions = '';
    conditions += addCond(startDate, 'vl.created_at >= ?');
    conditions += addCond(endDate, 'vl.created_at <= ?');
    conditions += addCond(channelId, 'v.channel_id = ?');
    conditions += addCond(freelancerId, 'f.id = ?');

    const groupBy = ' GROUP BY f.id, f.name';

    const [statsRows] = await client.execute(baseQuery + conditions + groupBy, params);

    const totalsQuery = `
      SELECT
        COUNT(vl.id) AS totalTasks,
        COALESCE(AVG(vl.duration), 0) AS averageTimeTotal,
        SUM(CASE WHEN vl.duration > 86400 THEN 1 ELSE 0 END) AS delaysTotal
      FROM freelancers f
      LEFT JOIN video_logs vl
        ON f.id = vl.freelancer_id
        AND vl.from_status LIKE '%_Em_Andamento'
        AND vl.to_status LIKE '%_Concluído'
        AND vl.is_user = false
      LEFT JOIN videos v ON vl.video_id = v.id
      WHERE f.company_id = ?
    `;
    const [totalsRows] = await client.execute(
      totalsQuery + conditions,
      [companyId, ...params.slice(1)]
    );
    const totals = totalsRows[0];

    const formatTime = seconds => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h > 0 ? `${h}h ` : ''}${m}m`;
    };

    const stats = statsRows.map(row => ({
      id: row.id,
      name: row.name,
      tasksCompleted: Number(row.tasksCompleted),
      averageTime: Number(row.averageTime),
      delays: Number(row.delays),
      averageTimeFormatted: formatTime(row.averageTime)
    }));

    res.json({
      stats,
      totals: {
        tasks: Number(totals.totalTasks),
        averageTime: Number(totals.averageTimeTotal),
        delays: Number(totals.delaysTotal),
        averageTimeFormatted: formatTime(Number(totals.averageTimeTotal))
      }
    });
  } catch (error) {
    console.error('Erro em /stats:', error);
    res.status(500).json({
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  } finally {
    if (client) await client.release();
  }
});

router.get('/export', async (req, res) => {
  let client;
  try {
    const {
      startDate,
      endDate,
      channelId,
      freelancerId,
      type,
      format = 'csv',
      companyId
    } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID é obrigatório.' });
    }

    client = await getConnection();
    let query = '';
    let headers = [];
    let filename = '';
    const params = [companyId];

    if (type === 'logs') {
      query = `
        SELECT 
          l.created_at AS DataHora,
          v.title AS TituloDoVideo,
          c.name AS NomeDoCanal,
          f.name AS NomeDoFreelancer,
          l.from_status AS StatusAnterior,
          l.to_status AS StatusAtual
        FROM video_logs l
        LEFT JOIN videos v ON l.video_id = v.id
        LEFT JOIN channels c ON v.channel_id = c.id
        LEFT JOIN freelancers f ON l.freelancer_id = f.id
        WHERE v.company_id = ?
      `;
      headers = ['DataHora', 'TituloDoVideo', 'NomeDoCanal', 'NomeDoFreelancer', 'StatusAnterior', 'StatusAtual'];
      filename = 'logs';
    } else if (type === 'stats') {
      query = `
        SELECT 
          f.name AS NomeDoFreelancer,
          COUNT(vl.id) AS TarefasCompletadas,
          COALESCE(AVG(vl.duration), 0) AS TempoMedioSegundos,
          SUM(CASE WHEN vl.duration > 86400 THEN 1 ELSE 0 END) AS Atrasos
        FROM freelancers f
        LEFT JOIN video_logs vl
          ON f.id = vl.freelancer_id
          AND vl.from_status LIKE '%_Em_Andamento'
          AND vl.to_status LIKE '%_Concluído'
          AND vl.is_user = false
        LEFT JOIN videos v ON vl.video_id = v.id
        WHERE f.company_id = ?
      `;
      headers = ['NomeDoFreelancer', 'TarefasCompletadas', 'TempoMedioSegundos', 'Atrasos'];
      filename = 'stats';
    } else {
      return res.status(400).json({ message: 'Tipo de exportação inválido.' });
    }

    if (startDate) {
      params.push(startDate);
      query += ' AND created_at >= ?';
    }
    if (endDate) {
      params.push(endDate);
      query += ' AND created_at <= ?';
    }
    if (channelId) {
      params.push(channelId);
      query += ' AND channel_id = ?';
    }
    if (freelancerId) {
      params.push(freelancerId);
      query += ' AND freelancer_id = ?';
    }

    const [rows] = await client.execute(query, params);

    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    if (format === 'csv') {
      const parser = new Parser({ fields: headers });
      const csv = parser.parse(rows);
      const filePath = path.join(exportsDir, `${filename}.csv`);
      fs.writeFileSync(filePath, csv);
      res.download(filePath, `${filename}.csv`, err => {
        if (err) throw err;
        fs.unlinkSync(filePath);
      });
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(filename);
      sheet.columns = headers.map(h => ({ header: h, key: h, width: 20 }));
      rows.forEach(row => sheet.addRow(row));
      const filePath = path.join(exportsDir, `${filename}.xlsx`);
      await workbook.xlsx.writeFile(filePath);
      res.download(filePath, `${filename}.xlsx`, err => {
        if (err) throw err;
        fs.unlinkSync(filePath);
      });
    } else {
      res.status(400).json({ message: 'Formato inválido. Use "csv" ou "excel".' });
    }
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({
      message: 'Erro ao exportar dados.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) await client.release();
  }
});

module.exports = router;
