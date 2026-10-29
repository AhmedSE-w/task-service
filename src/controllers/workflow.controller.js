const workflowService = require('../services/workflow.service');

const createWorkflow = async (req, res) => {
  try {
    const workflow = await workflowService.createWorkflow(req.clientId, req.body);
    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

module.exports = {createWorkflow};
