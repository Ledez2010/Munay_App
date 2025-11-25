const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware para verificar token JWT - Optimizado
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticación requerido' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || token.length < 10) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token inválido' 
        });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expirado. Por favor, inicia sesión nuevamente.' 
        });
      }
      throw jwtError;
    }

    // Verificar que el token tenga userId
    if (!decoded.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido: falta información del usuario' 
      });
    }

    // Buscar usuario (con caché opcional en el futuro)
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] } // No cargar contraseña innecesariamente
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en authenticate:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al verificar token' 
    });
  }
};

// Middleware para verificar rol
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para esta acción' 
      });
    }
    
    next();
  };
};

module.exports = { authenticate, requireRole };





