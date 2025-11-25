const { StudentReward, User } = require('../models');

class RewardController {
  // Obtener recompensas de un estudiante
  async getRewards(req, res) {
    try {
      const { studentId } = req.query;
      const targetStudentId = studentId || req.user.id;

      // Verificar permisos
      if (targetStudentId !== req.user.id && req.user.role !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver estas recompensas'
        });
      }

      const rewards = await StudentReward.findAll({
        where: { studentId: targetStudentId },
        include: [{ model: User, as: 'student', attributes: ['id', 'name'] }],
        order: [['earnedAt', 'DESC']]
      });

      res.json({
        success: true,
        data: rewards
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener recompensas'
      });
    }
  }

  // Otorgar recompensa
  async awardReward(req, res) {
    try {
      const { studentId, badgeId, badgeName, level } = req.body;

      if (!studentId || !badgeId || !badgeName) {
        return res.status(400).json({
          success: false,
          message: 'Datos incompletos'
        });
      }

      // Verificar que el estudiante existe
      const student = await User.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado'
        });
      }

      // Verificar si ya tiene esta recompensa
      const existing = await StudentReward.findOne({
        where: { studentId, badgeId }
      });

      if (existing) {
        // Actualizar nivel si es mayor
        if (level && level > existing.level) {
          await existing.update({ level, earnedAt: new Date() });
          return res.json({
            success: true,
            data: existing,
            message: 'Nivel de recompensa actualizado'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'El estudiante ya tiene esta recompensa'
        });
      }

      const rewardId = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const reward = await StudentReward.create({
        id: rewardId,
        studentId,
        badgeId,
        badgeName,
        level: level || 1,
        earnedAt: new Date()
      });

      res.status(201).json({
        success: true,
        data: reward
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al otorgar recompensa'
      });
    }
  }
}

module.exports = new RewardController();





