const TaskBatchItem = require('./models/task-batch-item.model');

const createItems = async (items, transaction) => {
  return TaskBatchItem.bulkCreate(items, {transaction});
};

const findItems = async (taskId) => {
  return TaskBatchItem.findAll({where: {task_id: taskId}, order: [['createdAt', 'ASC']]});
};

module.exports = {createItems, findItems};
