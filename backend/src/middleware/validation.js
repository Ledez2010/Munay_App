/**
 * Middleware de validación de datos
 */

// Validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar que un campo no esté vacío
const isNotEmpty = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== '';
};

// Validar longitud mínima
const minLength = (value, min) => {
  return String(value).length >= min;
};

// Validar longitud máxima
const maxLength = (value, max) => {
  return String(value).length <= max;
};

// Validar que sea un número
const isNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

// Validar que sea un entero positivo
const isPositiveInteger = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num > 0;
};

// Middleware para validar login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!isNotEmpty(email)) {
    errors.push('El email es requerido');
  } else if (!isValidEmail(email)) {
    errors.push('El email no es válido');
  }

  if (!isNotEmpty(password)) {
    errors.push('La contraseña es requerida');
  } else if (!minLength(password, 6)) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  // Normalizar email (trim y lowercase)
  req.body.email = email.trim().toLowerCase();
  next();
};

// Middleware para validar registro
const validateRegister = (req, res, next) => {
  const { email, password, name, role } = req.body;
  const errors = [];

  if (!isNotEmpty(email)) {
    errors.push('El email es requerido');
  } else if (!isValidEmail(email)) {
    errors.push('El email no es válido');
  } else if (!maxLength(email, 255)) {
    errors.push('El email es demasiado largo');
  }

  if (!isNotEmpty(password)) {
    errors.push('La contraseña es requerida');
  } else if (!minLength(password, 6)) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  } else if (!maxLength(password, 100)) {
    errors.push('La contraseña es demasiado larga');
  }

  if (!isNotEmpty(name)) {
    errors.push('El nombre es requerido');
  } else if (!minLength(name, 2)) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  } else if (!maxLength(name, 255)) {
    errors.push('El nombre es demasiado largo');
  }

  if (!isNotEmpty(role)) {
    errors.push('El rol es requerido');
  } else if (!['student', 'teacher'].includes(role)) {
    errors.push('El rol debe ser "student" o "teacher"');
  }

  // Validar campos opcionales
  if (req.body.age && !isPositiveInteger(req.body.age)) {
    errors.push('La edad debe ser un número positivo');
  }

  if (req.body.classCode && !maxLength(req.body.classCode, 50)) {
    errors.push('El código de clase es demasiado largo');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  // Normalizar datos
  req.body.email = email.trim().toLowerCase();
  req.body.name = name.trim();
  if (req.body.classCode) {
    req.body.classCode = req.body.classCode.trim().toUpperCase();
  }
  
  next();
};

// Middleware para validar ID
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !isNotEmpty(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID requerido'
    });
  }

  next();
};

// Sanitizar string (remover caracteres peligrosos)
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>]/g, '') // Remover < y >
    .trim();
};

// Middleware para sanitizar body
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validateRegister,
  validateId,
  sanitizeBody,
  isValidEmail,
  isNotEmpty,
  minLength,
  maxLength,
  isNumber,
  isPositiveInteger
};

