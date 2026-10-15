const Task = require('./models/task.model');

const createTask = async (data) => {
  return Task.create(data);
};

const findTasks = async (where) => {
  return Task.findAll({where});
};

module.exports = {createTask, findTasks};