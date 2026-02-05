const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const createTransport = require('../utils/mail');
const emailTemplates = require('../utils/emailTemplates');
const mysql = require('mysql2/promise');
const config = require('../config');
const router = express.Router();

const secretKey = config.JWT_SECRET;

const pool = mysql.createPool(config.dbConfig.mysql);

const getConnection = async () => pool.getConnection();

const executeQuery = async (query, values, connection) => {
  const [rows] = await connection.query(query, values);
  return rows;
};

router.get('/companies', async (req, res) => {
    let connection;

    // Helper para converter datas com segurança
    const toISO = (value) => {
      if (!value) return null;
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d.toISOString();
    };

    try {
        connection = await getConnection();
        await connection.query('SET SESSION group_concat_max_len = 1000000');

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.per_page) || 10;
        const offset = (page - 1) * perPage;
        const search = req.query.search || '';

        const query = `
            SELECT
                CAST(c.id AS CHAR) AS id,
                c.name,
                c.created_at,
                CASE
                    WHEN c.active = 1 AND c.subscription_end >= NOW() THEN 'active'
                    ELSE 'inactive'
                END AS plan_status,
                c.subscription_end AS plan_ends_at,
                COALESCE(
                    CONCAT(
                        '[',
                        GROUP_CONCAT(
                            IF(
                                u.id IS NOT NULL,
                                JSON_OBJECT(
                                    'id', CAST(u.id AS CHAR),
                                    'name', u.name,
                                    'email', u.email,
                                    'role', u.role,
                                    'created_at', u.created_at
                                ),
                                NULL
                            )
                            ORDER BY u.created_at
                        ),
                        ']'
                    ),
                    '[]'
                ) AS users
            FROM companies c
            LEFT JOIN users u ON c.id = u.company_id
            WHERE c.name LIKE ?
            GROUP BY c.id
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?`;

        const countQuery = `
            SELECT COUNT(DISTINCT c.id) AS total
            FROM companies c
            WHERE c.name LIKE ?`;

        // Executa queries com log de contexto
        const params = [`%${search}%`, perPage, offset];
        const countParams = [`%${search}%`];
        const start = Date.now();
        const [companies] = await connection.query(query, params);
        const [countRows] = await connection.query(countQuery, countParams);
        const durationMs = Date.now() - start;

        if (durationMs > 2000) {
          console.warn('[admin.companies] Consulta lenta', { durationMs, page, perPage, search });
        }

        const total = parseInt(countRows?.[0]?.total ?? 0, 10);
        const totalPages = Math.ceil((isNaN(total) ? 0 : total) / perPage);

        const formattedCompanies = companies.map(company => {
            let usersArray = [];
            if (company.users) {
              try {
                usersArray = JSON.parse(company.users);
                if (!Array.isArray(usersArray)) usersArray = [];
              } catch (parseErr) {
                console.error('[admin.companies] Falha ao parsear JSON de users', {
                  companyId: company.id,
                  raw: String(company.users).slice(0, 500),
                  error: parseErr?.message
                });
                usersArray = [];
              }
            }

            return {
                ...company,
                created_at: toISO(company.created_at),
                plan_ends_at: toISO(company.plan_ends_at),
                users: usersArray.map(user => ({
                    ...user,
                    created_at: toISO(user.created_at)
                }))
            };
        });

        res.json({
            data: formattedCompanies,
            total,
            page,
            per_page: perPage,
            total_pages: totalPages
        });

    } catch (error) {
        // Log detalhado no servidor
        console.error('Erro ao buscar empresas:', {
          message: error?.message,
          code: error?.code,
          errno: error?.errno,
          sqlState: error?.sqlState,
          sqlMessage: error?.sqlMessage,
          stack: error?.stack,
          context: {
            page: req.query.page,
            per_page: req.query.per_page,
            search: req.query.search
          }
        });

        // Retorna detalhes úteis ao front-end para diagnóstico
        res.status(500).json({ 
            message: 'Erro ao carregar empresas',
            error: {
              code: error?.code,
              errno: error?.errno,
              sqlState: error?.sqlState,
              sqlMessage: error?.sqlMessage,
              message: error?.message
            }
        });
    } finally {
        if (connection) await connection.release();
    }
});

