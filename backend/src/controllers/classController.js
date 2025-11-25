const { Class, User } = require('../models');
const crypto = require('crypto');

class ClassController {
  // Obtener todas las clases
  async getClasses(req, res) {
    try {
      const classes = await Class.findAll({
        include: [
          { model: User, as: 'teacher' },
          { model: User, as: 'students' }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: classes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener clases'
      });
    }
  }

  // Obtener clase por código
  async getClassByCode(req, res) {
    try {
      const { code } = req.params;
      const classData = await Class.findByPk(code, {
        include: [
          { model: User, as: 'teacher' },
          { model: User, as: 'students' }
        ]
      });

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: 'Clase no encontrada'
        });
      }

      res.json({
        success: true,
        data: classData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener clase'
      });
    }
  }

  // Crear nueva clase
  async createClass(req, res) {
    try {
      // Solo teachers pueden crear clases
      if (req.user.role !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'Solo los profesores pueden crear clases'
        });
      }

      const { name } = req.body;

      // Generar código único
      let code;
      let exists = true;
      while (exists) {
        code = 'CLS' + crypto.randomBytes(3).toString('hex').toUpperCase();
        const existing = await Class.findByPk(code);
        exists = !!existing;
      }

      const classData = await Class.create({
        code,
        name: name || null,
        teacherId: req.user.id
      });

      res.status(201).json({
        success: true,
        data: classData,
        message: `Código de clase creado: ${code}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear clase'
      });
    }
  }

  // Eliminar clase
  async deleteClass(req, res) {
    try {
      const { code } = req.params;

      // Solo el teacher dueño puede eliminar
      const classData = await Class.findByPk(code);
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: 'Clase no encontrada'
        });
      }

      if (classData.teacherId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta clase'
        });
      }

      await classData.destroy();

      res.json({
        success: true,
        message: 'Clase eliminada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar clase'
      });
    }
  }
}

module.exports = new ClassController();





