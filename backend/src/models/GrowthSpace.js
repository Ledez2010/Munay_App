const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GrowthSpace = sequelize.define('GrowthSpace', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  teacherId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  studentIds: {
    type: DataTypes.JSON,
    defaultValue: []
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
  tableName: 'growth_spaces',
  timestamps: true,
  indexes: [
    { fields: ['teacherId'] }
  ]
});

module.exports = GrowthSpace;