// Deletar empresa e todos os dados relacionados
router.delete('/companies/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, secretKey);
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }

    if (!decoded.roles?.includes('admin')) {
        return res.status(403).json({ message: 'Acesso negado' });
    }

    const companyId = req.params.id;
    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction();

        // Verifica se a empresa existe
        const [exists] = await connection.query(
          'SELECT id FROM companies WHERE id = ? LIMIT 1',
          [companyId]
        );
        if (exists.length === 0) {
          await connection.rollback();
          return res.status(404).json({ message: 'Empresa não encontrada' });
        }

        const deleted = {
          comments: 0,
          videoFreelancerRoles: 0,
          videoLogs: 0,
          videos: 0,
          freelancerRoles: 0,
          freelancers: 0,
          channels: 0,
          users: 0,
          settings: 0,
          payments: 0,
          company: 0
        };

        // Comentários (vinculados a vídeos/empresa)
        const [delComments] = await connection.query(
          'DELETE FROM comments WHERE company_id = ?',
          [companyId]
        );
        deleted.comments = delComments.affectedRows || 0;

        // Relações vídeo x freelancer (via freelancers, pois possuem company_id)
        const [delVfr] = await connection.query(
          `DELETE vfr FROM video_freelancer_roles vfr
           INNER JOIN freelancers f ON vfr.freelancer_id = f.id
           WHERE f.company_id = ?`,
          [companyId]
        );
        deleted.videoFreelancerRoles = delVfr.affectedRows || 0;

        // Logs de vídeos (tabela possui company_id)
        const [delLogs] = await connection.query(
          `DELETE FROM video_logs WHERE company_id = ?`,
          [companyId]
        );
        deleted.videoLogs = delLogs.affectedRows || 0;

        // Vídeos
        const [delVideos] = await connection.query(
          'DELETE FROM videos WHERE company_id = ?',
          [companyId]
        );
        deleted.videos = delVideos.affectedRows || 0;

        // Roles de freelancers (sem company_id, então limpar via join)
        const [delFrRoles] = await connection.query(
          `DELETE fr FROM freelancer_roles fr
           INNER JOIN freelancers f ON fr.freelancer_id = f.id
           WHERE f.company_id = ?`,
          [companyId]
        );
        deleted.freelancerRoles = delFrRoles.affectedRows || 0;

        // Freelancers
        const [delFreelancers] = await connection.query(
          'DELETE FROM freelancers WHERE company_id = ?',
          [companyId]
        );
        deleted.freelancers = delFreelancers.affectedRows || 0;

        // Canais
        const [delChannels] = await connection.query(
          'DELETE FROM channels WHERE company_id = ?',
          [companyId]
        );
        deleted.channels = delChannels.affectedRows || 0;

        // Usuários
        const [delUsers] = await connection.query(
          'DELETE FROM users WHERE company_id = ?',
          [companyId]
        );
        deleted.users = delUsers.affectedRows || 0;

        // Configurações de mensagens/WhatsApp
        const [delSettings] = await connection.query(
          'DELETE FROM settings WHERE company_id = ?',
          [companyId]
        );
        deleted.settings = delSettings.affectedRows || 0;

        // Pagamentos vinculados à empresa
        const [delPayments] = await connection.query(
          'DELETE FROM payments WHERE company_id = ?',
          [companyId]
        );
        deleted.payments = delPayments.affectedRows || 0;

        // Finalmente, a empresa
        const [delCompany] = await connection.query(
          'DELETE FROM companies WHERE id = ?',
          [companyId]
        );
        deleted.company = delCompany.affectedRows || 0;

        await connection.commit();

        return res.json({
          message: 'Empresa deletada com sucesso',
          deleted
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao deletar empresa:', {
          message: error?.message,
          code: error?.code,
          errno: error?.errno,
          sqlState: error?.sqlState,
          sqlMessage: error?.sqlMessage,
        });
        return res.status(500).json({
          message: 'Erro ao deletar empresa',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) await connection.release();
    }
});

