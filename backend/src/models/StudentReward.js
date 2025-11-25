const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentReward = sequelize.define('StudentReward', {
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
  badgeId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  badgeName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  earnedAt: {
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
  tableName: 'student_rewards',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['badgeId'] }
  ]
});

module.exports = StudentReward;





