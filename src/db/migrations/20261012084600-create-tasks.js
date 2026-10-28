'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      client_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {model: 'clients', key: 'id'},
        onDelete: 'CASCADE',
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {model: 'projects', key: 'id'},
        onDelete: 'SET NULL',
      },
      task_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'to_do',
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'medium',
      },
      assignee_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reviewer_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      target_kind: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      item_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      item_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tasks');
  },
};