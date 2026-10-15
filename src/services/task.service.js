const taskDal = require('../dal/task.dal');
const ALLOWED_FILTERS = ['status', 'assignee_id', 'project_id', 'item_type', 'item_id'];

const createTask = async (clientId, data) => {
  if (data.target_kind === 'item' && (!data.item_type || !data.item_id)) {
    throw new Error('item_type and item_id are required for an item task');
  }

  return taskDal.createTask({...data, client_id: clientId});
};


const listTasks = async (clientId, filters) => {
    const where = {client_id: clientId};

    for (const key of ALLOWED_FILTERS) {
      if (filters[key]) {
        where[key] = filters[key];
      }
    }

    return taskDal.findTasks(where);
  };

  const getTask = async (clientId, taskId) => {
    const task = await taskDal.findOneTask({id: taskId, client_id: clientId});

    if (!task) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }

    return task;
  };

module.exports = {createTask, listTasks, getTask};