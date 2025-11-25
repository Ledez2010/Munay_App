const { sequelize } = require('../config/database');
const User = require('./User');
const Class = require('./Class');
const SurveyResponse = require('./SurveyResponse');
const StudentActivity = require('./StudentActivity');
const AnonymousMessage = require('./AnonymousMessage');
const TeacherNotification = require('./TeacherNotification');
const GrowthSpace = require('./GrowthSpace');
const StudentReward = require('./StudentReward');
const ReflectionAnalysis = require('./ReflectionAnalysis');
const DemoRequest = require('./DemoRequest');
const Client = require('./Client');

// Define relationships
User.belongsTo(Class, { foreignKey: 'classCode', targetKey: 'code', as: 'class' });
Class.hasMany(User, { foreignKey: 'classCode', sourceKey: 'code', as: 'students' });
Class.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// Client relationships
User.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(User, { foreignKey: 'clientId', as: 'users' });

SurveyResponse.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
StudentActivity.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
AnonymousMessage.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
AnonymousMessage.belongsTo(Class, { foreignKey: 'studentClassCode', targetKey: 'code', as: 'class' });

TeacherNotification.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
TeacherNotification.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

GrowthSpace.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
GrowthSpace.belongsToMany(User, { 
  through: 'GrowthSpaceStudents', 
  foreignKey: 'spaceId', 
  otherKey: 'studentId',
  as: 'students' 
});

StudentReward.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
ReflectionAnalysis.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

module.exports = {
  sequelize,
  User,
  Class,
  SurveyResponse,
  StudentActivity,
  AnonymousMessage,
  TeacherNotification,
  GrowthSpace,
  StudentReward,
  ReflectionAnalysis,
  DemoRequest,
  Client
};





