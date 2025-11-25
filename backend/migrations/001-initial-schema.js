/**
 * Migración inicial - Crea todas las tablas necesarias
 * Ejecutar: node migrations/001-initial-schema.js
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');
const {
  User,
  Class,
  SurveyResponse,
  StudentActivity,
  AnonymousMessage,
  TeacherNotification,
  GrowthSpace,
  StudentReward,
  ReflectionAnalysis,
  DemoRequest,
  Client
} = require('../src/models');

async function runMigration() {
  try {
    console.log('🔄 Iniciando migración...\n');

    // Sincronizar modelos (crear tablas)
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Tablas sincronizadas');

    // Verificar que las tablas existen
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log(`\n📊 Tablas creadas: ${tables.length}`);
    tables.forEach(table => console.log(`   - ${table}`));

    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

runMigration();

