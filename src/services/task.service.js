const taskDal = require('../dal/task.dal');
const taskEventDal = require('../dal/task-event.dal');
const sequelize = require('../config/database');
const ALLOWED_FILTERS = ['status', 'assignee_id', 'project_id', 'item_type', 'item_id'];
const EDITABLE_FIELDS = ['title', 'priority', 'due_date'];
const taskCommentDal = require('../dal/task-comment.dal');
const workflowDal = require('../dal/workflow.dal');
const DEFAULT_WORKFLOW = require('./default-workflow');
const taskBatchItemDal = require('../dal/task-batch-item.dal');
const {chunk} = require('./split');
const {Op} = require('sequelize');

const createTask = async (clientId, userId, data, outer) => {
  const {target, ...fields} = data;

  if (target.kind === 'item' && target.items.length !== 1) {
    const error = new Error('An item task needs exactly one item');
    error.status = 400;
    throw error;
  }

  const columns =
    target.kind === 'item'
      ? {target_kind: 'item', item_type: target.items[0].type, item_id: target.items[0].id}
      : {target_kind: 'batch'};

  const run = async (transaction) => {
    let workflow = fields.workflow_id
      ? await workflowDal.findClientWorkflow(clientId, fields.workflow_id, transaction)
      : await workflowDal.findDefaultWorkflow(clientId, transaction);

    if (fields.workflow_id && !workflow) {
      const error = new Error('Workflow not found');
      error.status = 400;
      throw error;
    }

    if (!workflow) {
      workflow = await workflowDal.createWorkflow(
        {...DEFAULT_WORKFLOW, client_id: clientId, is_default: true},
        transaction,
      );
    }
    const task = await taskDal.createTask(
      {
        ...fields,
        ...columns,
        client_id: clientId,
        workflow_id: workflow.id,
        status: workflow.statuses[0],
      },
      transaction,
    );

    await taskEventDal.createTaskEvent(
      {
        task_id: task.id,
        actor_id: userId,
        client_id: clientId,
        type: 'task.created',
      },
      transaction,
    );

    if (target.kind !== 'batch') {
      return task;
    }

    const items = await taskBatchItemDal.createItems(
      target.items.map((item) => ({
        task_id: task.id,
        client_id: clientId,
        item_type: item.type,
        item_id: item.id,
      })),
      transaction,
    );

    return {...task.toJSON(), items};
  };
  return outer ? run(outer) : sequelize.transaction(run);
};

const createTasksBulk = async (clientId, userId, data) => {
  const kind = data.batch_size ? 'batch' : 'item';
  const groups = data.batch_size
    ? chunk(data.items, data.batch_size)
    : data.items.map((item) => [item]);

  return sequelize.transaction(async (transaction) => {
    const tasks = [];
    for (const group of groups) {
      tasks.push(
        await createTask(
          clientId,
          userId,
          {...data.task, target: {kind, items: group}},
          transaction,
        ),
      );
    }
    return tasks;
  });
};

const listTasks = async (clientId, userId, userRole, filters) => {
  const where = {client_id: clientId};

  for (const key of ALLOWED_FILTERS) {
    if (filters[key]) {
      where[key] = filters[key];
    }
  }

  if (userRole === 'worker') {
    where[Op.or] = [{assignee_id: userId}, {reviewer_id: userId}];
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

const getVisibleTask = async (clientId, userId, userRole, taskId) => {
  const task = await getTask(clientId, taskId);
  if (userRole === 'worker' && task.assignee_id !== userId && task.reviewer_id !== userId) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return task;
};

const showTask = async (clientId, userId, userRole, taskId) => {
  const task = await getVisibleTask(clientId, userId, userRole, taskId);
  if (task.target_kind !== 'batch') return task;

  const items = await taskBatchItemDal.findItems(task.id);
  return {...task.toJSON(), items};
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
        await taskEventDal.createTaskEvent(
          {
            task_id: task.id,
            actor_id: userId,
            client_id: clientId,
            type: `task.${key}_changed`,
            from_value: task[key],
            to_value: allowed[key],
          },
          transaction,
        );
      }
    }

    return taskDal.updateTask(task, allowed, transaction);
  });
};

const listTaskEvents = async (clientId, userId, userRole, taskId) => {
  await getVisibleTask(clientId, userId, userRole, taskId);
  return taskEventDal.findTaskEvents(taskId);
};

