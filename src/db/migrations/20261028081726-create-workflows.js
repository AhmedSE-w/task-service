'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workflows', {
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
      name: {type: Sequelize.STRING, allowNull: false},
      is_default: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
      statuses: {type: Sequelize.JSONB, allowNull: false},
      transitions: {type: Sequelize.JSONB, allowNull: false},
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
    await queryInterface.dropTable('workflows');
  },
};
