const { User, Class } = require('../models');
const { Op } = require('sequelize');

class UserController {
  // Obtener todos los usuarios (con filtros)
  async getUsers(req, res) {
    try {
      const { role, classCode, search } = req.query;
      const where = {};

      if (role) where.role = role;
      if (classCode) where.classCode = classCode;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const users = await User.findAll({
        where,
        include: role === 'student' ? [{ model: Class, as: 'class' }] : [],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener usuario por ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        include: [{ model: Class, as: 'class' }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario'
      });
    }
  }

  // Actualizar usuario
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, age, gender, avatar, classCode } = req.body;

      // Solo el mismo usuario o admin puede actualizar
      if (req.user.id !== id && req.user.role !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este usuario'
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar email único si se cambia
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'El email ya está en uso'
          });
        }
      }

      await user.update({
        ...(name && { name }),
        ...(email && { email }),
        ...(age !== undefined && { age }),
        ...(gender && { gender }),
        ...(avatar && { avatar }),
        ...(classCode !== undefined && { classCode })
      });

      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar usuario'
      });
    }
  }

  // Eliminar usuario
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Solo teachers pueden eliminar usuarios
      if (req.user.role !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar usuarios'
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      await user.destroy();

      res.json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario'
      });
    }
  }

  // Obtener estudiantes de una clase
  async getStudentsByClass(req, res) {
    try {
      const { classCode } = req.params;
      const students = await User.findAll({
        where: {
          role: 'student',
          classCode
        },
        include: [{ model: Class, as: 'class' }],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: students
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estudiantes'
      });
    }
  }

  // Crear usuarios masivamente (solo para teachers/admins)
  async createBulkUsers(req, res) {
    try {
      // Solo teachers pueden crear usuarios masivamente
      if (req.user.role !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden crear usuarios masivamente'
        });
      }

      const { users } = req.body;

      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar un array de usuarios'
        });
      }

      if (users.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'No puedes crear más de 1000 usuarios a la vez'
        });
      }

      const results = {
        created: [],
        errors: [],
        skipped: []
      };

      // Procesar usuarios uno por uno
      for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        
        try {
          // Validar datos requeridos
          if (!userData.email || !userData.name || !userData.role) {
            results.errors.push({
              index: i,
              email: userData.email || 'N/A',
              error: 'Faltan campos requeridos: email, name, role'
            });
            continue;
          }

          // Validar email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(userData.email)) {
            results.errors.push({
              index: i,
              email: userData.email,
              error: 'Email inválido'
            });
            continue;
          }

          // Validar rol
          if (!['student', 'teacher'].includes(userData.role)) {
            results.errors.push({
              index: i,
              email: userData.email,
              error: 'Rol inválido. Debe ser "student" o "teacher"'
            });
            continue;
          }

          // Verificar si el usuario ya existe
          const existingUser = await User.findOne({ where: { email: userData.email } });
          if (existingUser) {
            results.skipped.push({
              index: i,
              email: userData.email,
              reason: 'Usuario ya existe'
            });
            continue;
          }

          // Generar contraseña por defecto si no se proporciona
          const defaultPassword = userData.password || `temp${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
          
          // Crear usuario
          const newUser = await User.create({
            id: `user_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            name: userData.name,
            email: userData.email,
            password: defaultPassword,
            role: userData.role,
            classCode: userData.classCode || null,
            age: userData.age || null,
            gender: userData.gender || null,
            avatar: userData.avatar || 'student'
          });

          results.created.push({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            classCode: newUser.classCode
          });

        } catch (error) {
          results.errors.push({
            index: i,
            email: userData.email || 'N/A',
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: `Procesados ${users.length} usuarios`,
        summary: {
          total: users.length,
          created: results.created.length,
          errors: results.errors.length,
          skipped: results.skipped.length
        },
        results: results
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear usuarios masivamente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Crear un usuario individual (solo para teachers/admins)
  async createUser(req, res) {
    try {
      // Solo teachers pueden crear usuarios
      if (req.user.role !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden crear usuarios'
        });
      }

      const { name, email, password, role, classCode, age, gender, avatar } = req.body;

      // Validar campos requeridos
      if (!name || !email || !role) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: name, email, role'
        });
      }

      // Validar rol
      if (!['student', 'teacher'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido. Debe ser "student" o "teacher"'
        });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso'
        });
      }

      // Generar contraseña por defecto si no se proporciona
      const userPassword = password || `temp${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

      // Crear usuario
      const user = await User.create({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password: userPassword,
        role,
        classCode: classCode || null,
        age: age || null,
        gender: gender || null,
        avatar: avatar || 'student'
      });

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user.toJSON()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new UserController();





