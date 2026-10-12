'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('task_events', {
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
      actor_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      from_value: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      to_value: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('task_events');
  },
};
