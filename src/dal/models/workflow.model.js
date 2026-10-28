const {DataTypes} = require('sequelize');
const sequelize = require('../../config/database');

const Workflow = sequelize.define(
  'Workflow',
  {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    client_id: {type: DataTypes.UUID, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false},
    is_default: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    statuses: {type: DataTypes.JSONB, allowNull: false},
    transitions: {type: DataTypes.JSONB, allowNull: false},
  },
  {tableName: 'workflows', timestamps: true, underscored: true},
);

module.exports = Workflow;
