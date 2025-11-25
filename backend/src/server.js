const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, checkDatabaseHealth } = require('./config/database');
const { sequelize } = require('./models');

// Import routes
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE DE SEGURIDAD ==========
app.use(helmet({
  contentSecurityPolicy: false, // Ajustar según necesidades
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// ========== CORS ==========
// Permitir archivos locales (origin: null) y otros orígenes configurados
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:8080', 'https://www.somosmunay.com'];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (archivos locales, Postman, etc.)
    // En desarrollo, permitir todos los orígenes
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// ========== PARSING ==========
app.use(express.json({ 
  limit: '10mb',
  strict: true, // Solo aceptar objetos JSON válidos
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100 // Límite de parámetros
}));

// ========== LOGGING ==========
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ========== RATE LIMITING ==========
// Rate limiter general
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // No aplicar rate limiting a health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Rate limiter más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos de login por IP cada 15 minutos
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.'
  },
  skipSuccessfulRequests: true // No contar requests exitosos
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ========== HEALTH CHECK ==========
// Health check en la raíz (para acceso directo al servidor)
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.json({ 
      status: dbHealth.healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth.healthy ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
});

// ========== API ROUTES ==========
app.use('/api', apiRoutes);

// Health check también bajo /api (para acceso a través del proxy)
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.json({ 
      status: dbHealth.healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth.healthy ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Logging de rutas para diagnóstico (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('📋 Rutas API montadas:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/admin/dashboard');
  console.log('   GET  /api/clients');
  console.log('   ... y más rutas');
}

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
  // Log del error con más detalles
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // Determinar código de estado
  let statusCode = err.status || err.statusCode || 500;
  
  // Manejar errores específicos de Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    const errors = err.errors.map(e => e.message);
    return res.status(statusCode).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    return res.status(statusCode).json({
      success: false,
      message: 'El recurso ya existe',
      field: err.errors[0]?.path || 'unknown'
    });
  }
  
  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    console.error('❌ Error de base de datos:', err.message);
    return res.status(statusCode).json({
      success: false,
      message: 'Error en la base de datos',
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message 
      })
    });
  }
  
  // Error genérico
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.name 
    })
  });
});

// ========== INICIAR SERVIDOR ==========
async function startServer() {
  try {
    // Verificar variables críticas
    if (!process.env.JWT_SECRET) {
      console.error('❌ ERROR: JWT_SECRET no está configurado');
      console.error('❌ Genera uno: openssl rand -base64 32');
      process.exit(1);
    }

    if (process.env.JWT_SECRET.length < 32) {
      console.warn('⚠️  JWT_SECRET debería tener al menos 32 caracteres');
    }

    // Verificar conexión a base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a PostgreSQL');
      process.exit(1);
    }

    // Sincronizar modelos - DESHABILITADO
    // Las tablas ya existen en la base de datos y tienen la estructura correcta
    // No necesitamos sincronizar para evitar errores con índices existentes
    // Si necesitas sincronizar, establece SYNC_MODELS=true en .env
    if (process.env.SYNC_MODELS === 'true') {
      console.log('🔄 Sincronizando modelos...');
      await sequelize.sync({ alter: false, force: false });
      console.log('✅ Modelos sincronizados con la base de datos');
    } else {
      console.log('ℹ️  Sincronización de modelos deshabilitada (tablas ya existen)');
    }

    // Verificar email (no crítico)
    try {
      const emailService = require('./services/emailService');
      await emailService.verifyConnection();
    } catch (emailError) {
      console.warn('⚠️  Email no configurado:', emailError.message);
      console.warn('⚠️  Las solicitudes se guardarán pero no se enviarán correos');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('🚀 SERVIDOR BACKEND MUNAY INICIADO');
      console.log('═══════════════════════════════════════');
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
      console.log('═══════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

