const taskService = require('../services/task.service');

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.clientId, req.userId, req.body);
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

const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.clientId, req.userId, req.params.id, req.body);
    res.json(task);
  } catch (error) {
    res.status(error.status || 400).json({error: error.message});
  }
};

const listTaskEvents = async (req, res) => {
  try {
    const events = await taskService.listTaskEvents(req.clientId, req.params.id);
    res.json(events);
  } catch (error) {
    res.status(error.status || 400).json({error: error.message});
  }
};

const addComment = async (req, res) => {
  try {
    const comment = await taskService.addComment(req.clientId, req.userId, req.params.id, req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(error.status || 400).json({error: error.message});
  }
};

const listComments = async (req, res) => {
  try {
    const comments = await taskService.listComments(req.clientId, req.params.id);
    res.json(comments);
  } catch (error) {
    res.status(error.status || 400).json({error: error.message});
  }
};

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  listTaskEvents,
  addComment,
  listComments,
};
