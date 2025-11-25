const authService = require('../services/authService');
const { User } = require('../models');

class AuthController {
  async login(req, res) {
    try {
      const { email, password, role } = req.body;

      // Validación adicional (aunque ya viene del middleware)
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // El rol es opcional en el backend, pero se valida si se proporciona
      const result = await authService.login(email, password, role);
      
      if (!result || !result.success) {
        return res.status(401).json({
          success: false,
          message: result?.message || 'Credenciales incorrectas'
        });
      }
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en login:', error);
      
      // No exponer detalles del error en producción
      const message = process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error al iniciar sesión';
      
      res.status(401).json({
        success: false,
        message: message
      });
    }
  }

  async register(req, res) {
    try {
      const { email, password, name, role, classCode, age, gender } = req.body;

      // Validación adicional (aunque ya viene del middleware)
      if (!email || !password || !name || !role) {
        return res.status(400).json({
          success: false,
          message: 'Email, contraseña, nombre y rol son requeridos'
        });
      }

      const result = await authService.register({
        email,
        password,
        name,
        role,
        classCode,
        age,
        gender
      });

      if (!result || !result.success) {
        return res.status(400).json({
          success: false,
          message: result?.message || 'Error al registrar usuario'
        });
      }

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en register:', error);
      
      // Manejar errores específicos
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          message: 'Este email ya está registrado'
        });
      }
      
      const message = process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error al registrar usuario';
      
      res.status(400).json({
        success: false,
        message: message
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] } // No enviar contraseña
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      console.error('Error en getCurrentUser:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario'
      });
    }
  }
}

module.exports = new AuthController();





