const {DataTypes} = require('sequelize');
const sequelize = require('../../config/database');

const Task = sequelize.define('Task', {
  id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      client_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {model: 'clients', key: 'id'},
        onDelete: 'CASCADE',
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {model: 'projects', key: 'id'},
        onDelete: 'SET NULL',
      },
      task_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'to_do',
      },
      priority: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'medium',
        validate: {isIn: [['low', 'medium', 'high', 'urgent']]},
      },
      assignee_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reviewer_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      target_kind: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      item_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      item_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
}, {
  tableName: "tasks",
  timestamps: true,
  underscored: true,
});

module.exports = Task;