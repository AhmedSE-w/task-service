const TaskEvent = require('./models/task-event.model');

const createTaskEvent = async (data, transaction) => {
  return TaskEvent.create(data, {transaction});
};

module.exports = {createTaskEvent};