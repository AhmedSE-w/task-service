const Project = require('./models/project.model');

const createProject = async (data) => {
  return Project.create(data);
};

const findProjects = async (where) => {
  return Project.findAll({where});
};

module.exports = {createProject, findProjects};
