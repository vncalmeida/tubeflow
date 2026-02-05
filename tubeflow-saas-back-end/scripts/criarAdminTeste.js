require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const config = require('../src/config');

async function criarAdmin() {
  const { dbType, mysql: mysqlCfg, postgres: pgCfg } = config.dbConfig;
  const nome = 'Admin';
  const email = 'admin@gmail.com';
  const senhaEmTextoPlano = 'admin123';
  const papel = 'admin';
  const senhaCriptografada = await bcrypt.hash(senhaEmTextoPlano, 12);

  if (dbType === 'postgres') {
    const pool = new Pool(pgCfg);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const consultaExistencia = await client.query(
        'SELECT id FROM admin_users WHERE email = $1',
        [email]
      );
      if (consultaExistencia.rowCount > 0) {
        console.log('Usuário já existe');
        await client.query('ROLLBACK');
        await client.release();
        await pool.end();
        return;
      }
      await client.query(
        'INSERT INTO admin_users (name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
        [nome, email, senhaCriptografada, papel]
      );
      await client.query('COMMIT');
      console.log('Administrador criado com sucesso');
    } catch (erro) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar administrador:', erro.message);
    } finally {
      client.release();
      await pool.end();
    }
  } else {
    const conexao = await mysql.createConnection(mysqlCfg);
    try {
      await conexao.beginTransaction();
      const [linhasExistencia] = await conexao.execute(
        'SELECT id FROM admin_users WHERE email = ?',
        [email]
      );
      if (linhasExistencia.length > 0) {
        console.log('Usuário já existe');
        await conexao.rollback();
        await conexao.end();
        return;
      }
      await conexao.execute(
        'INSERT INTO admin_users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [nome, email, senhaCriptografada, papel]
      );
      await conexao.commit();
      console.log('Administrador criado com sucesso');
    } catch (erro) {
      await conexao.rollback();
      console.error('Erro ao criar administrador:', erro.message);
    } finally {
      await conexao.end();
    }
  }
}

criarAdmin();
