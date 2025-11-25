const { User, Class, SurveyResponse, StudentActivity, AnonymousMessage, TeacherNotification, ReflectionAnalysis } = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

class AdminController {
  // Obtener estadísticas generales (agregadas, sin datos personales)
  async getDashboardStats(req, res) {
    try {
      // Verificar que el usuario sea admin/teacher
      if (req.user.role !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a estas estadísticas'
        });
      }

      // Contar usuarios totales
      const totalUsers = await User.count();
      const totalStudents = await User.count({ where: { role: 'student' } });
      const totalTeachers = await User.count({ where: { role: 'teacher' } });

      // Contar clases
      const totalClasses = await Class.count();

      // Contar respuestas de encuestas
      const totalSurveyResponses = await SurveyResponse.count();

      // Contar actividades completadas
      const totalActivities = await StudentActivity.count();

      // Contar mensajes anónimos
      const totalMessages = await AnonymousMessage.count();

      // Contar notificaciones
      const totalNotifications = await TeacherNotification.count();

      // Usuarios por clase (agregado)
      const usersByClass = await User.findAll({
        where: { role: 'student' },
        attributes: [
          'classCode',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['classCode'],
        raw: true
      });

      // Distribución por edad (agregado, sin datos personales)
      const ageDistribution = await User.findAll({
        where: { 
          role: 'student',
          age: { [Op.not]: null }
        },
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          'age'
        ],
        group: ['age'],
        order: [['age', 'ASC']],
        raw: true
      });

      // Distribución por género (agregado)
      const genderDistribution = await User.findAll({
        where: { 
          role: 'student',
          gender: { [Op.not]: null }
        },
        attributes: [
          'gender',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['gender'],
        raw: true
      });

      // Clientes (escuelas/instituciones) - agrupados por dominio de email
      const clients = await User.findAll({
        where: { role: 'teacher' },
        attributes: [
          [Sequelize.fn('SUBSTRING_INDEX', Sequelize.col('email'), '@', -1), 'domain'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'teacherCount']
        ],
        group: [Sequelize.fn('SUBSTRING_INDEX', Sequelize.col('email'), '@', -1)],
        raw: true
      });

      // Para cada cliente, obtener estadísticas agregadas
      const clientsWithStats = await Promise.all(
        clients.map(async (client) => {
          const domain = client.domain;
          
          // Buscar todos los usuarios de este dominio
          const clientUsers = await User.findAll({
            where: {
              email: { [Op.like]: `%@${domain}` }
            }
          });

          const clientUserIds = clientUsers.map(u => u.id);
          const clientClassCodes = clientUsers
            .filter(u => u.classCode)
            .map(u => u.classCode);

          // Obtener estudiantes del cliente (incluyendo los que pertenecen a clases de profesores del dominio)
          const clientStudents = await User.findAll({
            where: {
              [Op.or]: [
                { email: { [Op.like]: `%@${domain}` }, role: 'student' },
                { classCode: { [Op.in]: clientClassCodes }, role: 'student' }
              ]
            }
          });
          const clientStudentIds = clientStudents.map(u => u.id);
          
          // Calcular score de bienestar general del cliente
          const surveyScores = await SurveyResponse.findAll({
            where: {
              studentId: { [Op.in]: clientStudentIds },
              score: { [Op.not]: null }
            },
            attributes: ['score']
          });
          
          const reflections = await ReflectionAnalysis.findAll({
            where: {
              studentId: { [Op.in]: clientStudentIds }
            },
            attributes: ['analysis']
          });
          
          // Extraer scores de las reflexiones (pueden estar en analysis.score o analysis.overallScore)
          const reflectionScores = reflections
            .map(r => {
              if (r.analysis && typeof r.analysis === 'object') {
                return r.analysis.score || r.analysis.overallScore || null;
              }
              return null;
            })
            .filter(score => score !== null);
          
          const activityScores = await StudentActivity.findAll({
            where: {
              studentId: { [Op.in]: clientStudentIds },
              score: { [Op.not]: null }
            },
            attributes: ['score']
          });
          
          // Combinar todos los scores
          const allScores = [
            ...surveyScores.map(s => s.score),
            ...reflectionScores.map(r => r.score),
            ...activityScores.map(a => a.score)
          ];
          
          // Calcular promedio de bienestar
          let wellbeingScore = null;
          if (allScores.length > 0) {
            const totalScore = allScores.reduce((sum, score) => sum + (score || 0), 0);
            wellbeingScore = Math.round(totalScore / allScores.length);
          }
          
          // Estadísticas del cliente
          const clientStats = {
            domain: domain,
            teachers: await User.count({
              where: {
                email: { [Op.like]: `%@${domain}` },
                role: 'teacher'
              }
            }),
            students: clientStudents.length,
            classes: await Class.count({
              where: {
                code: { [Op.in]: clientClassCodes }
              }
            }),
            surveyResponses: await SurveyResponse.count({
              where: {
                studentId: { [Op.in]: clientStudentIds }
              }
            }),
            activities: await StudentActivity.count({
              where: {
                studentId: { [Op.in]: clientStudentIds }
              }
            }),
            messages: await AnonymousMessage.count({
              where: {
                studentClassCode: { [Op.in]: clientClassCodes }
              }
            }),
            wellbeingScore: wellbeingScore
          };

          return clientStats;
        })
      );

      // Actividad reciente (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentActivity = {
        newUsers: await User.count({
          where: {
            createdAt: { [Op.gte]: thirtyDaysAgo }
          }
        }),
        newSurveyResponses: await SurveyResponse.count({
          where: {
            completedAt: { [Op.gte]: thirtyDaysAgo }
          }
        }),
        newActivities: await StudentActivity.count({
          where: {
            completedAt: { [Op.gte]: thirtyDaysAgo }
          }
        }),
        newMessages: await AnonymousMessage.count({
          where: {
            timestamp: { [Op.gte]: thirtyDaysAgo }
          }
        })
      };

