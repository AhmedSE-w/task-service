const workflowDal = require('../dal/workflow.dal');

const createWorkflow = async (clientId, data) => {
  return workflowDal.createWorkflow({...data, client_id: clientId});
};

module.exports = {createWorkflow};