const addComment = async (clientId, userId, userRole, taskId, data) => {
  const task = await getVisibleTask(clientId, userId, userRole, taskId);

  return sequelize.transaction(async (transaction) => {
    const comment = await taskCommentDal.createTaskComment(
      {
        task_id: task.id,
        author_id: userId,
        client_id: clientId,
        body: data.body,
      },
      transaction,
    );

    await taskEventDal.createTaskEvent(
      {
        task_id: task.id,
        actor_id: userId,
        client_id: clientId,
        type: 'task.comment_added',
      },
      transaction,
    );

    return comment;
  });
};

const listComments = async (clientId, userId, userRole, taskId) => {
  await getVisibleTask(clientId, userId, userRole, taskId);
  return taskCommentDal.findTaskComments(taskId);
};

const transitionTask = async (clientId, userId, userRole, taskId, to, fields = {}) => {
  const task = await getTask(clientId, taskId);
  const workflow = await workflowDal.findWorkflowById(task.workflow_id);
  const move = workflow.transitions.find((t) => t.from === task.status && t.to === to);
  if (!move) {
    const error = new Error(`Cannot move from ${task.status} to ${to}`);
    error.status = 400;
    throw error;
  }

  const allowed = move.by.some(
    (who) =>
      who === userRole ||
      (who === 'assignee' && userId === task.assignee_id) ||
      (who === 'reviewer' && userId === task.reviewer_id),
  );
  if (!allowed) {
    const error = new Error('You may not make this move');
    error.status = 403;
    throw error;
  }
  if (move.by.includes('reviewer') && userId === task.assignee_id) {
    const error = new Error('You cannot review your own task');
    error.status = 403;
    throw error;
  }
  if (task.target_kind === 'batch' && to === 'in_review') {
    const items = await taskBatchItemDal.findItems(task.id);
    if (items.some((item) => item.decision === 'pending')) {
      const error = new Error('Every item needs a decision before submitting');
      error.status = 400;
      throw error;
    }
  }

  for (const field of move.required || []) {
    if (!fields[field]) {
      const error = new Error(`${field} is required for this move`);
      error.status = 400;
      throw error;
    }
  }

  return sequelize.transaction(async (transaction) => {
    await taskEventDal.createTaskEvent(
      {
        task_id: task.id,
        actor_id: userId,
        client_id: clientId,
        type: 'task.status_changed',
        from_value: task.status,
        to_value: to,
      },
      transaction,
    );

    if (fields.reason) {
      await taskCommentDal.createTaskComment(
        {task_id: task.id, author_id: userId, client_id: clientId, body: fields.reason},
        transaction,
      );
    }

    return taskDal.updateTask(task, {status: to}, transaction);
  });
};

const assignTask = async (clientId, userId, taskId, assigneeId) => {
  const task = await getTask(clientId, taskId);

  return sequelize.transaction(async (transaction) => {
    await taskEventDal.createTaskEvent(
      {
        task_id: task.id,
        actor_id: userId,
        client_id: clientId,
        type: 'task.assigned',
        from_value: task.assignee_id,
        to_value: assigneeId,
      },
      transaction,
    );
    return taskDal.updateTask(task, {assignee_id: assigneeId}, transaction);
  });
};

const decideItem = async (clientId, userId, userRole, taskId, itemId, data) => {
  const task = await getVisibleTask(clientId, userId, userRole, taskId);

  const fail = (status, message) => {
    const error = new Error(message);
    error.status = status;
    throw error;
  };

  if (task.target_kind !== 'batch') fail(400, 'Only batch tasks have items');
  if (task.status !== 'in_progress')
    fail(400, 'Items can only be decided while the task is in progress');
  if (userId !== task.assignee_id) fail(403, 'Only the assignee can decide items');
  if (data.decision === 'rejected' && !data.reason) fail(400, 'A rejected item needs a reason');

  const item = await taskBatchItemDal.findOneItem({id: itemId, task_id: task.id});
  if (!item) fail(404, 'Item not found');

  return sequelize.transaction(async (transaction) => {
    await taskEventDal.createTaskEvent(
      {
        task_id: task.id,
        actor_id: userId,
        client_id: clientId,
        type: 'task.item_decided',
        from_value: item.decision,
        to_value: data.decision,
      },
      transaction,
    );
    return taskBatchItemDal.updateItem(
      item,
      {
        decision: data.decision,
        decided_by: userId,
        reason: data.decision === 'rejected' ? data.reason : null,
      },
      transaction,
    );
  });
};

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  listTaskEvents,
  addComment,
  listComments,
  transitionTask,
  assignTask,
  getVisibleTask,
  decideItem,
  createTasksBulk,
  showTask,
};
