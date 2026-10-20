const TaskEvent = require('./models/task-event.model');

const createTaskEvent = async (data, transaction) => {
  return TaskEvent.create(data, {transaction});
};

const findTaskEvents = async (taskId) => {
  return TaskEvent.findAll({
    where: {task_id: taskId},
    order: [['createdAt', 'ASC']],
  });
};

module.exports = {createTaskEvent, findTaskEvents};
