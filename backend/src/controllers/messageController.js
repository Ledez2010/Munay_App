const { AnonymousMessage, User, Class } = require('../models');
const { Op } = require('sequelize');

class MessageController {
  // Obtener mensajes
  async getMessages(req, res) {
    try {
      const { studentId, classCode, replied } = req.query;
      const where = {};

      if (req.user.role === 'student') {
        where.studentId = req.user.id;
      } else {
        // Teachers ven mensajes de sus clases
        if (classCode) {
          where.studentClassCode = classCode;
        } else {
          // Obtener códigos de clase del teacher
          const classes = await Class.findAll({
            where: { teacherId: req.user.id },
            attributes: ['code']
          });
          const classCodes = classes.map(c => c.code);
          where.studentClassCode = { [Op.in]: classCodes };
        }
      }

      if (studentId) where.studentId = studentId;
      if (replied !== undefined) {
        where.reply = replied === 'true' ? { [Op.ne]: null } : { [Op.is]: null };
      }

      const messages = await AnonymousMessage.findAll({
        where,
        include: [
          { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
          { model: Class, as: 'class', attributes: ['code', 'name'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener mensajes'
      });
    }
  }

  // Enviar mensaje anónimo
  async sendMessage(req, res) {
    try {
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El mensaje no puede estar vacío'
        });
      }

      const student = await User.findByPk(req.user.id);
      if (!student || !student.classCode) {
        return res.status(400).json({
          success: false,
          message: 'Estudiante no tiene clase asignada'
        });
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const anonymousMessage = await AnonymousMessage.create({
        id: messageId,
        studentId: req.user.id,
        studentClassCode: student.classCode,
        message: message.trim()
      });

      res.status(201).json({
        success: true,
        data: anonymousMessage
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al enviar mensaje'
      });
    }
  }

  // Responder mensaje
  async replyToMessage(req, res) {
    try {
      const { id } = req.params;
      const { reply } = req.body;

      if (!reply || !reply.trim()) {
        return res.status(400).json({
          success: false,
          message: 'La respuesta no puede estar vacía'
        });
      }

      const message = await AnonymousMessage.findByPk(id, {
        include: [{ model: Class, as: 'class' }]
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Mensaje no encontrado'
        });
      }

      // Verificar que el teacher es dueño de la clase
      if (req.user.role === 'teacher') {
        const classData = await Class.findByPk(message.studentClassCode);
        if (!classData || classData.teacherId !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para responder este mensaje'
          });
        }
      }

      await message.update({
        reply: reply.trim(),
        repliedAt: new Date()
      });

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al responder mensaje'
      });
    }
  }
}

module.exports = new MessageController();



