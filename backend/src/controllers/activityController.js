const { StudentActivity, User } = require('../models');
const { Op } = require('sequelize');

class ActivityController {
  // Obtener actividades
  async getActivities(req, res) {
    try {
      const { studentId, activityId, startDate, endDate } = req.query;
      const where = {};

      if (req.user.role === 'student') {
        where.studentId = req.user.id;
      } else if (studentId) {
        where.studentId = studentId;
      }

      if (activityId) where.activityId = activityId;
      if (startDate || endDate) {
        where.completedAt = {};
        if (startDate) where.completedAt[Op.gte] = new Date(startDate);
        if (endDate) where.completedAt[Op.lte] = new Date(endDate);
      }

      const activities = await StudentActivity.findAll({
        where,
        include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
        order: [['completedAt', 'DESC']]
      });

      res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener actividades'
      });
    }
  }

  // Enviar actividad completada
  async submitActivity(req, res) {
    try {
      const {
        activityId,
        activityTitle,
        activityType,
        responses,
        score,
        isActivityTest,
        isSimulator
      } = req.body;

      if (!activityId || !activityTitle || !activityType) {
        return res.status(400).json({
          success: false,
          message: 'Datos incompletos'
        });
      }

      const activityResponseId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const activity = await StudentActivity.create({
        id: activityResponseId,
        studentId: req.user.id,
        activityId,
        activityTitle,
        activityType,
        responses: responses || null,
        score: score || null,
        isActivityTest: isActivityTest || false,
        isSimulator: isSimulator || false,
        completedAt: new Date()
      });

      // Crear notificación para el teacher
      await this.createNotification(req.user.id, activity);

      res.status(201).json({
        success: true,
        data: activity
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al guardar actividad'
      });
    }
  }

  // Helper para crear notificación
  async createNotification(studentId, activity) {
    try {
      const { TeacherNotification } = require('../models');
      const student = await User.findByPk(studentId);
      if (!student || !student.classCode) return;

      const classData = await require('../models').Class.findByPk(student.classCode);
      if (!classData) return;

      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await TeacherNotification.create({
        id: notificationId,
        teacherId: classData.teacherId,
        studentId: studentId,
        type: 'activity',
        title: `Nueva actividad completada`,
        message: `${student.name} completó: ${activity.activityTitle}`,
        metadata: {
          activityId: activity.activityId,
          responseId: activity.id
        }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}

module.exports = new ActivityController();