      res.json({
        success: true,
        data: {
          overview: {
            totalTeachers,
            totalStudents,
            totalClasses,
            totalSurveyResponses,
            totalActivities,
            totalMessages
          },
          distribution: {
            usersByClass: usersByClass.map(item => ({
              classCode: item.classCode || 'Sin clase',
              count: parseInt(item.count)
            })),
            ageDistribution: ageDistribution.map(item => ({
              age: item.age,
              count: parseInt(item.count)
            })),
            genderDistribution: genderDistribution.map(item => ({
              gender: item.gender,
              count: parseInt(item.count)
            }))
          },
          clients: clientsWithStats,
          recentActivity
        }
      });

    } catch (error) {
      console.error('Error en getDashboardStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener lista de clientes (sin datos personales)
  async getClients(req, res) {
    try {
      if (req.user.role !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a esta información'
        });
      }

      // Obtener todos los profesores (cada uno representa un cliente potencial)
      const teachers = await User.findAll({
        where: { role: 'teacher' },
        attributes: ['id', 'name', 'email', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      // Agrupar por dominio de email
      const clientsMap = new Map();

      for (const teacher of teachers) {
        const domain = teacher.email.split('@')[1];
        
        if (!clientsMap.has(domain)) {
          clientsMap.set(domain, {
            domain: domain,
            primaryContact: teacher.name,
            primaryEmail: teacher.email,
            createdAt: teacher.createdAt,
            teachers: [],
            stats: {
              teachers: 0,
              students: 0,
              classes: 0
            }
          });
        }

        const client = clientsMap.get(domain);
        client.teachers.push({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email
        });
        client.stats.teachers++;
      }

      // Calcular estadísticas para cada cliente
      const clients = Array.from(clientsMap.values());
      
      for (const client of clients) {
        // Obtener usuarios del dominio
        const domainUsers = await User.findAll({
          where: {
            email: { [Op.like]: `%@${client.domain}` }
          }
        });

        const domainUserIds = domainUsers.map(u => u.id);
        const domainClassCodes = domainUsers
          .filter(u => u.classCode)
          .map(u => u.classCode);

        client.stats.students = await User.count({
          where: {
            email: { [Op.like]: `%@${client.domain}` },
            role: 'student'
          }
        });

        client.stats.classes = await Class.count({
          where: {
            code: { [Op.in]: domainClassCodes }
          }
        });

        // Agregar más estadísticas
        client.stats.surveyResponses = await SurveyResponse.count({
          where: {
            studentId: { [Op.in]: domainUserIds }
          }
        });

        client.stats.activities = await StudentActivity.count({
          where: {
            studentId: { [Op.in]: domainUserIds }
          }
        });

        client.stats.messages = await AnonymousMessage.count({
          where: {
            studentClassCode: { [Op.in]: domainClassCodes }
          }
        });
        
        // Calcular score de bienestar general del cliente
        const clientStudentIds = domainUsers
          .filter(u => u.role === 'student')
          .map(u => u.id);
        
        const surveyScores = await SurveyResponse.findAll({
          where: {
            studentId: { [Op.in]: clientStudentIds },
            score: { [Op.not]: null }
          },
          attributes: ['score']
        });
        
        const reflections = await ReflectionAnalysis.findAll({
          where: {
            studentId: { [Op.in]: clientStudentIds }
          },
          attributes: ['analysis']
        });
        
        // Extraer scores de las reflexiones (pueden estar en analysis.score o analysis.overallScore)
        const reflectionScores = reflections
          .map(r => {
            if (r.analysis && typeof r.analysis === 'object') {
              return r.analysis.score || r.analysis.overallScore || null;
            }
            return null;
          })
          .filter(score => score !== null);
        
        const activityScores = await StudentActivity.findAll({
          where: {
            studentId: { [Op.in]: clientStudentIds },
            score: { [Op.not]: null }
          },
          attributes: ['score']
        });
        
        // Combinar todos los scores
        const allScores = [
          ...surveyScores.map(s => s.score),
          ...reflectionScores.map(r => r.score),
          ...activityScores.map(a => a.score)
        ];
        
        // Calcular promedio de bienestar
        if (allScores.length > 0) {
          const totalScore = allScores.reduce((sum, score) => sum + (score || 0), 0);
          client.stats.wellbeingScore = Math.round(totalScore / allScores.length);
        } else {
          client.stats.wellbeingScore = null;
        }
      }

      res.json({
        success: true,
        data: clients
      });

    } catch (error) {
      console.error('Error en getClients:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener clientes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener detalles de un cliente específico (sin datos personales)
  async getClientDetails(req, res) {
    try {
      if (req.user.role !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a esta información'
        });
      }

      const { domain } = req.params;

      // Obtener usuarios del dominio
      const domainUsers = await User.findAll({
        where: {
          email: { [Op.like]: `%@${domain}` }
        }
      });

      const domainUserIds = domainUsers.map(u => u.id);
      const domainClassCodes = domainUsers
        .filter(u => u.classCode)
        .map(u => u.classCode);

      // Estadísticas agregadas
      const stats = {
        teachers: await User.count({
          where: {
            email: { [Op.like]: `%@${domain}` },
            role: 'teacher'
          }
        }),
        students: await User.count({
          where: {
            email: { [Op.like]: `%@${domain}` },
            role: 'student'
          }
        }),
        classes: await Class.count({
          where: {
            code: { [Op.in]: domainClassCodes }
          }
        }),
        surveyResponses: await SurveyResponse.count({
          where: {
            studentId: { [Op.in]: domainUserIds }
          }
        }),
        activities: await StudentActivity.count({
          where: {
            studentId: { [Op.in]: domainUserIds }
          }
        }),
        messages: await AnonymousMessage.count({
          where: {
            studentClassCode: { [Op.in]: domainClassCodes }
          }
        })
      };

      // Clases del cliente (sin datos personales)
      const classes = await Class.findAll({
        where: {
          code: { [Op.in]: domainClassCodes }
        },
        attributes: ['code', 'name', 'createdAt']
      });

      // Distribución por edad (agregado)
      const ageDistribution = await User.findAll({
        where: {
          email: { [Op.like]: `%@${domain}` },
          role: 'student',
          age: { [Op.not]: null }
        },
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          'age'
        ],
        group: ['age'],
        order: [['age', 'ASC']],
        raw: true
      });

      res.json({
        success: true,
        data: {
          domain,
          stats,
          classes: classes.map(c => ({
            code: c.code,
            name: c.name,
            createdAt: c.createdAt
          })),
          ageDistribution: ageDistribution.map(item => ({
            age: item.age,
            count: parseInt(item.count)
          }))
        }
      });

    } catch (error) {
      console.error('Error en getClientDetails:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalles del cliente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AdminController();

