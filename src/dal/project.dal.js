const Project = require('./models/project.model');

const createProject = async (data) => {
  return Project.create(data);
};

const findProjects = async (where) => {
  return Project.findAll({where});
};

const findOneProject = async (where) => {
  return Project.findOne({where});
};

const updateProject = async (project, changes, transaction) => {
  return project.update(changes, {transaction});
};

module.exports = {createProject, findProjects, findOneProject, updateProject};
