const OPEN = ['to_do', 'in_progress', 'in_review'];

const DEFAULT_WORKFLOW = {
  name: 'Default',
  statuses: ['to_do', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled'],
  transitions: [
    {from: 'to_do', to: 'in_progress', by: ['assignee']},
    {from: 'in_progress', to: 'in_review', by: ['assignee']},
    {from: 'in_review', to: 'done', by: ['reviewer', 'manager', 'admin']},
    {
      from: 'in_review',
      to: 'in_progress',
      by: ['reviewer', 'manager', 'admin'],
      required: ['reason'],
    },
    ...OPEN.map((from) => ({from, to: 'blocked', by: ['manager', 'admin']})),
    ...OPEN.map((from) => ({from, to: 'cancelled', by: ['manager', 'admin']})),
  ],
};

module.exports = DEFAULT_WORKFLOW;
