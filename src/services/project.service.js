const projectDal = require('../dal/project.dal');
const taskDal = require('../dal/task.dal');

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

module.exports = {createProject, listProjects, getProject, getProjectDetails, updateProject};
