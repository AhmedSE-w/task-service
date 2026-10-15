const taskService = require('../services/task.service');

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.clientId, req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({error: error.message});
  } 
};

const listTasks = async (req, res) => {
  const tasks = await taskService.listTasks(req.clientId, req.query);
  res.json(tasks);
};

const getTask = async (req, res) => {
  try {
    const task = await taskService.getTask(req.clientId, req.params.id);
    res.json(task);
  } catch (error) {
    res.status(error.status || 400).json({error: error.message});
  }
};

module.exports = {createTask, listTasks, getTask};