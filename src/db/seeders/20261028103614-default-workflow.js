'use strict';

const OPEN = ['to_do', 'in_progress', 'in_review'];

const DEFAULT_WORKFLOW = {
  name: 'Default',
  statuses: ['to_do', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled'],
  transitions: [
    {from: 'to_do', to: 'in_progress', by: ['assignee']},
    {from: 'in_progress', to: 'in_review', by: ['assignee']},
    {from: 'in_review', to: 'done', by: ['reviewer']},
    {from: 'in_review', to: 'in_progress', by: ['reviewer'], required: ['reason']},
    ...OPEN.map((from) => ({from, to: 'blocked', by: ['manager']})),
    ...OPEN.map((from) => ({from, to: 'cancelled', by: ['manager']})),
  ],
};

module.exports = {
  async up(queryInterface) {
    const [clients] = await queryInterface.sequelize.query(
      "SELECT id FROM clients WHERE name = 'Portal'",
    );
    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM workflows WHERE client_id = :clientId AND is_default = true',
      {replacements: {clientId: clients[0].id}},
    );
    if (existing.length > 0) return;

    await queryInterface.bulkInsert('workflows', [
      {
        client_id: clients[0].id,
        name: DEFAULT_WORKFLOW.name,
        is_default: true,
        statuses: JSON.stringify(DEFAULT_WORKFLOW.statuses),
        transitions: JSON.stringify(DEFAULT_WORKFLOW.transitions),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('workflows', {name: DEFAULT_WORKFLOW.name});
  },
};
