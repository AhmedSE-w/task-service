const Task = require('./models/task.model');

const createTask = async (data) => {
  return Task.create(data);
};

module.exports = {createTask};