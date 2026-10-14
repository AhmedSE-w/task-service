const taskDal = require('../dal/task.dal');

const createTask = async (clientId, data) => {
  if (data.target_kind === 'item' && (!data.item_type || !data.item_id)) {
    throw new Error('item_type and item_id are required for an item task');
  }

  return taskDal.createTask({...data, client_id: clientId});
};


module.exports = {createTask};