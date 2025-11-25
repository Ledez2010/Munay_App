const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentActivity = sequelize.define('StudentActivity', {
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
  activityId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activityTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activityType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  responses: {
    type: DataTypes.JSON,
    allowNull: true
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  isActivityTest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isSimulator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  tableName: 'student_activities',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['activityId'] },
    { fields: ['completedAt'] }
  ]
});

module.exports = StudentActivity;



