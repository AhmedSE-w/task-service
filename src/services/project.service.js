const projectDal = require('../dal/project.dal');

const createProject = async (clientId, userId, data) => {
  return projectDal.createProject({owner_id: userId, ...data, client_id: clientId});
};

const listProjects = async (clientId) => {
  return projectDal.findProjects({client_id: clientId});
};

module.exports = {createProject, listProjects};
