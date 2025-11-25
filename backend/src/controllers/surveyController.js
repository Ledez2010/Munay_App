const { SurveyResponse, User } = require('../models');
const { Op } = require('sequelize');

class SurveyController {
  // Obtener respuestas de encuestas
  async getSurveyResponses(req, res) {
    try {
      const { studentId, surveyId, startDate, endDate } = req.query;
      const where = {};

      // Filtros según rol
      if (req.user.role === 'student') {
        where.studentId = req.user.id;
      } else if (studentId) {
        where.studentId = studentId;
      }

      if (surveyId) where.surveyId = surveyId;
      if (startDate || endDate) {
        where.completedAt = {};
        if (startDate) where.completedAt[Op.gte] = new Date(startDate);
        if (endDate) where.completedAt[Op.lte] = new Date(endDate);
      }

      const responses = await SurveyResponse.findAll({
        where,
        include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
        order: [['completedAt', 'DESC']]
      });

      res.json({
        success: true,
        data: responses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener respuestas'
      });
    }
  }

  // Enviar respuesta de encuesta
  async submitSurveyResponse(req, res) {
    try {
      const { surveyId, surveyTitle, responses, score } = req.body;

      if (!surveyId || !surveyTitle || !responses) {
        return res.status(400).json({
          success: false,
          message: 'Datos incompletos'
        });
      }

      const responseId = `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const surveyResponse = await SurveyResponse.create({
        id: responseId,
        studentId: req.user.id,
        surveyId,
        surveyTitle,
        responses,
        score: score || null,
        completedAt: new Date()
      });

      // Crear notificación para el teacher
      await this.createNotification(req.user.id, surveyResponse);

      res.status(201).json({
        success: true,
        data: surveyResponse
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al guardar respuesta'
      });
    }
  }

  // Helper para crear notificación
  async createNotification(studentId, surveyResponse) {
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
        type: 'survey',
        title: `Nueva encuesta completada`,
        message: `${student.name} completó: ${surveyResponse.surveyTitle}`,
        metadata: {
          surveyId: surveyResponse.surveyId,
          responseId: surveyResponse.id
        }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}

module.exports = new SurveyController();





