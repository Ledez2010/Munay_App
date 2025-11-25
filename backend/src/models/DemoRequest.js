const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DemoRequest = sequelize.define('DemoRequest', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  school: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'contacted', 'completed'),
    defaultValue: 'pending'
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
  tableName: 'demo_requests',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['status'] }
  ]
});

module.exports = DemoRequest;





