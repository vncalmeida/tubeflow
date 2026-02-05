const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { Pool: PgPool } = require('pg');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const config = require('../config');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 

const dbType = config.dbConfig.dbType;
const mysqlPool = mysql.createPool(config.dbConfig.mysql);
const pgPool = new PgPool(config.dbConfig.postgres);

const getConnection = async () => {
  if (dbType === 'postgres') return await pgPool.connect();
  return await mysqlPool.getConnection();
};

// Tipos de planos
const PLAN_TYPES = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual'
};

const MP_API_URL = 'https://api.mercadopago.com/v1';
const MP_ACCESS_TOKEN = "APP_USR-124639488725733-022019-59397774534a5f0f347f1bc940937a2e-1254217648";
const MP_WEBHOOK_SECRET = "9dcee93ad0b999bc005ed723554e8f7cdd7021d036f1f043a39ee966af668dc3";

const mpHeaders = {
  'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'X-Idempotency-Key': ''
};



router.post('/create-payment', async (req, res) => {
  let client;
  try {
    client = await getConnection();
    let ok;
    if (dbType === 'postgres') {
      const testRes = await client.query('SELECT 1 + 1 AS result');
      ok = testRes.rows[0].result === 2;
    } else {
      const [rows] = await client.query('SELECT 1 + 1 AS result');
      ok = rows[0].result === 2;
    }
    console.log('Teste de conexão bem-sucedido:', ok);

    const { paymentMethod, plan, userData } = req.body;

    if (!plan || !plan.type) {
      return res.status(400).json({
        error: 'Plano inválido',
        message: 'Tipo de plano não especificado'
      });
    }

    if (!validatePaymentData(req.body)) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Verifique os campos obrigatórios (CPF, email, tipo de plano)'
      });
    }

    const dbPlan = await getPlanFromDatabase(client, plan.type.toLowerCase());

    if (paymentMethod === 'pix') {
      return await handlePixPayment(client, res, dbPlan, userData);
    }

    return res.status(400).json({
      error: 'Método não suportado',
      supportedMethods: ['pix']
    });

  } catch (error) {
    console.error('Erro no processamento:', error);
    const statusCode = error.message.includes('Plano') ? 400 : 500;
    return res.status(statusCode).json({
      error: error.message.includes('Plano') ? error.message : 'Erro interno',
      details: error.response?.data || error.message
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/payments/:id/status', async (req, res) => {
  try {
    const payment = await getPaymentDetails(req.params.id);

    const paymentQuery = dbType === 'postgres'
      ? `SELECT plan_type, amount, user_email, company_id, subscription_updated FROM payments WHERE mercadopago_id = $1`
      : `SELECT plan_type, amount, user_email, company_id, subscription_updated FROM payments WHERE mercadopago_id = ?`;
    const paymentResult = await req.db.query(paymentQuery, [payment.id]);
    const paymentData = dbType === 'postgres'
      ? paymentResult.rows[0] || {}
      : paymentResult[0][0] || {};
    const userEmail = paymentData.user_email;

    // Verificação de existência do usuário e obtenção do company_id
    let userExists = false;
    let companyId = paymentData.company_id; // Usar company_id do pagamento como valor inicial
    
    if (userEmail) {
      const uQuery = dbType === 'postgres'
        ? 'SELECT id, company_id FROM users WHERE email = $1'
        : 'SELECT id, company_id FROM users WHERE email = ?';
      const uRes = await req.db.query(uQuery, [userEmail]);
      if (dbType === 'postgres') {
        userExists = uRes.rowCount > 0;
        if (userExists) companyId = uRes.rows[0].company_id;
      } else {
        userExists = uRes[0].length > 0;
        if (userExists) companyId = uRes[0][0].company_id;
      }
    }

    // Lógica de atualização de assinatura (condição corrigida)
    if (payment.status === 'approved' && userExists && companyId) {
      const client = await getConnection();

      try {
        if (dbType === 'postgres') await client.query('BEGIN');
        else await client.beginTransaction();

        const rawPlanType = paymentData.plan_type?.toLowerCase() || 'monthly';
        const pQuery = dbType === 'postgres'
          ? 'SELECT duration_months FROM plans WHERE LOWER(type) = $1'
          : 'SELECT duration_months FROM plans WHERE LOWER(type) = ?';
        const pRes = await client.query(pQuery, [rawPlanType]);
        const pRows = dbType === 'postgres' ? pRes.rows : pRes[0];
        let durationMonths = pRows.length > 0 ? pRows[0].duration_months : 1;

        if (dbType === 'postgres') {
          const interval = `${durationMonths} months`;
          const companyUpdate = await client.query(
            `UPDATE companies
             SET
               subscription_end = CASE
                 WHEN subscription_end IS NULL THEN NOW() + $1::interval
                 ELSE GREATEST(subscription_end, NOW()) + $1::interval
               END,
               subscription_start = COALESCE(
                 CASE WHEN subscription_end < NOW() THEN NOW() ELSE NULL END,
                 subscription_start
               )
             WHERE id = $2
             RETURNING *`,
            [interval, companyId]
          );

          if (companyUpdate.rowCount === 0) {
            throw new Error(`Empresa ID ${companyId} não encontrada`);
          }

          if (!paymentData.company_id) {
            await client.query(
              'UPDATE payments SET company_id = $1 WHERE mercadopago_id = $2',
              [companyId, payment.id]
            );
          }

          await client.query(
            'UPDATE payments SET subscription_updated = TRUE WHERE mercadopago_id = $1',
            [payment.id]
          );

          if (dbType === 'postgres') await client.query('COMMIT');
          else await client.commit();

          console.log('Assinatura renovada:', {
            companyId,
            newEndDate: companyUpdate.rows[0].subscription_end
          });

        } else {
          await client.query(
            `UPDATE companies
             SET
               subscription_end = CASE
                 WHEN subscription_end IS NULL THEN DATE_ADD(NOW(), INTERVAL ? MONTH)
                 ELSE DATE_ADD(GREATEST(subscription_end, NOW()), INTERVAL ? MONTH)
               END,
               subscription_start = IF(subscription_end < NOW(), NOW(), subscription_start)
             WHERE id = ?`,
            [durationMonths, durationMonths, companyId]
          );

          if (!paymentData.company_id) {
            await client.query(
              'UPDATE payments SET company_id = ? WHERE mercadopago_id = ?',
              [companyId, payment.id]
            );
          }

          await client.query(
            'UPDATE payments SET subscription_updated = TRUE WHERE mercadopago_id = ?',
            [payment.id]
          );

          await client.commit();

          console.log('Assinatura renovada:', { companyId });
        }

      } catch (updateError) {
        if (dbType === 'postgres') await client.query('ROLLBACK');
        else await client.rollback();
        console.error('Erro na transação:', {
          paymentId: payment.id,
          companyId,
          error: updateError.message
        });
        throw new Error(`Falha na renovação: ${updateError.message}`);
      } finally {
        client.release();
      }
    }

    // Montar resposta
    const responseData = {
      payment_id: payment.id,
      status: payment.status,
      company_id: companyId, // Retornar company_id correto
      user_exists: userExists,
      subscription_updated: paymentData.subscription_updated,
      plan: paymentData.plan_type, // <--- Campo novo
      amount: paymentData.amount,  
    };

    res.json(responseData);

  } catch (error) {
    console.error('Erro final:', error.message);
    res.status(500).json({
      error: 'Falha na verificação',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

router.post('/create-account', async (req, res) => {
  const { email, companyName, password, paymentId } = req.body;
  const client = await getConnection();

  try {
    if (dbType === 'postgres') await client.query('BEGIN');
    else await client.beginTransaction();

    // Validação completa dos campos
    const requiredFields = ['email', 'companyName', 'password', 'paymentId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      if (dbType === 'postgres') await client.query('ROLLBACK');
      else await client.rollback();
      return res.status(400).json({
        error: 'Dados incompletos',
        missing_fields: missingFields,
        example_correction: {
          email: "usuario@empresa.com",
          companyName: "Empresa Exemplo Ltda",
          password: "SenhaSegura@123",
          paymentId: "PAY-123456789"
        }
      });
    }

    // Verificação de empresa existente
    const companyCheckQuery = dbType === 'postgres'
      ? 'SELECT id FROM companies WHERE name = $1'
      : 'SELECT id FROM companies WHERE name = ?';
    const companyCheck = await client.query(companyCheckQuery, [companyName]);
    const companyExists = dbType === 'postgres' ? companyCheck.rowCount > 0 : companyCheck[0].length > 0;

    if (companyExists) {
      if (dbType === 'postgres') await client.query('ROLLBACK');
      else await client.rollback();
      return res.status(409).json({
        error: 'Empresa já registrada',
        suggested_actions: [
          "Utilize um nome comercial diferente",
          "Entre em contato para fusão de contas"
        ],
        contact_support: "suporte@tubeflow.com"
      });
    }

    // Obter detalhes do pagamento
    const paymentDetailsQuery = dbType === 'postgres'
      ? `SELECT plan_type, amount FROM payments WHERE mercadopago_id = $1 FOR UPDATE`
      : `SELECT plan_type, amount FROM payments WHERE mercadopago_id = ? FOR UPDATE`;
    const paymentDetails = await client.query(paymentDetailsQuery, [paymentId]);
    const paymentRows = dbType === 'postgres' ? paymentDetails.rows : paymentDetails[0];

    if (paymentRows.length === 0) {
      if (dbType === 'postgres') await client.query('ROLLBACK');
      else await client.rollback();
      return res.status(404).json({
        error: 'Pagamento não localizado',
        actions: [
          "Verifique o ID do pagamento",
          "Aguarde 15 minutos para processamento"
        ]
      });
    }

    // Configurar intervalo inicial
    const planData = paymentRows[0];
    const intervalMap = {
      monthly: '1 month',
      quarterly: '3 months',
      annual: '1 year'
    };
    
    const planType = planData.plan_type?.toLowerCase() in intervalMap 
      ? planData.plan_type.toLowerCase() 
      : 'monthly';
    
    const subscriptionInterval = intervalMap[planType];

    // Criar subdomínio único
    const cleanCompanyName = companyName
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 20);
    
    const subdomainSuffix = Math.random().toString(36).slice(2, 6);
    const finalSubdomain = `${cleanCompanyName}-${subdomainSuffix}`;

    // Inserir empresa com intervalo correto
    let companyData;
    let companyId;
    if (dbType === 'postgres') {
      const companyResult = await client.query(
        `INSERT INTO companies (
          name,
          subdomain,
          active,
          subscription_start,
          subscription_end
        ) VALUES ($1, $2, TRUE, NOW(), NOW() + $3::interval)
        RETURNING id, subdomain, subscription_start, subscription_end`,
        [companyName, finalSubdomain, subscriptionInterval]
      );
      companyData = companyResult.rows[0];
      companyId = companyData.id;
    } else {
      const monthsMap = { monthly: 1, quarterly: 3, annual: 12 };
      const months = monthsMap[planType] || 1;
      const insertCompany = `INSERT INTO companies (
          name, subdomain, active, subscription_start, subscription_end
        ) VALUES (?, ?, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL ? MONTH))`;
      const [result] = await client.query(insertCompany, [companyName, finalSubdomain, months]);
      companyId = result.insertId;
      const [rows] = await client.query(
        'SELECT id, subdomain, subscription_start, subscription_end FROM companies WHERE id = ?',
        [companyId]
      );
      companyData = rows[0];
    }

    // Verificar usuário existente na nova empresa
    const userCheckQuery = dbType === 'postgres'
      ? `SELECT id FROM users WHERE email = $1 AND company_id = $2`
      : `SELECT id FROM users WHERE email = ? AND company_id = ?`;
    const userCheck = await client.query(userCheckQuery, [email, companyId]);
    const userExists = dbType === 'postgres' ? userCheck.rowCount > 0 : userCheck[0].length > 0;

    if (userExists) {
      if (dbType === 'postgres') await client.query('ROLLBACK');
      else await client.rollback();
      return res.status(409).json({
        error: 'Colaborador já registrado',
        resolution_steps: [
          "Solicite acesso ao administrador da empresa",
          "Utilize a recuperação de senha"
        ]
      });
    }

    // Criptografia de senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário admin
    const userInsertQuery = dbType === 'postgres'
      ? `INSERT INTO users (company_id, name, email, password, role)
         VALUES ($1, $2, $3, $4, 'admin') RETURNING id, created_at`
      : `INSERT INTO users (company_id, name, email, password, role)
         VALUES (?, ?, ?, ?, 'admin')`;
    const userResult = await client.query(
      userInsertQuery,
      [companyId, 'admin', email, hashedPassword]
    );
    const userRow = dbType === 'postgres' ? userResult.rows[0] : { id: userResult[0].insertId, created_at: new Date() };

    // Vincular pagamento à empresa
    const paymentUpdateQuery = dbType === 'postgres'
      ? `UPDATE payments SET company_id = $1, subscription_updated = TRUE, updated_at = NOW() WHERE mercadopago_id = $2 RETURNING id`
      : `UPDATE payments SET company_id = ?, subscription_updated = TRUE, updated_at = NOW() WHERE mercadopago_id = ?`;
    const paymentUpdate = await client.query(paymentUpdateQuery, [companyId, paymentId]);
    const affected = dbType === 'postgres' ? paymentUpdate.rowCount : paymentUpdate[0].affectedRows;

    if (affected === 0) {
      throw new Error(`Falha ao vincular pagamento ${paymentId} à empresa ${companyId}`);
    }

    if (dbType === 'postgres') await client.query('COMMIT');
    else await client.commit();

    // Gerar token JWT seguro
    const tokenPayload = {
      uid: userRow.id,
      cid: companyId,
      rol: 'admin',
      sub: finalSubdomain,
      plan: planType
    };

    const token = jwt.sign(
      tokenPayload,
      config.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'api.tubeflow',
        audience: 'client.tubeflow',
        algorithm: 'HS256'
      }
    );

    // Montar resposta final
    res.status(201).json({
      success: true,
      authentication: {
        token: {
          value: token,
          type: 'Bearer',
          expires_in: '7d'
        },
        renewal_info: {
          next_renewal: companyData.subscription_end,
          plan_type: planType
        }
      },
      company: {
        id: companyId,
        name: companyName,
        subdomain: companyData.subdomain,
        subscription_status: {
          start: companyData.subscription_start,
          end: companyData.subscription_end,
          active: true
        }
      },
      user: {
        id: userRow.id,
        email: email,
        role: 'admin',
        initial_setup: true
      }
    });

  } catch (error) {
    if (dbType === 'postgres') await client.query('ROLLBACK');
    else await client.rollback();
    
    const errorId = uuidv4();
    console.error(`Erro [${errorId}] em create-account:`, {
      message: error.message,
      stack: error.stack,
      body: req.body,
      time: new Date().toISOString()
    });

    const response = {
      error: 'Falha no processo de criação',
      reference_id: errorId,
      user_action: [
        "Verifique os dados fornecidos",
        "Tente novamente em 5 minutos"
      ]
    };

    if (error.code === '23505') {
      response.error = 'Conflito de dados únicos';
      response.details = error.constraint.includes('email') 
        ? 'E-mail já registrado' 
        : 'Identificador único duplicado';
    }

    res.status(error.statusCode || 500).json(response);
  } finally {
    client.release();
  }
});

async function updatePaymentStatus(pool, paymentInfo) {
  const queryText = dbType === 'postgres'
    ? `UPDATE payments
         SET status = $1, updated_at = NOW(), attempts = attempts + 1
       WHERE mercadopago_id = $2 RETURNING *`
    : `UPDATE payments
         SET status = ?, updated_at = NOW(), attempts = attempts + 1
       WHERE mercadopago_id = ?`;
  try {
    const result = await pool.query(queryText, [
      paymentInfo.status.toLowerCase(),
      paymentInfo.id
    ]);
    if (dbType === 'postgres') {
      if (result.rowCount === 0) throw new Error(`Pagamento não encontrado: ${paymentInfo.id}`);
      return { ...result.rows[0], mercadopago_id: paymentInfo.id };
    }
    if (result[0].affectedRows === 0) throw new Error(`Pagamento não encontrado: ${paymentInfo.id}`);
    return { mercadopago_id: paymentInfo.id };
  } catch (error) {
    console.error('Erro na atualização:', error.message);
    throw new Error(`Falha na atualização: ${error.message}`);
  }
}
// Atualize a função getPaymentDetails
async function getPaymentDetails(paymentId) {
  try {
    const response = await axios.get(`${MP_API_URL}/payments/${paymentId}`, {
      headers: mpHeaders,
      timeout: 5000
    });
    const statusMapping = {
      pending: 'pending',
      approved: 'approved',
      authorized: 'authorized',
      in_process: 'in_analysis',
      in_mediation: 'in_dispute',
      rejected: 'rejected',
      cancelled: 'canceled',
      refunded: 'refunded',
      charged_back: 'chargeback'
    };
    const pQuery = dbType === 'postgres'
      ? 'SELECT plan_type FROM payments WHERE mercadopago_id = $1'
      : 'SELECT plan_type FROM payments WHERE mercadopago_id = ?';
    const dbPayment = await (dbType === 'postgres'
      ? pgPool.query(pQuery, [paymentId])
      : mysqlPool.query(pQuery, [paymentId]));
    const planRow = dbType === 'postgres' ? dbPayment.rows[0] : dbPayment[0][0];
    return {
      ...response.data,
      id: response.data.id,
      status: statusMapping[response.data.status] || 'unknown',
      amount: response.data.transaction_amount,
      plan_type: planRow?.plan_type || 'unknown'
    };
  } catch (error) {
    console.error('Falha ao obter detalhes do pagamento:', {
      paymentId,
      status: error.response?.status,
      data: error.response?.data
    });
    throw new Error(`Erro na recuperação de dados: ${error.message}`);
  }
}

router.post('/pix/webhook', express.json(), async (req, res) => {
  try {
    const pool = req.db;

    if (!verifyWebhookSignature(req)) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const paymentId = req.body.data?.id;
    if (!paymentId) return res.status(400).json({ error: 'ID de pagamento ausente' });

    const paymentInfo = await getPaymentDetails(paymentId);
    await updatePaymentStatus(pool, paymentInfo);

    return res.json({ status: 'success' });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

async function getPlanFromDatabase(client, planType) {
  try {
    const queryPg = {
      text: 'SELECT type, price::float, duration_months, description FROM plans WHERE LOWER(type) = $1',
      values: [planType]
    };
    const queryMy = 'SELECT type, price, duration_months, description FROM plans WHERE LOWER(type) = ?';

    const result = dbType === 'postgres'
      ? await client.query(queryPg)
      : await client.query(queryMy, [planType]);

    const rows = dbType === 'postgres' ? result.rows : result[0];

    if (!rows || rows.length === 0) {
      throw new Error(`Plano '${planType}' não encontrado`);
    }

    return rows[0];
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    throw error;
  }
}

function getPlanPeriod(durationMonths) {
  const periods = {
    1: 'monthly',
    3: 'quarterly',
    12: 'annual'
  };
  return periods[durationMonths] || 'custom';
}

async function handlePixPayment(client, res, dbPlan, userData) {
  try {
    if (!config.baseUrl) {
      throw new Error('Configuração baseUrl não encontrada');
    }

    const transactionAmount = Number(dbPlan.price);
    if (isNaN(transactionAmount)) {
      throw new Error(`Valor do plano inválido: ${dbPlan.price}`);
    }

    if (!userData?.cpf || !userData?.email) {
      throw new Error('Dados do usuário incompletos');
    }

    const externalReference = uuidv4();
    const pixPayload = {
      transaction_amount: transactionAmount,
      payment_method_id: "pix",
      payer: {
        email: userData.email,
        first_name: userData.name?.split(' ')[0] || '',
        last_name: userData.name?.split(' ').slice(1).join(' ') || '',
        identification: {
          type: "CPF",
          number: userData.cpf
        }
      },
      notification_url: `${config.baseUrl}/pix/webhook`,
      description: `Assinatura ${dbPlan.type} - ${dbPlan.description || 'Plano Premium'}`,
      external_reference: externalReference,
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      binary_mode: true
    };

    const mpResponse = await axios.post(`${MP_API_URL}/payments`, pixPayload, {
      headers: {
        ...mpHeaders,
        'X-Idempotency-Key': externalReference,
        'X-Debug-Mode': 'true'
      },
      timeout: 10000
    });

    await registerPayment(
      userData.email,
      userData.cpf,
      mpResponse.data.id,
      transactionAmount,
      'pending',
      'pix',
      externalReference,
      dbPlan.type
    );

    const transactionData = mpResponse.data.point_of_interaction?.transaction_data || {};
    const responseData = {
      payment_id: mpResponse.data.id,
      qr_code: transactionData.qr_code || '',
      qr_code_base64: transactionData.qr_code_base64 || '',
      ticket_url: transactionData.ticket_url || '',
      expiration_date: mpResponse.data.date_of_expiration,
      external_reference: externalReference,
      payment_details: {
        amount: transactionAmount,
        payer_name: userData.name,
        payer_email: userData.email,
        payer_cpf: userData.cpf,
        plan_type: dbPlan.type,
        created_at: new Date().toISOString()
      }
    };

    console.log('Pagamento PIX registrado:', JSON.stringify({
      paymentId: responseData.payment_id,
      amount: transactionAmount,
      user: userData.email
    }, null, 2));

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Erro completo no PIX:', {
      errorMessage: error.message,
      stack: error.stack,
      requestData: error.config?.data,
      responseStatus: error.response?.status,
      responseData: error.response?.data
    });

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error === 'bad_request'
      ? 'Erro na validação dos dados'
      : 'Falha no processamento do pagamento';

    return res.status(statusCode).json({
      error: errorMessage,
      details: error.response?.data || error.message
    });
  }
}

function validatePaymentData(data) {
  const cpfRegex = /^\d{11}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.userData || !data.plan) return false;

  return cpfRegex.test(data.userData.cpf) &&
    emailRegex.test(data.userData.email) &&
    Object.values(PLAN_TYPES).includes(data.plan.type?.toLowerCase());
}

function verifyWebhookSignature(req) {
  try {
    const signatureHeader = req.headers['x-signature'];
    if (!signatureHeader || !MP_WEBHOOK_SECRET) return false;

    const signatureParts = signatureHeader.split(',');
    const timestamp = signatureParts.find(part => part.startsWith('ts='))?.split('=')[1];
    const receivedHash = signatureParts.find(part => part.startsWith('v1='))?.split('=')[1];

    if (!timestamp || !receivedHash) return false;

    const payload = `${timestamp}.${JSON.stringify(req.body)}`;
    const generatedHash = crypto
      .createHmac('sha256', MP_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(generatedHash),
      Buffer.from(receivedHash)
    );

  } catch (error) {
    console.error('Erro na verificação de segurança:', error);
    return false;
  }
}

async function registerPayment(
  userEmail,
  userCpf,
  mercadopagoId,
  amount,
  status,
  paymentMethod,
  externalReference,
  planType
) {
  console.log('Registrando pagamento com:', {
    planType,
    amount
  });

  const pool = dbType === 'postgres' ? pgPool : mysqlPool;
  const queryText = dbType === 'postgres'
    ? `INSERT INTO payments (
        user_email, user_cpf, mercadopago_id, amount, status,
        payment_method, external_reference, plan_type, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`
    : `INSERT INTO payments (
        user_email, user_cpf, mercadopago_id, amount, status,
        payment_method, external_reference, plan_type, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

  const values = [
    userEmail,
    userCpf,
    mercadopagoId,
    amount,
    status,
    paymentMethod,
    externalReference,
    planType
  ];

  try {
    const result = await pool.query(queryText, values);
    if (dbType === 'postgres') {
      return result.rows[0];
    }
    return { id: result[0].insertId };
  } catch (error) {
    console.error('Erro ao registrar pagamento:', {
      errorMessage: error.message,
      stack: error.stack,
      query: queryText,
      values: values
    });
    throw new Error(`Falha no registro: ${error.message}`);
  }
}

async function createUserIfNotExists(client, userData) {
  try {
    const selectQuery = dbType === 'postgres'
      ? `SELECT * FROM users WHERE email = $1 OR cpf = $2 LIMIT 1`
      : `SELECT * FROM users WHERE email = ? OR cpf = ? LIMIT 1`;
    const existingUser = await client.query(selectQuery, [userData.email, userData.cpf]);
    const rows = dbType === 'postgres' ? existingUser.rows : existingUser[0];

    if (rows.length > 0) {
      return rows[0];
    }

    const insertQuery = dbType === 'postgres'
      ? `INSERT INTO users (email, cpf, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *`
      : `INSERT INTO users (email, cpf, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`;
    const insertRes = await client.query(insertQuery, [userData.email, userData.cpf]);

    return dbType === 'postgres' ? insertRes.rows[0] : { id: insertRes[0].insertId };

  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    throw new Error(`Falha na criação: ${error.message}`);
  }
}

module.exports = router;
