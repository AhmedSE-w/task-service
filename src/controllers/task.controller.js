const taskService = require('../services/task.service');

const TEMP_CLIENT_ID = 'a10a4bfe-3595-4150-8f2a-77387f8f9623';

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(TEMP_CLIENT_ID, req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({error: error.message});
  } 
};

module.exports = {createTask};