router.post('/companies', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, secretKey);
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }

    const { name, expiration } = req.body;
    if (!name || !expiration) {
        return res.status(400).json({ message: 'Nome e data de expiração são obrigatórios' });
    }

    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction();

        const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let subdomain = base, suffix = 1;
        while (await executeQuery('SELECT id FROM companies WHERE subdomain = ?', [subdomain], connection).then(r => r.length)) {
            subdomain = `${base}-${suffix++}`;
        }

        const insertQuery = `INSERT INTO companies (name, subdomain, active, subscription_start, subscription_end) VALUES (?, ?, 1, NOW(), ?)`;
        const result = await executeQuery(insertQuery, [name, subdomain, expiration], connection);
        const companyId = result.insertId;

        const rows = await executeQuery(
            'SELECT CAST(id AS CHAR) AS id, name, subdomain, active, subscription_start, subscription_end FROM companies WHERE id = ?',
            [companyId],
            connection
        );

        await connection.commit();

        const company = rows[0];
        company.subscription_start = new Date(company.subscription_start).toISOString();
        company.subscription_end = new Date(company.subscription_end).toISOString();

        res.status(201).json(company);
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao criar empresa:', error);
        res.status(500).json({
            message: 'Erro ao criar empresa',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    } finally {
        if (connection) await connection.release();
    }
});

