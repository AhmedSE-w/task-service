const {DataTypes} = require('sequelize');
const sequelize = require('../../config/database');

const TaskBatchItem = sequelize.define(
  'TaskBatchItem',
  {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    task_id: {type: DataTypes.UUID, allowNull: false},
    client_id: {type: DataTypes.UUID, allowNull: false},
    item_type: {type: DataTypes.STRING, allowNull: false},
    item_id: {type: DataTypes.STRING, allowNull: false},
    decision: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {isIn: [['pending', 'approved', 'rejected']]},
    },
    decided_by: {type: DataTypes.STRING, allowNull: true},
    reason: {type: DataTypes.TEXT, allowNull: true},
  },
  {tableName: 'task_batch_items', timestamps: true, underscored: true},
);

module.exports = TaskBatchItem;
