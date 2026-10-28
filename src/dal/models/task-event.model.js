const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TaskEvent = sequelize.define('TaskEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  task_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  actor_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  from_value: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  to_value: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'task_events',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

module.exports = TaskEvent;