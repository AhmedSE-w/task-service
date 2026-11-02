const projectDal = require('../dal/project.dal');
const taskDal = require('../dal/task.dal');
const taskEventDal = require('../dal/task-event.dal');
const sequelize = require('../config/database');
const {splitCounts} = require('./split');

const createProject = async (clientId, userId, data) => {
  return projectDal.createProject({owner_id: userId, ...data, client_id: clientId});
};

const listProjects = async (clientId) => {
  return projectDal.findProjects({client_id: clientId});
};

const getProject = async (clientId, projectId) => {
  const project = await projectDal.findOneProject({id: projectId, client_id: clientId});
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }
  return project;
};

const getProjectDetails = async (clientId, projectId) => {
  const project = await getProject(clientId, projectId);
  const tasks = await taskDal.findTasks({client_id: clientId, project_id: projectId});

  const progress = {};
  for (const task of tasks) {
    progress[task.status] = (progress[task.status] || 0) + 1;
  }

  return {...project.toJSON(), progress};
};

const EDITABLE_FIELDS = ['name', 'description', 'owner_id', 'start_date', 'due_date', 'status'];

const updateProject = async (clientId, projectId, changes) => {
  const project = await getProject(clientId, projectId);

  const allowed = {};
  for (const key of EDITABLE_FIELDS) {
    if (changes[key] !== undefined) {
      allowed[key] = changes[key];
    }
  }

  return projectDal.updateProject(project, allowed);
};

const assignProjectTasks = async (clientId, userId, projectId, splits) => {
  const project = await getProject(clientId, projectId);

  let totalPercent = 0;
  for (const split of splits) {
    totalPercent = totalPercent + split.percent;
  }
  if (totalPercent !== 100) {
    const error = new Error('Percentages must add up to 100');
    error.status = 400;
    throw error;
  }
  const tasks = await taskDal.findTasks({
    client_id: clientId,
    project_id: project.id,
    assignee_id: null,
  });
  const counts = splitCounts(tasks.length, splits);
  const owners = [];
  for (let i = 0; i < splits.length; i++) {
    for (let n = 0; n < counts[i]; n++) {
      owners.push(splits[i].user_id);
    }
  }
  return sequelize.transaction(async (transaction) => {
    for (let i = 0; i < tasks.length; i++) {
      await taskEventDal.createTaskEvent(
        {
          task_id: tasks[i].id,
          actor_id: userId,
          client_id: clientId,
          type: 'task.assigned',
          from_value: null,
          to_value: owners[i],
        },
        transaction,
      );
      await taskDal.updateTask(tasks[i], {assignee_id: owners[i]}, transaction);
    }

    return splits.map((split, i) => ({user_id: split.user_id, count: counts[i]}));
  });
};

module.exports = {
  createProject,
  listProjects,
  getProject,
  getProjectDetails,
  updateProject,
  assignProjectTasks,
};
