async function columnExists(pool, tableName, columnName) {
  const [rows] = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function addColumnIfMissing(pool, tableName, columnName, columnDefinition, logger) {
  const exists = await columnExists(pool, tableName, columnName);
  if (exists) {
    return false;
  }

  await pool.query(
    `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDefinition}`
  );

  logger.info({ tableName, columnName }, 'Coluna adicionada automaticamente');
  return true;
}

async function runStartupMigrations(pool, logger) {
  try {
    await addColumnIfMissing(
      pool,
      'settings',
      'status_change_template',
      'TEXT NULL',
      logger
    );

    await addColumnIfMissing(
      pool,
      'settings',
      'welcome_template',
      'TEXT NULL',
      logger
    );

    await addColumnIfMissing(
      pool,
      'settings',
      'whatsapp_api_url',
      'VARCHAR(255) NULL',
      logger
    );
  } catch (error) {
    logger.error(
      { error: error.message, stack: error.stack },
      'Erro ao executar migracoes automaticas'
    );
  }
}

module.exports = { runStartupMigrations };
