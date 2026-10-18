const taskDal = require('../dal/task.dal');
const taskEventDal = require('../dal/task-event.dal');
const sequelize = require('../config/database');
const ALLOWED_FILTERS = ['status', 'assignee_id', 'project_id', 'item_type', 'item_id'];
const EDITABLE_FIELDS = ['title', 'priority', 'due_date'];
const taskCommentDal = require('../dal/task-comment.dal');

const createTask = async (clientId, userId, data) => {
  if (data.target_kind === 'item' && (!data.item_type || !data.item_id)) {
    throw new Error('item_type and item_id are required for an item task');
  }

  return sequelize.transaction(async (transaction) => {
    const task = await taskDal.createTask({...data, client_id: clientId}, transaction);

    await taskEventDal.createTaskEvent({
      task_id: task.id,
      actor_id: userId,
      type: 'created',
    }, transaction);

    return task;
  });
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

  const updateTask = async (clientId, userId, taskId, changes) => {
    const task = await getTask(clientId, taskId);

    const allowed = {};
    for (const key of EDITABLE_FIELDS) {
      if (changes[key] !== undefined) {
        allowed[key] = changes[key];
      }
    }

    return sequelize.transaction(async (transaction) => {
      for (const key of Object.keys(allowed)) {
        if (task[key] !== allowed[key]) {
          await taskEventDal.createTaskEvent({
            task_id: task.id,
            actor_id: userId,
            type: `${key}_changed`,
            from_value: task[key],
            to_value: allowed[key],
          }, transaction);
        }
      }

      return taskDal.updateTask(task, allowed, transaction);
    });
  };

  const listTaskEvents = async (clientId, taskId) => {
    await getTask(clientId, taskId);
    return taskEventDal.findTaskEvents(taskId);
  };

  const addComment = async (clientId, userId, taskId, data) => {
    const task = await getTask(clientId, taskId);

    return sequelize.transaction(async (transaction) => {
      const comment = await taskCommentDal.createTaskComment({
        task_id: task.id,
        author_id: userId,
        body: data.body,
      }, transaction);

      await taskEventDal.createTaskEvent({
        task_id: task.id,
        actor_id: userId,
        type: 'comment_added',
      }, transaction);

      return comment;
    });
  };

  const listComments = async (clientId, taskId) => {
    await getTask(clientId, taskId);
    return taskCommentDal.findTaskComments(taskId);
  };

module.exports = {createTask, listTasks, getTask, updateTask, listTaskEvents, addComment, listComments};