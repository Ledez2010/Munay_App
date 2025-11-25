const { TeacherNotification, User } = require('../models');
const { Op } = require('sequelize');

class NotificationController {
  // Obtener notificaciones
  async getNotifications(req, res) {
    try {
      const { read, studentId, type } = req.query;
      const where = {
        teacherId: req.user.id
      };

      if (read !== undefined) {
        where.read = read === 'true';
      }
      if (studentId) where.studentId = studentId;
      if (type) where.type = type;

      const notifications = await TeacherNotification.findAll({
        where,
        include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener notificaciones'
      });
    }
  }

  // Marcar notificación como leída
  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const notification = await TeacherNotification.findByPk(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      if (notification.teacherId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para esta notificación'
        });
      }

      await notification.update({
        read: true,
        readAt: new Date()
      });

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar notificación'
      });
    }
  }

  // Marcar múltiples notificaciones como leídas
  async markMultipleAsRead(req, res) {
    try {
      const { notificationIds, studentId } = req.body;

      const where = {
        teacherId: req.user.id,
        read: false
      };

      if (notificationIds && Array.isArray(notificationIds)) {
        where.id = { [Op.in]: notificationIds };
      }
      if (studentId) {
        where.studentId = studentId;
      }

      const updated = await TeacherNotification.update(
        {
          read: true,
          readAt: new Date()
        },
        {
          where
        }
      );

      res.json({
        success: true,
        message: `${updated[0]} notificaciones marcadas como leídas`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar notificaciones'
      });
    }
  }

  // Contar notificaciones no leídas
  async getUnreadCount(req, res) {
    try {
      const count = await TeacherNotification.count({
        where: {
          teacherId: req.user.id,
          read: false
        }
      });

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al contar notificaciones'
      });
    }
  }
}

module.exports = new NotificationController();



