const workflowDal = require('../dal/workflow.dal');

const createWorkflow = async (clientId, data) => {
  const unknown = data.transitions.find(
    (move) => !data.statuses.includes(move.from) || !data.statuses.includes(move.to),
  );
  if (unknown) {
    throw new Error(`Unknown status in move ${unknown.from} -> ${unknown.to}`);
  }

  return workflowDal.createWorkflow({...data, client_id: clientId});
};

module.exports = {createWorkflow};
