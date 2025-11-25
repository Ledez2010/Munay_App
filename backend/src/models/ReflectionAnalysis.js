const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReflectionAnalysis = sequelize.define('ReflectionAnalysis', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reflectionText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  analysis: {
    type: DataTypes.JSON,
    allowNull: false
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
  tableName: 'reflection_analyses',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = ReflectionAnalysis;





