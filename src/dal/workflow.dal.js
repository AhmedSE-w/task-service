const Workflow = require('./models/workflow.model');

const findDefaultWorkflow = async (clientId, transaction) => {
  return Workflow.findOne({where: {client_id: clientId, is_default: true}, transaction});
};

const createWorkflow = async (data, transaction) => {
  return Workflow.create(data, {transaction});
};

const findWorkflowById = async (id) => {
  return Workflow.findByPk(id);
};

const findClientWorkflow = async (clientId, id, transaction) => {
  return Workflow.findOne({where: {id, client_id: clientId}, transaction});
};

module.exports = {findDefaultWorkflow, createWorkflow, findWorkflowById, findClientWorkflow};
