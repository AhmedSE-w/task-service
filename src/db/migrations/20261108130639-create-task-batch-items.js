'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('task_batch_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      task_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {model: 'tasks', key: 'id'},
        onDelete: 'CASCADE',
      },
      client_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {model: 'clients', key: 'id'},
        onDelete: 'CASCADE',
      },
      item_type: {type: Sequelize.STRING, allowNull: false},
      item_id: {type: Sequelize.STRING, allowNull: false},
      decision: {type: Sequelize.STRING, allowNull: false, defaultValue: 'pending'},
      decided_by: {type: Sequelize.STRING, allowNull: true},
      reason: {type: Sequelize.TEXT, allowNull: true},
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
    await queryInterface.dropTable('task_batch_items');
  },
};
