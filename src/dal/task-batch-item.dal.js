const TaskBatchItem = require('./models/task-batch-item.model');

const createItems = async (items, transaction) => {
  return TaskBatchItem.bulkCreate(items, {transaction});
};

const findItems = async (taskId) => {
  return TaskBatchItem.findAll({where: {task_id: taskId}, order: [['createdAt', 'ASC']]});
};

const findOneItem = async (where) => {
  return TaskBatchItem.findOne({where});
};

const updateItem = async (item, changes, transaction) => {
  return item.update(changes, {transaction});
};

module.exports = {createItems, findItems, findOneItem, updateItem};
