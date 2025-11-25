const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherNotification = sequelize.define('TeacherNotification', {
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
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('survey', 'activity', 'message'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
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
  tableName: 'teacher_notifications',
  timestamps: true,
  indexes: [
    { fields: ['teacherId'] },
    { fields: ['studentId'] },
    { fields: ['read'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = TeacherNotification;



