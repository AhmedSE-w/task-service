const TaskComment = require('./models/task-comment.model');

const createTaskComment = async (data, transaction) => {
  return TaskComment.create(data, {transaction});
};

const findTaskComments = async (taskId) => {
  return TaskComment.findAll({
    where: {task_id: taskId},
    order: [['createdAt', 'ASC']],
  });
};

module.exports = {createTaskComment, findTaskComments};