router.post('/companies/:id/users', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, secretKey);
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }

    const companyId = req.params.id;
    const { name, email, cpf } = req.body;
    const sanitizedCpf = cpf?.trim() || '';

    if (!decoded.roles?.includes('admin') && String(decoded.company_id) !== String(companyId)) {
        return res.status(403).json({ message: 'Acesso negado' });
    }

    if (!name || !email) {
        return res.status(400).json({ message: 'Nome e e-mail são obrigatórios' });
    }

    if (sanitizedCpf && !/^\d{11}$/.test(sanitizedCpf)) {
        return res.status(400).json({ message: 'CPF inválido' });
    }

    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction();

        const emailCheck = await executeQuery(
            'SELECT id FROM users WHERE email = ? AND company_id = ?',
            [email, companyId],
            connection
        );

        if (emailCheck.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'E-mail já cadastrado para esta empresa.' });
        }

        const userPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(userPassword, 12);

        const insertQuery = `INSERT INTO users (name, email, cpf, password, role, company_id, created_at, updated_at)
                             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        const result = await executeQuery(insertQuery, [
            name,
            email,
            sanitizedCpf,
            hashedPassword,
            'admin',
            companyId
        ], connection);

        const newUser = {
            id: result.insertId,
            name,
            email,
            cpf: sanitizedCpf,
            role: 'admin',
            created_at: new Date().toISOString()
        };

        const transporter = createTransport();

        await connection.commit();

        try {
            await transporter.sendMail({
            from: `"Equipe TubeFlow" <${createTransport.FROM_EMAIL}>`,
            to: email,
            subject: 'Credenciais de Acesso - TubeFlow',
            html: emailTemplates.companyAdminCredentials({ name, email, userPassword })
        });
        } catch (mailErr) {
            console.error('Falha ao enviar e-mail:', mailErr);
        }

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            data: newUser
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao criar usuário da empresa:', error);
        res.status(500).json({
            message: 'Erro ao criar usuário',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    } finally {
        if (connection) await connection.release();
    }
});

router.get('/companies/:id', async (req, res) => {
    const companyId = req.params.id;
    let connection;
    try {
        connection = await getConnection();
        const query = `SELECT CAST(id AS CHAR) AS id, name, main_email, plan_type, active, subscription_start, subscription_end FROM companies WHERE id = ?`;
        const rows = await executeQuery(query, [companyId], connection);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Empresa não encontrada' });
        }

        const company = rows[0];
        company.subscription_start = new Date(company.subscription_start).toISOString();
        company.subscription_end = new Date(company.subscription_end).toISOString();

        res.json(company);
    } catch (error) {
        console.error('Erro ao buscar empresa:', error);
        res.status(500).json({
            message: 'Erro ao buscar empresa',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    } finally {
        if (connection) await connection.release();
    }
});

router.get('/plans/pricing', async (req, res) => {
    let connection;
    try {
      connection = await getConnection();
      
      const query = `
        SELECT type, price, duration_months 
        FROM plans
        WHERE type IN ('monthly', 'quarterly', 'annual')
        ORDER BY duration_months
      `;
  
      const [rows] = await connection.query(query);
  
      // Mapear para o formato esperado pelo frontend
      const pricing = rows.reduce((acc, plan) => {
        const key = plan.type === 'annual' ? 'yearly' : plan.type;
        acc[key] = Number(plan.price);
        return acc;
      }, {});
  
      res.json(pricing);
  
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      res.status(500).json({ 
        message: 'Erro ao carregar preços dos planos',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    } finally {
      if (connection) await connection.release();
    }
  });

router.put('/plans/pricing', async (req, res) => {
  const { monthly, quarterly, yearly } = req.body;
  let connection;

  try {
    connection = await getConnection();
    await connection.beginTransaction();

    if ([monthly, quarterly, yearly].some(price => isNaN(price) || price < 0)) {
      throw new Error('Valores inválidos para os preços');
    }

    const planosParaSincronizar = [
      { type: 'monthly', price: monthly, duration_months: 1, description: 'Plano mensal' },
      { type: 'quarterly', price: quarterly, duration_months: 3, description: 'Plano trimestral' },
      { type: 'annual', price: yearly, duration_months: 12, description: 'Plano anual' }
    ];

    for (const plano of planosParaSincronizar) {
      const [existencia] = await connection.execute(
        'SELECT id FROM plans WHERE type = ?',
        [plano.type]
      );

      if (existencia.length === 0) {
        await connection.execute(
          'INSERT INTO plans (type, price, duration_months, description, updated_at) VALUES (?, ?, ?, ?, NOW())',
          [plano.type, plano.price, plano.duration_months, plano.description]
        );
      } else {
        await connection.execute(
          'UPDATE plans SET price = ?, duration_months = ?, description = ?, updated_at = NOW() WHERE type = ?',
          [plano.price, plano.duration_months, plano.description, plano.type]
        );
      }
    }

    await connection.commit();

    res.json({
      message: 'Preços e planos sincronizados com sucesso',
      monthly: monthly,
      quarterly: quarterly,
      yearly: yearly
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Erro ao sincronizar planos:', error);
    res.status(400).json({
      message: error.message || 'Falha na sincronização dos preços e planos',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
});


router.get('/dashboard-stats', async (req, res) => {
    let connection;
    try {
      connection = await getConnection();
      
      const query = `
          SELECT
            COUNT(*) AS total_companies,
            SUM(CASE WHEN active = 1 AND subscription_end >= CURDATE() THEN 1 ELSE 0 END) AS active_companies,
            SUM(CASE WHEN active = 0 OR subscription_end < CURDATE() THEN 1 ELSE 0 END) AS inactive_companies,
            (
              SELECT COALESCE(SUM(amount), 0)
              FROM payments
              WHERE status = 'approved'
                AND created_at >= CURDATE() - INTERVAL 1 MONTH
            ) AS last_month_revenue
          FROM companies`;
  
      const [statsRows] = await connection.query(query);
      const stats = statsRows[0];
  
      // Formatar números
      const formattedStats = {
        totalCompanies: Number(stats.total_companies),
        activeCompanies: Number(stats.active_companies),
        inactiveCompanies: Number(stats.inactive_companies),
        lastMonthRevenue: Number(stats.last_month_revenue)
      };
  
      res.json(formattedStats);
  
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ 
        message: 'Erro ao carregar dados do dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    } finally {
      if (connection) await connection.release();
    }
  });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM admin_users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      await connection.release();
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const admin = rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password);
    
    if (!passwordMatch) {
      await connection.release();
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    await connection.release();

    // Gerar token JWT
    const tokenPayload = {
      id: admin.id,
      roles: [admin.role],
      isAdmin: true
    };

    const token = jwt.sign(tokenPayload, secretKey);

    res.json({
      message: 'Login administrativo bem-sucedido.',
      token,
      roles: [admin.role],
      id: admin.id
    });

  } catch (error) {
    console.error('Erro no login administrativo:', error);
    if (connection) await connection.release();
    res.status(500).json({ message: 'Erro ao processar o login.' });
  }
});

  router.get('/admins', async (req, res) => {
    let connection;
    try {
      connection = await getConnection();
      const [admins] = await connection.query('SELECT id, name, email, role FROM admin_users');
      res.json(admins);
    } catch (error) {
      console.error('Erro ao listar admins:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    } finally {
      if (connection) await connection.release();
    }
  });
  
  // Rota para editar admin (PUT)
  router.put('/admins/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
  
    if (!name || !email) {
      return res.status(400).json({ message: 'Nome e e-mail são obrigatórios' });
    }
  
    let connection;
    try {
      connection = await getConnection();

      const [checkResult] = await connection.query(
        'SELECT id FROM admin_users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (checkResult.length > 0) {
        return res.status(400).json({ message: 'E-mail já está em uso' });
      }

      const [result] = await connection.query(
        'UPDATE admin_users SET name = ?, email = ? WHERE id = ?',
        [name, email, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Admin não encontrado' });
      }

      const updatedAdmin = { id, name, email };
      
      res.json(updatedAdmin);
    } catch (error) {
      console.error('Erro ao atualizar admin:', error);
      res.status(500).json({ message: 'Erro ao atualizar admin' });
    } finally {
      if (connection) await connection.release();
    }
  });
  
  // Rota para deletar admin (DELETE)
  router.delete('/admins/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
  
    try {
      connection = await getConnection();
  
      const [result] = await connection.query(
        'DELETE FROM admin_users WHERE id = ?',
        [id]
      );

      const affectedRows = result.affectedRows;
  
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Admin não encontrado' });
      }
  
      res.json({ message: 'Admin deletado com sucesso' });
  
    } catch (error) {
      console.error('Erro ao deletar admin:', error);
      res.status(500).json({ message: 'Erro ao deletar admin' });
    } finally {
      if (connection) await connection.release();
    }
  });

  router.post('/admins', async (req, res) => {
    const { name, email, role } = req.body;
    let connection;
    let insertResult;
    let generatedPassword;

    try {
        if (!name || !email) {
            return res.status(400).json({
                message: 'Nome e e-mail são obrigatórios.',
                errorCode: 'MISSING_REQUIRED_FIELDS'
            });
        }

        connection = await getConnection();
        await connection.beginTransaction();

        // Verificar e-mail existente
        const [emailCheck] = await connection.query(
            'SELECT id FROM admin_users WHERE email = ?',
            [email]
        );

        if (emailCheck.length > 0) {
            return res.status(409).json({
                message: 'E-mail já cadastrado no sistema.',
                errorCode: 'DUPLICATE_EMAIL'
            });
        }

        // Geração de senha segura
        generatedPassword = crypto.randomBytes(12).toString('hex');
        const hashedPassword = await bcrypt.hash(generatedPassword, 12);

        // Inserir novo admin
        const userRole = role || 'admin';

        const insertQuery = `INSERT INTO admin_users
                (name, email, password, role, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())`;

        const insertParams = [name, email, hashedPassword, userRole];
        [insertResult] = await connection.query(insertQuery, insertParams);

        await connection.commit();
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Erro ao desfazer transação:', rollbackError);
            }
        }
        console.error('Erro completo na criação de admin:', {
            error: error.message,
            stack: error.stack,
            params: { name, email: email?.replace(/./g, '*') }
        });

        return res.status(500).json({
            message: 'Falha no processo de criação',
            errorCode: 'ADMIN_CREATION_FAILURE',
            details: error.message,
            error: process.env.NODE_ENV === 'development' ? {
                code: error.code,
                detail: error.detail,
                stack: error.stack
            } : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.release();
            } catch (releaseError) {
                console.error('Erro ao liberar conexão:', releaseError);
            }
        }
    }

    let emailStatus = `Credenciais enviadas para ${email}`;
    try {
        const transporter = createTransport();
        await transporter.sendMail({
            from: `"Suporte Admin" <${createTransport.FROM_EMAIL}>`,
            to: email,
            subject: 'Credenciais de Acesso Administrativo',
            html: emailTemplates.newAdminCredentials({ email, generatedPassword })
        });
    } catch (emailError) {
        console.error('Erro ao enviar e-mail de credenciais:', emailError);
        emailStatus = `Falha ao enviar credenciais: ${emailError.message || 'erro desconhecido'}`;
    }

    const newAdmin = { id: insertResult.insertId };

    res.status(201).json({
        message: 'Administrador criado com sucesso',
        data: {
            id: newAdmin.id,
            email: email,
            createdAt: newAdmin.created_at
        },
        emailStatus
    });
  });

module.exports = router;
