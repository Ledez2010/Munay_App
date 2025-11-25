const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de Sequelize para MySQL - Optimizada
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20, // Aumentado para mejor rendimiento
      min: 5,  // Mantener conexiones mínimas activas
      acquire: 30000,
      idle: 10000,
      evict: 1000 // Remover conexiones inactivas
    },
    dialectOptions: {
      connectTimeout: 60000,
      // Optimizaciones para MySQL
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: false,
      typeCast: true
    },
    // Configuración adicional
    retry: {
      max: 3 // Reintentar conexión hasta 3 veces
    },
    // Timezone
    timezone: '+00:00' // UTC
  }
);

// Función para probar la conexión con reintentos
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a MySQL establecida correctamente.');
      
      // Verificar que el pool esté funcionando
      const pool = sequelize.connectionManager.pool;
      console.log(`✅ Pool de conexiones: ${pool.size} conexiones activas`);
      
      return true;
    } catch (error) {
      console.error(`❌ Error al conectar con MySQL (intento ${i + 1}/${retries}):`, error.message);
      
      if (i === retries - 1) {
        console.error('❌ Verifica: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD en .env');
        return false;
      }
      
      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// Función para verificar el estado de la base de datos
async function checkDatabaseHealth() {
  try {
    await sequelize.query('SELECT 1', { type: sequelize.QueryTypes.SELECT });
    return { healthy: true, message: 'Base de datos conectada' };
  } catch (error) {
    return { healthy: false, message: error.message };
  }
}

module.exports = { sequelize, testConnection, checkDatabaseHealth };

