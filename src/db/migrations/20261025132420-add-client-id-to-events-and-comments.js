'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task_events', 'client_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {model: 'clients', key: 'id'},
      onDelete: 'CASCADE',
    });
    await queryInterface.sequelize.query(
      'UPDATE task_events SET client_id = tasks.client_id FROM tasks WHERE tasks.id = task_events.task_id',
    );
    await queryInterface.changeColumn('task_events', 'client_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    await queryInterface.addColumn('task_comments', 'client_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {model: 'clients', key: 'id'},
      onDelete: 'CASCADE',
    });
    await queryInterface.sequelize.query(
      'UPDATE task_comments SET client_id = tasks.client_id FROM tasks WHERE tasks.id = task_comments.task_id',
    );
    await queryInterface.changeColumn('task_comments', 'client_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('task_events', 'client_id');
    await queryInterface.removeColumn('task_comments', 'client_id');
  },
};
