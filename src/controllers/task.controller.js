const taskService = require('../services/task.service');

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.clientId, req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({error: error.message});
  } 
};

module.exports = {createTask};