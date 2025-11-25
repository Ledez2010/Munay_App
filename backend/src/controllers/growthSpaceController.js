const { GrowthSpace, User } = require('../models');

class GrowthSpaceController {
  // Obtener espacios de crecimiento
  async getGrowthSpaces(req, res) {
    try {
      const spaces = await GrowthSpace.findAll({
        where: { teacherId: req.user.id },
        order: [['createdAt', 'DESC']]
      });

      // Enriquecer con datos de estudiantes
      const enrichedSpaces = await Promise.all(
        spaces.map(async (space) => {
          const students = await User.findAll({
            where: {
              id: { [require('sequelize').Op.in]: space.studentIds || [] }
            },
            attributes: ['id', 'name', 'email', 'age', 'gender']
          });

          return {
            ...space.toJSON(),
            students
          };
        })
      );

      res.json({
        success: true,
        data: enrichedSpaces
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener espacios de crecimiento'
      });
    }
  }

  // Crear espacio de crecimiento
  async createGrowthSpace(req, res) {
    try {
      const { name, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El nombre es requerido'
        });
      }

      const spaceId = `space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const space = await GrowthSpace.create({
        id: spaceId,
        teacherId: req.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        studentIds: []
      });

      res.status(201).json({
        success: true,
        data: space
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear espacio de crecimiento'
      });
    }
  }

  // Actualizar espacio de crecimiento
  async updateGrowthSpace(req, res) {
    try {
      const { id } = req.params;
      const { name, description, studentIds } = req.body;

      const space = await GrowthSpace.findByPk(id);

      if (!space) {
        return res.status(404).json({
          success: false,
          message: 'Espacio no encontrado'
        });
      }

      if (space.teacherId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este espacio'
        });
      }

      await space.update({
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(studentIds !== undefined && { studentIds })
      });

      res.json({
        success: true,
        data: space
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar espacio'
      });
    }
  }

  // Eliminar espacio de crecimiento
  async deleteGrowthSpace(req, res) {
    try {
      const { id } = req.params;

      const space = await GrowthSpace.findByPk(id);

      if (!space) {
        return res.status(404).json({
          success: false,
          message: 'Espacio no encontrado'
        });
      }

      if (space.teacherId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este espacio'
        });
      }

      await space.destroy();

      res.json({
        success: true,
        message: 'Espacio eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar espacio'
      });
    }
  }
}

module.exports = new GrowthSpaceController();





