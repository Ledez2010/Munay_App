const { Client, User } = require('../models');
const { Op } = require('sequelize');

class ClientController {
  // Verificar si el usuario es owner
  isOwner(user) {
    return user && user.email === 'munay@munay.com';
  }

  // Obtener todos los clientes (solo owner)
  async getClients(req, res) {
    try {
      if (!this.isOwner(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Solo el owner puede ver los clientes'
        });
      }

      const clients = await Client.findAll({
        order: [['createdAt', 'DESC']],
        include: [{
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role'],
          required: false
        }]
      });

      res.json({
        success: true,
        data: clients
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener clientes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener un cliente por ID
  async getClient(req, res) {
    try {
      if (!this.isOwner(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Solo el owner puede ver clientes'
        });
      }

      const { id } = req.params;
      const client = await Client.findByPk(id, {
        include: [{
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role', 'classCode', 'age', 'gender'],
          required: false
        }]
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: client
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener cliente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Crear un nuevo cliente
  async createClient(req, res) {
    try {
      if (!this.isOwner(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Solo el owner puede crear clientes'
        });
      }

      const { name, contactEmail, contactPhone, contactName, notes } = req.body;

      // Validar campos requeridos
      if (!name || !contactEmail) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: name, contactEmail'
        });
      }

      // Verificar si el email ya existe
      const existingClient = await Client.findOne({ where: { contactEmail } });
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con este email de contacto'
        });
      }

      // Crear cliente
      const client = await Client.create({
        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        contactEmail,
        contactPhone: contactPhone || null,
        contactName: contactName || null,
        notes: notes || null,
        status: 'active'
      });

      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: client
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear cliente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Actualizar un cliente
  async updateClient(req, res) {
    try {
      if (!this.isOwner(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Solo el owner puede actualizar clientes'
        });
      }

      const { id } = req.params;
      const { name, contactEmail, contactPhone, contactName, notes, status } = req.body;

      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      // Verificar si el email ya existe en otro cliente
      if (contactEmail && contactEmail !== client.contactEmail) {
        const existingClient = await Client.findOne({ 
          where: { 
            contactEmail,
            id: { [Op.ne]: id }
          } 
        });
        if (existingClient) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe otro cliente con este email de contacto'
          });
        }
      }

      // Actualizar
      await client.update({
        name: name || client.name,
        contactEmail: contactEmail || client.contactEmail,
        contactPhone: contactPhone !== undefined ? contactPhone : client.contactPhone,
        contactName: contactName !== undefined ? contactName : client.contactName,
        notes: notes !== undefined ? notes : client.notes,
        status: status || client.status
      });

      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: client
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar cliente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Eliminar un cliente
  async deleteClient(req, res) {
    try {
      if (!this.isOwner(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Solo el owner puede eliminar clientes'
        });
      }

      const { id } = req.params;
      const client = await Client.findByPk(id);
      
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      // Verificar si tiene usuarios asociados
      const userCount = await User.count({ where: { clientId: id } });
      if (userCount > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar el cliente porque tiene ${userCount} usuario(s) asociado(s)`
        });
      }

      await client.destroy();

      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar cliente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Importar usuarios desde CSV para un cliente
  async importUsersFromCSV(req, res) {
    try {
      if (!this.isOwner(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Solo el owner puede importar usuarios'
        });
      }

      const { clientId } = req.params;
      const { users } = req.body; // Array de usuarios del CSV parseado

      // Verificar que el cliente existe
      const client = await Client.findByPk(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar un array de usuarios'
        });
      }

      if (users.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'No puedes importar más de 1000 usuarios a la vez'
        });
      }

      const results = {
        created: [],
        errors: [],
        skipped: []
      };

      let studentsCount = 0;
      let teachersCount = 0;

      // Procesar usuarios
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
          const defaultPassword = userData.password || `temp${Date.now()}${i}${Math.random().toString(36).substr(2, 5)}`;
          
          // Crear usuario asociado al cliente
          const newUser = await User.create({
            id: `user_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            name: userData.name,
            email: userData.email,
            password: defaultPassword,
            role: userData.role,
            clientId: clientId,
            classCode: userData.classCode || null,
            age: userData.age ? parseInt(userData.age) : null,
            gender: userData.gender || null,
            avatar: 'student'
          });

          // Contar por rol
          if (userData.role === 'student') {
            studentsCount++;
          } else {
            teachersCount++;
          }

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

      // Actualizar contadores del cliente
      await client.update({
        totalUsers: client.totalUsers + results.created.length,
        totalStudents: client.totalStudents + studentsCount,
        totalTeachers: client.totalTeachers + teachersCount
      });

      res.json({
        success: true,
        message: `Importación completada para ${client.name}`,
        summary: {
          total: users.length,
          created: results.created.length,
          errors: results.errors.length,
          skipped: results.skipped.length,
          students: studentsCount,
          teachers: teachersCount
        },
        results: results
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al importar usuarios',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ClientController();

