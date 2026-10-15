const Task = require('./models/task.model');

const createTask = async (data) => {
  return Task.create(data);
};

const findTasks = async (where) => {
  return Task.findAll({where});
};

const findOneTask = async (where) => {
  return Task.findOne({where});
};

const updateTask = async (task, changes) => {
  return task.update(changes);
};

module.exports = {createTask, findTasks, findOneTask, updateTask};