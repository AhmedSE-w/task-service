const projectService = require('../services/project.service');

const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.clientId, req.userId, req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

const listProjects = async (req, res) => {
  const projects = await projectService.listProjects(req.clientId);
  res.json(projects);
};

module.exports = {createProject, listProjects};
