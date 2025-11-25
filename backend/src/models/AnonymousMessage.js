const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AnonymousMessage = sequelize.define('AnonymousMessage', {
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
  studentClassCode: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'code'
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'anonymous_messages',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['studentClassCode'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = AnonymousMessage;



