const express = require('express');
const mysql = require('mysql2/promise');
const { Pool: PgPool } = require('pg');
const config = require('../config');
const router = express.Router();

const dbType = config.dbConfig.dbType;
const mysqlPool = mysql.createPool(config.dbConfig.mysql);
const pgPool = new PgPool(config.dbConfig.postgres);

const getConnection = async () => {
  if (dbType === 'postgres') return await pgPool.connect();
  return await mysqlPool.getConnection();
};

router.get('/plans', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const query = dbType === 'postgres' 
      ? 'SELECT * FROM plans ORDER BY duration_months'
      : 'SELECT * FROM plans ORDER BY duration_months';
    
    const result = await connection.query(query);
    const plans = dbType === 'postgres' ? result.rows : result[0];
    
    // Calcular descontos e economias
    const monthlyPlan = plans.find(p => p.type === 'monthly');
    const enhancedPlans = plans.map(plan => {
      const monthlyPrice = monthlyPlan.price;
      const discount = calculateDiscount(plan, monthlyPrice);
      const savings = calculateSavings(plan, monthlyPrice);
      
      return {
        ...plan,
        discount,
        savings
      };
    });

    res.json(enhancedPlans);
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    if (connection) connection.release();
  }
});

function calculateDiscount(plan, monthlyPrice) {
  if (plan.type === 'monthly') return 0;
  
  const months = plan.duration_months;
  const fullPrice = monthlyPrice * months;
  return Math.round(((fullPrice - plan.price) / fullPrice) * 100);
}

function calculateSavings(plan, monthlyPrice) {
  if (plan.type === 'monthly') return 0;
  
  const annualMonths = 12;
  const fullAnnualPrice = monthlyPrice * annualMonths;
  const planCycles = annualMonths / plan.duration_months;
  return (fullAnnualPrice - (plan.price * planCycles)).toFixed(2);
}

module.exports = router;