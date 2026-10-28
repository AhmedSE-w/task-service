'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks', 'workflow_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {model: 'workflows', key: 'id'},
      onDelete: 'RESTRICT',
    });
    await queryInterface.sequelize.query(
      'UPDATE tasks SET workflow_id = workflows.id FROM workflows WHERE workflows.client_id = tasks.client_id AND workflows.is_default = true',
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tasks', 'workflow_id');
  },
};
