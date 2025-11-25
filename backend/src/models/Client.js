const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del cliente/entidad (ej: Colegio de Teis)'
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    },
    comment: 'Email de contacto del cliente'
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Teléfono de contacto del cliente'
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre de la persona de contacto'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    allowNull: false,
    defaultValue: 'active',
    comment: 'Estado del cliente'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre el cliente'
  },
  totalUsers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total de usuarios asociados a este cliente'
  },
  totalStudents: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total de estudiantes del cliente'
  },
  totalTeachers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total de profesores del cliente'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'clients',
  timestamps: true
});

module.exports = Client;

