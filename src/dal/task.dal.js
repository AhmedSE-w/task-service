const Task = require('./models/task.model');

const createTask = async (data, transaction) => {
  return Task.create(data, {transaction});
};

const findTasks = async (where) => {
  return Task.findAll({where});
};

const findOneTask = async (where) => {
  return Task.findOne({where});
};

const updateTask = async (task, changes, transaction) => {
  return task.update(changes, {transaction});
};

module.exports = {createTask, findTasks, findOneTask, updateTask};