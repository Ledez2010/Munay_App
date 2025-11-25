const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SurveyResponse = sequelize.define('SurveyResponse', {
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
  surveyId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surveyTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  responses: {
    type: DataTypes.JSON,
    allowNull: false
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true
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
  tableName: 'survey_responses',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['surveyId'] },
    { fields: ['completedAt'] }
  ]
});

module.exports = SurveyResponse;

